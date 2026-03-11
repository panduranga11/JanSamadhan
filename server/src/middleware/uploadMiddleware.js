const multer = require('multer');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and SVG are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter,
});

module.exports = upload;
