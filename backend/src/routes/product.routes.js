import * as productController from "../controllers/product.controller.js";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// 인기상품 조회
router.get("/popular", productController.getRankProducts);

// 상품 상세 조회 (view 증가 포함)
router.get("/:id", productController.getProductViewUp);

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
 *     summary: 모든 상품 조회
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: 상품 목록
 */
router.get("/", productController.getAllProducts);

/**
 * @swagger
 * /products/category/{categoryId}:
 *   get:
 *     summary: 카테고리별 상품 조회
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 카테고리 ID
 *     responses:
 *       200:
 *         description: 카테고리별 상품 목록
 */
router.get("/category/:categoryId", productController.getProductsByCategory);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: 상품 상세 조회
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 상품 상세 정보
 *       404:
 *         description: 상품을 찾을 수 없음
 */


/**
 * @swagger
 * /products:
 *   post:
 *     summary: 상품 생성
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
 *                 example: 스마트 TV 65인치
 *               description:
 *                 type: string
 *                 example: 최신형 스마트 TV입니다
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
 *         description: 상품 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 상품이 생성되었습니다.
 *                 product_id:
 *                   type: integer
 *                   example: 25
 */
router.post("/", (req, res, next) => {
  // 최대 5장까지 업로드 허용 및 에러 핸들링
  upload.array("images", 5)(req, res, (err) => {
    if (err) { 
      console.error("Multer 에러 발생:", err);
      
      // 파일 사이즈 오버(250KB 제한) 처리
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ 
          success: false, 
          message: "파일 크기는 250KB 이하여야 합니다." 
        });
      }
      
      // 기타 업로드 에러
      return res.status(400).json({ 
        success: false, 
        message: "파일 업로드 에러", 
        error: err.message 
      });
    }
    next();
  });
}, productController.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: 상품 수정
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 상품 ID
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
 *                 example: 수정된 상품명
 *               description:
 *                 type: string
 *                 example: 수정된 설명
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
 *         description: 상품 수정 성공
 *       404:
 *         description: 상품을 찾을 수 없음
 */
router.put("/:id", productController.updateProduct);


export default router;