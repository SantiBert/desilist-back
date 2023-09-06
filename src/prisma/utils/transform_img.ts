import AWS from 'aws-sdk';
import config from '@/config';
import prisma from '@/db';
import {ImageManip, ImageFormat} from '@/utils/imageManip';

const ACCESS_KEY_ID = config.aws.s3.access_key_id;
const SECRET_ACCESS_KEY = config.aws.s3.secret_access_key;
const BUCKET = config.aws.s3.bucket;
const ENV = config.environment;

async function transformImgs(): Promise<void> {
    const s3 = new AWS.S3({accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY}); 
    const bucket = BUCKET;
    const bucketACL = 'public-read';
    const user = prisma.user;
    const users = await user.findMany();
    const imageManip = new ImageManip();

    for (const usr of users) {
        try {
            const params = {
                Bucket: bucket,
                Key: usr.id
            };
            const res: AWS.S3.GetObjectOutput = await new Promise((resolve, reject) => {
                s3.getObject(params, function (err: any, data: any) {
                if (err) {
                    reject(err);
                }
                resolve(data);
                });
            });
            console.log(res);

            // if the image exists upload it
            if (res.Body) {
                const imgFmt = ImageFormat.webp;
                imageManip.setImage(res.Body as Buffer);
                await imageManip.convert(imgFmt);
                const processed = imageManip.getProcessed();
                const params = {
                    ACL: bucketACL,
                    Bucket: bucket,
                    Key: `user_img_${usr.id}_00_0x0_${imgFmt}_${ENV}`,
                    Body: processed.converted,
                    // .ContentEncoding: contentOpts.contentEncoding,
                    ContentType: imgFmt
                  };
                const url = await new Promise((resolve, reject) => {
                    s3.upload(params, function (err: any, data: any) {
                        if (err) {
                            reject(err);
                        }
                        console.log(`File uploaded successfully ${data.Location}`);
                        resolve(data.Location);
                    });
                });
                // update user on db
                await user.update({data: {photo: url}, where: {id: usr.id}});
            }
        } catch (err) {
            // console.log(user);
            if (err.statusCode === 404) {
                console.log('Image not found ' + usr.id);
            } else {
                console.log(err);
            }
        }
    }
}

transformImgs()
  .then(() => {
    console.log('Images transformed');
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    throw e;
  });
