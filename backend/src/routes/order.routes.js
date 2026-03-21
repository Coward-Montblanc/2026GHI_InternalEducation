import express from "express";
import * as orderController from "../controllers/order.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js"; //로그인 검증 미들웨어 임포트

const router = express.Router();

router.get('/admin/:orderId', orderController.getOrderDetailAdmin); //관리자용 주문 상세 페이지 라우트
router.patch('/admin/:orderId', orderController.patchOrderStatusAdmin); //관리자용 주문 상태 수정 라우트
router.get('/', authenticateToken, orderController.getAdminOrders);
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: 注文作成
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
 *         description: 注文完了
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
router.post("/", authenticateToken, orderController.createOrder);

/**
 * @swagger
 * /orders/{order_id}:
 *   get:
 *     summary: 注文詳細取得
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *         description: 注文ID (OD1 形式)
 *     responses:
 *       200:
 *         description: 注文詳細情報
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
 *         description: 注文が見つかりません
 */
router.get("/:order_id", authenticateToken, orderController.getOrder);

/**
 * @swagger
 * /orders/user/{login_id}:
 *   get:
 *     summary: ユーザー別注文一覧取得
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: login_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ユーザーのログインID
 *     responses:
 *       200:
 *         description: 注文一覧
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
router.get("/user/:login_id", authenticateToken, orderController.getOrdersByUser);

export default router;
