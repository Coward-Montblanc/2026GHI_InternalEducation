import express from "express";
import * as eventController from "../controllers/event.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import response from "../utils/response.js";
import { RESPONSE_MESSAGES, DATA_CONSTRAINTS } from "../config/constants.js";
import { upload } from "../config/multer.config.js";

const router = express.Router();

const handleUpload = (req, res, next) => {
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "banner_image", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      console.error("Multer エラー発生:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return response.error(res, DATA_CONSTRAINTS.FILE.SIZE_LIMIT, 400);
      }
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.FILE_UPLOAD_ERROR, 400);
    }
    next();
  });
};

router.get('/banners', eventController.getBannerList);

router.get("/", eventController.getEvents);

router.get("/:id", eventController.getEventDetail);

router.post("/", authenticateToken, handleUpload, eventController.createEvent);

router.put("/:id", authenticateToken, handleUpload, eventController.updateEvent);

router.delete("/:id", authenticateToken, eventController.deleteEvent);

export default router;
