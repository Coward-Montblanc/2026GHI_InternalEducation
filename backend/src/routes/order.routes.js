import express from "express";
import * as orderController from "../controllers/order.controller.js";

const router = express.Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: 주문 생성
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login_id
 *               - items
 *               - total_price
 *             properties:
 *               login_id:
 *                 type: string
 *                 example: user1
 *               total_price:
 *                 type: integer
 *                 example: 120000
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *                     price:
 *                       type: integer
 *                       example: 30000
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: 주문 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 order_id:
 *                   type: integer
 *                   example: 10
 */
router.post("/", orderController.createOrder);

/**
 * @swagger
 * /orders/{order_id}:
 *   get:
 *     summary: 주문 상세 조회
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 주문 ID
 *     responses:
 *       200:
 *         description: 주문 상세 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 order:
 *                   type: object
 *       404:
 *         description: 주문 없음
 */
router.get("/:order_id", orderController.getOrder);

/**
 * @swagger
 * /orders/user/{login_id}:
 *   get:
 *     summary: 유저별 주문 목록 조회
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: login_id
 *         required: true
 *         schema:
 *           type: string
 *         description: 유저 로그인 ID
 *     responses:
 *       200:
 *         description: 주문 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/user/:login_id", orderController.getOrdersByUser);

export default router;
