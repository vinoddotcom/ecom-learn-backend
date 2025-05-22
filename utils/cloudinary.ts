import { v2 as cloudinary } from "cloudinary";

// CloudinaryUploadResponse interface for TypeScript type safety
export interface CloudinaryUploadResponse {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
}

// Define a more specific type for upload options
export interface CloudinaryUploadOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  format?: string;
  [key: string]: unknown;
}

// Define a type for Cloudinary deletion result
export interface CloudinaryDeleteResponse {
  result: string;
  [key: string]: unknown;
}

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary
 * @param fileString Base64 string of the file to upload
 * @param folder Folder to upload to
 * @param options Additional options for the upload
 * @returns Promise with upload result
 */
export const uploadToCloudinary = async (
  fileString: string,
  folder: string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResponse> => {
  try {
    const result = await cloudinary.uploader.upload(fileString, {
      folder,
      ...options,
    });

    return {
      public_id: result.public_id,
      url: result.url,
      secure_url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error(`Upload failed: ${(error as Error).message}`);
  }
};

/**
 * Deletes a file from Cloudinary
 * @param publicId Public ID of the file to delete
 * @returns Promise with deletion result
 */
export const deleteFromCloudinary = async (publicId: string): Promise<CloudinaryDeleteResponse> => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error(`Delete failed: ${(error as Error).message}`);
  }
};

export default cloudinary;
