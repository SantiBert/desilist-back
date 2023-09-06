import AWS from 'aws-sdk';
import {ImageBucket, ImageUrl, Image} from '@/utils/imageManip';
import config from '@/config';

export class S3 extends ImageBucket {
  private s3: AWS.S3;
  private bucketName: string;
  private bucketACL: string;

  public constructor(
    bucketName: string,
    accessKeyId: string,
    secretAccessKey: string,
    bucketACL = 'public-read'
  ) {
    super();
    this.s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey
    });
    this.bucketName = bucketName;
    this.bucketACL = bucketACL;
  }

  public async upload(
    path: string,
    name: string,
    content: Image,
    contentOpts = {
      contentEncoding: 'base64',
      contentType: 'jpg'
    }
  ): Promise<ImageUrl> {
    const params = {
      ACL: this.bucketACL,
      Bucket: this.bucketName,
      Key: path + name,
      Body: content,
      // .ContentEncoding: contentOpts.contentEncoding,
      ContentType: `image/${contentOpts.contentType}`
    };

    // uploading files to the bucket
    return await new Promise((resolve, reject) => {
      this.s3.upload(params, function (err: any, data: any) {
        if (err) {
          reject(err);
        }
        // console.log(`File uploaded successfully. ${data.Location}`);
        resolve(data.Location);
      });
    });
  }

  public async remove(name: string): Promise<any> {
    const params = {
      Bucket: this.bucketName,
      Key: name
    };
    const paramsDelete = {
      Bucket: this.bucketName,
      Key: name,
      VersionId: ''
    }

    const headObject: any= await new Promise((resolve, reject) => {
      this.s3.headObject(params, function (err: any, data: any) {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(data);
      });
    });
    paramsDelete['VersionId'] = headObject.VersionId;
    
    return await new Promise((resolve, reject) => {
      this.s3.deleteObject({
        ...params,
        
      }
        , function (err: any, data: any) {
        if (err) {
          reject(err);
        }
        // console.log(`File uploaded successfully. ${data.Location}`);
        resolve(data);
      });
    });
  }

  public async getMetaData(name: string): Promise<any> {
    const params = {
      Bucket: this.bucketName,
      Key: name
    };

    return await new Promise((resolve, reject) => {
      this.s3.headObject(params, function (err: any, data: any) {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(data);
      });
    });
  }

  public async getObjectslistFromFolder(folder:string): Promise<any> {
    const params = {
      Bucket: this.bucketName,
      Prefix: folder 
    };
    
    return await new Promise((resolve, reject) => {
      this.s3.listObjectsV2(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(data);
      });
    });
  }

  public async downloadFile(pathfile: string): Promise<any> {
    const params = {
      Bucket: this.bucketName,
      Key: pathfile,
    };
    return await new Promise((resolve, reject) => {
      this.s3.getObject(params, (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resolve(data);
      });
    });
  }

  public async renameFile(fileKey: string, newFileKey: string): Promise<any> {
    const params = {
      ACL: this.bucketACL,
      Bucket: this.bucketName,
      CopySource: fileKey,
      Key: newFileKey
    };
    const paramsDelete = {
      Bucket: this.bucketName, 
      Key: fileKey.replace(`https://${this.bucketName}.s3.amazonaws.com/`,''), 
      VersionId: ''
    }
    const paramsHead = {
      Bucket: this.bucketName,
      Key: fileKey.replace(`https://${this.bucketName}.s3.amazonaws.com/`,'')
    }
    
    try {
      const headObject: any= await new Promise((resolve, reject) => {
        this.s3.headObject(paramsHead, function (err: any, data: any) {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve(data);
        });
      });
      paramsDelete['VersionId'] = headObject.VersionId;
      await new Promise((resolve, reject) => {
        this.s3.copyObject(params, (err, data) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve(data);
        })
      });
      await new Promise((resolve, reject) => {
        this.s3.deleteObject(paramsDelete, (err, data) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve(data);
        })
       
      });
    } catch {

    }
    
  }

  public async copyFile(origin: string, destiny: string): Promise<any> {
    const params = {
      ACL: this.bucketACL,
      Bucket: this.bucketName,
      CopySource: origin,
      Key: destiny
    };   
    return await new Promise((resolve, reject) => {
      this.s3.copyObject(params, (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resolve(data);
      })
    });
  }
}

export class AWSService {
  public S3: S3;
  public constructor() {
    this.S3 = new S3(
      config.aws.s3.bucket,
      config.aws.s3.access_key_id,
      config.aws.s3.secret_access_key
    );
  }
}
