import sharp from 'sharp';

export type ImageUrl = string;

export type Image =
  | string
  | Buffer
  | Uint8Array
  | Uint8ClampedArray
  | Int8Array
  | Uint16Array
  | Int16Array
  | Uint32Array
  | Int32Array
  | Float32Array
  | Float64Array;

type ImageSize = {
  width: number;
  height: number;
};

type ImageResize = {
  size: string;
  image: Image;
};

type ImageContent = {
  contentEncoding: string;
  contentType: string;
  convert?: ImageFormat | null;
  sizes?: ImageSize[];
};

type ProcessedImage = {
  converted: Image;
  resized: ImageResize[];
};

export enum ImageFormat {
  webp = 'webp',
  jpg = 'jpg'
}

export abstract class ImageBucket {
  public abstract upload(
    path: string,
    name: string,
    content: string,
    contentOpts: ImageContent
  ): Promise<ImageUrl>;

  public abstract remove(fileName: string): Promise<void>;
}

export class ImageManip {
  public constructor(image?: Image) {
    this.image = image;
    this.converted = image;
    this.resized = [];
  }

  private image: Image;
  private converted: Image;
  private resized: ImageResize[];

  public setImage(image?: Image): void {
    this.image = image;
    this.converted = image;
    this.resized = [];
  }

  public getImage(): Image {
    return this.image;
  }

  public async convert(format: ImageFormat): Promise<void> {
    if (!this.image) {
      return;
    }
    this.converted = await sharp(this.image)[format]().toBuffer();
  }

  public async resize(sizes: ImageSize[]): Promise<void> {
    if (!this.converted) {
      return;
    }
    for (const size of sizes) {
      this.resized.push({
        size: `${size.width}x${size.height}`,
        image: await sharp(this.converted)
          .resize(size.width, size.height)
          .toBuffer()
      });
    }
  }

  public getProcessed(): ProcessedImage {
    return {
      converted: this.converted,
      resized: this.resized
    };
  }
}
