const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'store-orders',
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    throw new Error('Error uploading file to Cloudinary');
  }
};

module.exports = { cloudinary, uploadToCloudinary }; 