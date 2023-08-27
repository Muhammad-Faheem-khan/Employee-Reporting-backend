const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split(".").pop();
    const filename = `${file.fieldname}-${uniqueSuffix}.${fileExtension}`;
    cb(null, filename);
  },
});
const upload = multer({ storage: storage });
module.exports = upload;
