import * as productController from "../controllers/product.controller.js";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// 인기상품 조회
router.get("/popular", productController.getRankProducts);

// Multer 설정 (이미지 업로드 필수)
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

const upload = multer({ //파일 업로드 설정
  storage: storage, //저장 디렉토리
  limits: {fileSize: 250 * 1024  } //250kb 제한
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: すべての商品取得
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: 商品一覧
 */
router.get("/", productController.getAllProducts);

/**
 * @swagger
 * /products/category/{categoryId}:
 *   get:
 *     summary: カテゴリ別商品取得
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: カテゴリID
 *     responses:
 *       200:
 *         description: カテゴリ別商品一覧
 */
router.get("/category/:categoryId", productController.getProductsByCategory);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: 商品詳細取得
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     responses:
 *       200:
 *         description: 商品詳細情報
 *       404:
 *         description: 商品が見つかりません
 */
router.get("/:id", productController.getProductViewUp);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: 商品作成
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - name
 *               - price
 *               - stock
 *               - images
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: スマート TV 65インチ
 *               description:
 *                 type: string
 *                 example: 最新型スマート TVです
 *               price:
 *                 type: integer
 *                 example: 1500000
 *               stock:
 *                 type: integer
 *                 example: 10
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: 商品作成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 商品が作成されました。
 *                 product_id:
 *                   type: integer
 *                   example: 25
 */
router.post("/", (req, res, next) => {
  // 최대 5장까지 업로드 허용 및 에러 핸들링
  upload.fields([ //필드가 많아서 array못씀
    { name: "images", maxCount: 5 },
    { name: "detail_images", maxCount: 5 },
  ])(req, res, (err) => {
    if (err) { 
      console.error("Multer エラー発生:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false, 
          message: "ファイルサイズは250KB以下でなければなりません。",
        });
      }
      
      // 기타 업로드 에러
      return res.status(400).json({
        success: false,
        message: "ファイルアップロードエラー",
        error: err.message,
      });
    }
    next();
  });
}, productController.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: 商品修正
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: 修正された商品名
 *               description:
 *                 type: string
 *                 example: 修正された説明
 *               price:
 *                 type: integer
 *                 example: 2000000
 *               stock:
 *                 type: integer
 *                 example: 5
 *               main_image:
 *                 type: string
 *                 example: /images/updated.jpg
 *     responses:
 *       200:
 *         description: 商品修正成功
 *       404:
 *         description: 商品が見つかりません
 */
router.put("/:id", productController.updateProduct);


export default router;