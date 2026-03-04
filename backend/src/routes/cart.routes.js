import express from "express";
import * as cartController from "../controllers/cart.controller.js"; 
import { authenticateToken } from "../middlewares/auth.middleware.js"; //로그인 검증 미들웨어 임포트
const router = express.Router();

router.patch("/item/:cart_item_id/status", authenticateToken, cartController.toggleCartItemStatus);

/**
 * @swagger
 * /cart/item/{cart_item_id}:
 *   delete:
 *     summary: カート商品削除
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cart_item_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: カート商品ID
 * 
 */
router.delete("/item/:cart_item_id", authenticateToken, cartController.removeCartItem);

router.post("/addcart", authenticateToken, cartController.addToCart);

/**
 * @swagger
 * /cart/{login_id}:
 *   get:
 *     summary: ユーザーのカート商品一覧取得
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: login_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ユーザーのログインID
 *     responses:
 *       200:
 *         description: カート商品一覧
 *       404:
 *         description: 商品エラー
 *       500:
 *         description: データベース接続エラー
 */
router.get("/:login_id", authenticateToken, cartController.getCartItems);



export default router;