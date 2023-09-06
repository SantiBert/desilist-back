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
    const listing = prisma.listing;
    const listings = await listing.findMany({select: {id: true, images: true}});
    const imageManip = new ImageManip();

    for (const lst of listings) {
        if (lst.images === null || !lst.images.length) continue;
        const formatedImages = [];
        let idx = 0;
        for (const img of lst.images) {
            const img_split = img.split('/');
            const name = img_split[img_split.length - 1];
            try {
                const params = {
                    Bucket: bucket,
                    Key: name
                };
                const res: AWS.S3.GetObjectOutput = await new Promise((resolve, reject) => {
                    s3.getObject(params, function (err: any, data: any) {
                    if (err) {
                        reject(err);
                    }
                    resolve(data);
                    });
                });

                // if the image exists upload it
                if (res.Body) {
                    const imgFmt = ImageFormat.webp;
                    imageManip.setImage(res.Body as Buffer);
                    await imageManip.convert(imgFmt);
                    const processed = imageManip.getProcessed();
                    const params = {
                        ACL: bucketACL,
                        Bucket: bucket,
                        Key: `listing_img_${lst.id}_${idx}0_0x0_${imgFmt}_${ENV}`,
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
                    console.log(idx + ': ' + url);
                    // formatedImages.push({[idx++]: url});
                    formatedImages.push(url);
                    ++idx;
                }
            } catch (err) {
                // console.log(lst);
                if (err.statusCode === 404) {
                    console.log('Image not found ' + lst.id);
                } else {
                    console.log(err);
                }
            }
        }
        // update listing on db
        await listing.update({data: {images: formatedImages}, where: {id: lst.id}});
    }
}

transformImgs()
  .then(() => {
    console.log('Listing images transformed');
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    throw e;
  });
