const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Local uploads dir ─────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Always use local disk for multer (reliable stream parsing) ────────────────
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// Accept all files — Cloudinary handles format validation on its end.
// Rejecting with cb(null, false) causes multer to silently skip files (no error!),
// which is why images were always empty.
const fileFilter = (_req, file, cb) => {
  console.log(`[Multer] fileFilter: ${file.originalname} (${file.mimetype})`);
  cb(null, true); // accept everything
};

const multerUpload = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ── Cloudinary helper ─────────────────────────────────────────────────────────
let _cloudinaryInstance = null;

const getCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn('[Cloudinary] Missing credentials — falling back to local storage');
    return null;
  }

  if (!_cloudinaryInstance) {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key:    CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    _cloudinaryInstance = cloudinary;
    console.log('[Cloudinary] Configured with cloud:', CLOUDINARY_CLOUD_NAME);
  }
  return _cloudinaryInstance;
};

// Upload a local file to Cloudinary using promise API, delete local copy, return secure URL
const uploadToCloudinary = async (localPath) => {
  const cloudinary = getCloudinary();
  if (!cloudinary) {
    // No Cloudinary — keep local file, return web path
    const filename = path.basename(localPath);
    return `/uploads/${filename}`;
  }

  try {
    console.log('[Cloudinary] Uploading:', localPath);
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'studentsphere',
      resource_type: 'image',
    });
    // Delete local temp file after successful upload
    fs.unlink(localPath, (unlinkErr) => {
      if (unlinkErr) console.warn('[Cloudinary] Could not delete temp file:', unlinkErr.message);
    });
    console.log('[Cloudinary] Upload success:', result.secure_url);
    return result.secure_url;
  } catch (err) {
    console.error('[Cloudinary] Upload FAILED for', localPath);
    console.error('[Cloudinary] Error:', err.message || err);
    // Keep local file as fallback — don't delete it, return local path
    const filename = path.basename(localPath);
    console.warn('[Cloudinary] Falling back to local path:', `/uploads/${filename}`);
    return `/uploads/${filename}`;
  }
};

// ── Public helpers to get final URLs from req.file / req.files ────────────────
// Call AFTER the multer middleware + processUploads middleware below

const getFileUrl  = (file)  => file?._cloudinaryUrl || (file ? `/uploads/${file.filename}` : null);
const getFilesUrls = (files) => (files || []).map(getFileUrl);

// ── Middleware: process uploaded files through Cloudinary ─────────────────────
// Use this AFTER multer middleware in your route chain
const processUploads = async (req, _res, next) => {
  try {
    const fileCount = req.files?.length ?? (req.file ? 1 : 0);
    console.log(`[processUploads] Processing ${fileCount} file(s)`);

    // Single file
    if (req.file) {
      req.file._cloudinaryUrl = await uploadToCloudinary(req.file.path);
      console.log('[processUploads] Single file URL:', req.file._cloudinaryUrl);
    }

    // Multiple files (array)
    if (req.files && Array.isArray(req.files) && req.files.length) {
      await Promise.all(
        req.files.map(async (f) => {
          f._cloudinaryUrl = await uploadToCloudinary(f.path);
          console.log('[processUploads] File URL:', f._cloudinaryUrl);
        })
      );
    }

    next();
  } catch (err) {
    // Shouldn't happen since uploadToCloudinary now always returns a URL,
    // but keep as safety net
    console.error('[processUploads] Unexpected error:', err.message || err);
    next();
  }
};

// ── Upload handler factory (multer + Cloudinary processing in one wrapper) ────
const createHandler = (fieldName, maxCount = 1) => {
  const multerMiddleware = maxCount === 1
    ? multerUpload.single(fieldName)
    : multerUpload.array(fieldName, maxCount);

  // Returns a middleware that: runs multer → uploads to Cloudinary → calls next
  return (req, res, next) => {
    multerMiddleware(req, res, async (err) => {
      if (err) {
        console.error('[Multer error]', err.message);
        return res.status(400).json({ success: false, message: err.message });
      }

      const count = req.files?.length ?? (req.file ? 1 : 0);
      console.log(`[Upload] ${fieldName}: ${count} file(s) received by multer`);

      await processUploads(req, res, next);
    });
  };
};

// ── Exports ───────────────────────────────────────────────────────────────────
const uploadSingle   = (field)          => createHandler(field, 1);
const uploadMultiple = (field, max = 5) => createHandler(field, max);

module.exports = { uploadSingle, uploadMultiple, getFileUrl, getFilesUrls, processUploads };
