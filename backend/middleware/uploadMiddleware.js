const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local disk storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File type filter — images + PDFs only
const fileFilter = (req, file, cb) => {
  const allowedMime = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP and PDF allowed.'),
      false
    );
  }
};

// Helper to choose storage (Cloudinary if env vars present, else local)
const getStorage = () => {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'studentsphere',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
      },
    });
  }
  return localStorage;
};

const storage = getStorage();

const createUploader = (fieldName, maxCount = 1) => {
  const uploader = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  });

  if (maxCount === 1) {
    return uploader.single(fieldName);
  }
  return uploader.array(fieldName, maxCount);
};

// Pre-configured upload handlers
const uploadSingle = (field) => createUploader(field, 1);
const uploadMultiple = (field, max = 5) => createUploader(field, max);

module.exports = { uploadSingle, uploadMultiple };
