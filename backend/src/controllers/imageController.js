import db from "../config/db.js";
import response from "../utils/response.js";
import { RESPONSE_MESSAGES } from "../config/constants.js";


export const uploadImageHandler = async (req, res) => {
  if (!req.file) return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);

  const filename = req.file.filename;
  const originalname = req.file.originalname;

  try {
    await db.query(
      "INSERT INTO images (filename, original_name, status) VALUES (?, ?, 'PENDING')",
      [filename, originalname]
    );

  const protocol = req.protocol;
  const host = req.get('host');
  
  const baseUrl = process.env.VITE_API_URL || `${protocol}://${host}`;
  const imageUrl = `${baseUrl}/uploads/${filename}`;
    return response.success(res, {url: imageUrl, fileName: filename}, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (error) {
    console.error(error);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};