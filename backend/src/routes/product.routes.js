import * as productController from "../controllers/product.controller.js";
import express from "express";
import response from "../utils/response.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { RESPONSE_MESSAGES, DATA_CONSTRAINTS } from "../config/constants.js";
import { upload } from "../config/multer.config.js";

const router = express.Router();

const handleUpload = (req, res, next) => {
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "detail_images", maxCount: 5 },
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

router.get("/", productController.getAllProducts);
router.get("/popular", productController.getRankProducts);
router.get("/search", productController.getProducts); 
router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/:id", productController.getProductViewUp);

router.get("/admin/all", authenticateToken, productController.getAllProductsForAdmin);
router.patch("/admin/:productId/recommend", productController.patchRecommendStatus);
router.patch('/admin/bulk-status', productController.bulkUpdateStatus); 

router.post("/", authenticateToken, handleUpload, productController.createProduct);
router.put("/:id", authenticateToken, handleUpload, productController.updateProduct);


export default router;