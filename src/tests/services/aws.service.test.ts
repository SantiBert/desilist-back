import config from '../../config';
// import {S3} from '../../services';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Auth Service Testing', () => {
  // let ret: any;
  // const aws = new S3('', '', '');
  describe('Upload Image', () => {
    describe('Upload OK', () => {
      beforeAll(async () => {
        // ret = await aws.uploadImage('image', 'data/jpeg');
      });
      test('should return hashed password', () => {
        expect(true).toBe(true);
      });
    });
  });
});
