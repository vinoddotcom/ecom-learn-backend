declare module 'cloudinary' {
  export interface ConfigOptions {
    cloud_name: string;
    api_key: string;
    api_secret: string;
  }

  export interface CloudinaryV2 {
    config(options: ConfigOptions): void;
    uploader: unknown;
  }

  export const v2: CloudinaryV2;
}
