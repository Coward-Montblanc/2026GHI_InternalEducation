import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  //画像タイプのフィルタリング
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg\+xml/;
  const allowedExts = /jpeg|jpg|png|gif|webp|jfif|svg/;

  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("画像ファイル（jpg、jpeg、png、gif、webp）のみアップロードできます。"), false);
  }
};

export const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});