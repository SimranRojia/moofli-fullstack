const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  // We don't need to set a destination, as Cloudinary will handle it from the buffer/path
  // But using 'multer.memoryStorage()' is often cleaner
});

// Use memoryStorage to avoid saving files to your server disk
// Cloudinary can upload directly from the buffer
const upload = multer({ storage: multer.memoryStorage() });

module.exports = upload;