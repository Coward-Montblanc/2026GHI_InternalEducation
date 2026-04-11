import express from 'express';
import * as CommonController from '../controllers/common.controller.js';
import { upload } from '../config/multer.config.js';

const router = express.Router();

router.post('/upload', upload.single('image'), CommonController.uploadImage);

router.delete('/delete-image', CommonController.deleteImageFile);

router.patch('/codes/:codeId/status', CommonController.patchCodeStatus);

router.get('/codes/:group_code', CommonController.getCommonCodes);

router.post('/codes', CommonController.addCommonCode);
export default router;
