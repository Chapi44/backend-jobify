const multer = require("multer");

// Allowed MIME types for logos
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/gif"];

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File type and size validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Only JPEG, PNG, JPG, and GIF files are allowed."), false);
    }
    cb(null, true);
  },
});

// Single image upload
exports.uploadSingleImage = upload.single("image");
