import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkblutnml',
  api_key: process.env.CLOUDINARY_API_KEY || '739218772994437',
  api_secret: process.env.CLOUDINARY_API_SECRET || '1VUEHmzT8P-XE28-RGkKbT3Z_oM',
  secure: true,
});

export default cloudinary;

// Helper function to upload image to Cloudinary
export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = 'products'
): Promise<{ url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `licrorice/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' }, // Max dimensions
          { quality: 'auto:good' }, // Automatic quality optimization
          { fetch_format: 'auto' }, // Automatic format selection (WebP when possible)
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(new Error('Upload failed: No result returned'));
        }
      }
    );

    // Pipe file buffer to upload stream
    if (file.buffer) {
      uploadStream.end(file.buffer);
    } else {
      reject(new Error('File buffer is missing'));
    }
  });
};

// Helper function to delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};




