import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as cloudinaryUtils from '../../../utils/cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Mock cloudinary uploader
vi.mock('cloudinary', () => {
  return {
    v2: {
      config: vi.fn(),
      uploader: {
        upload: vi.fn(),
        destroy: vi.fn(),
      },
    },
  };
});

describe('cloudinary utils', () => {
  const mockUploadResult = {
    public_id: 'test_id',
    url: 'http://test.url',
    secure_url: 'https://test.url',
    format: 'jpg',
    width: 100,
    height: 200,
    resource_type: 'image',
  };

  const mockDeleteResult = { result: 'ok' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should upload to cloudinary and return expected result', async () => {
    (cloudinary.uploader.upload as any).mockResolvedValue(mockUploadResult);
    const result = await cloudinaryUtils.uploadToCloudinary('fileString', 'folder');
    expect(result).toEqual(mockUploadResult);
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith('fileString', { folder: 'folder' });
  });

  it('should throw error if upload fails', async () => {
    (cloudinary.uploader.upload as any).mockRejectedValue(new Error('fail'));
    await expect(cloudinaryUtils.uploadToCloudinary('fileString', 'folder')).rejects.toThrow('Upload failed: fail');
  });

  it('should delete from cloudinary and return expected result', async () => {
    (cloudinary.uploader.destroy as any).mockResolvedValue(mockDeleteResult);
    const result = await cloudinaryUtils.deleteFromCloudinary('publicId');
    expect(result).toEqual(mockDeleteResult);
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('publicId');
  });

  it('should throw error if delete fails', async () => {
    (cloudinary.uploader.destroy as any).mockRejectedValue(new Error('fail'));
    await expect(cloudinaryUtils.deleteFromCloudinary('publicId')).rejects.toThrow('Delete failed: fail');
  });
});