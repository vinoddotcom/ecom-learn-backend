import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load environment variables if not in production
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config();
}

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
  resource_type?: string;
  [key: string]: unknown;
}

// Define a type for Cloudinary deletion result
export interface CloudinaryDeleteResponse {
  result: string;
  [key: string]: unknown;
}

// Type for Cloudinary upload response
interface CloudinaryResult {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
  [key: string]: unknown;
}

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

/**
 * Uploads a file to Cloudinary
 * @param fileData File data (either base64 string, buffer or file path)
 * @param folder Folder to upload to
 * @param options Additional options for the upload
 * @returns Promise with upload result
 */
export const uploadToCloudinary = async (
  fileData: string | Buffer,
  folder: string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResponse> => {
  try {
    // Type assertion for the cloudinary uploader
    const uploader = (
      cloudinary as unknown as {
        uploader: {
          upload: (path: string, options?: Record<string, unknown>) => Promise<CloudinaryResult>;
        };
      }
    ).uploader;

    let fileStr: string;
    
    // If it's a buffer, convert to base64 data URI
    if (Buffer.isBuffer(fileData)) {
      // Determine MIME type (default to image/jpeg if unknown)
      // This is a simplified approach - in production, you would want to detect the actual mimetype
      const mimeType = 'image/jpeg';
      fileStr = `data:${mimeType};base64,${fileData.toString('base64')}`;
    } else {
      // If it's already a string, use it directly
      fileStr = fileData;
    }

    const result = await uploader.upload(fileStr, {
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
    // Type assertion for the cloudinary uploader
    const uploader = (
      cloudinary as unknown as {
        uploader: {
          destroy: (publicId: string) => Promise<CloudinaryDeleteResponse>;
        };
      }
    ).uploader;
    return await uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error(`Delete failed: ${(error as Error).message}`);
  }
};

export default cloudinary;
