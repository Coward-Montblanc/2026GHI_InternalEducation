import express from "express";
import * as cartController from "../controllers/cart.controller.js"; 
import { authenticateToken } from "../middlewares/auth.middleware.js"; //로그인 검증 미들웨어 임포트
const router = express.Router();

router.patch("/item/:cart_item_id/status", authenticateToken, cartController.toggleCartItemStatus);//로그인 미들웨어 검증 및 장바구니 내 상품 활성,비활성화 기능 라우트

/**
 * @swagger
 * /cart/{login_id}:
 *   get:
 *     summary: 유저 장바구니 목록 조회
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: login_id
 *         required: true
 *         schema:
 *           type: string
 *         description: 유저 로그인 아이디
 *     responses:
 *       200:
 *         description: 장바구니 상품 목록
 *       404:
 *         description: 상품 오류
 *       500:
 *         description: 데이터베이스 연결 오류
 */
router.get("/:login_id", authenticateToken, cartController.getCartItems); 

/**
 * @swagger
 * /cart/item/{cart_item_id}:
 *   delete:
 *     summary: 장바구니 아이템 삭제
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cart_item_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 상품 아이디
 * 
 */
router.delete("/item/:cart_item_id", authenticateToken, cartController.removeCartItem);

router.post("/addcart", authenticateToken, cartController.addToCart);



export default router;