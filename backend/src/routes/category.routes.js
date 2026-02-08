import express from "express";
import * as categoryController from "../controllers/category.controller.js";

const router = express.Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: 모든 카테고리 조회
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: 카테고리 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category_id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: TV/영상가전
 */
router.get("/", categoryController.getAllCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: 카테고리 상세 조회
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 카테고리 ID
 *     responses:
 *       200:
 *         description: 카테고리 상세 정보
 *       404:
 *         description: 카테고리를 찾을 수 없음
 */
router.get("/:id", categoryController.getCategoryById);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: 카테고리 생성
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: 새 카테고리
 *     responses:
 *       201:
 *         description: 카테고리 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 카테고리가 생성되었습니다.
 *                 category_id:
 *                   type: integer
 *                   example: 7
 */
router.post("/", categoryController.createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: 카테고리 수정
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 카테고리 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: 수정된 카테고리
 *     responses:
 *       200:
 *         description: 카테고리 수정 성공
 *       404:
 *         description: 카테고리를 찾을 수 없음
 */
router.put("/:id", categoryController.updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: 카테고리 논리적 삭제
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 카테고리 ID
 *     responses:
 *       200:
 *         description: 카테고리 논리적 삭제 성공
 *       404:
 *         description: 카테고리를 찾을 수 없음
 */
router.delete("/:id", categoryController.deleteCategory);

export default router;