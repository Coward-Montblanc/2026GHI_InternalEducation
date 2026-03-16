import express from "express";
import {
  getUsers, //회원 조회
  createUser, //회원 추가
  deleteUser, //회원 삭제
  updateUser, //회원 업데이트
  getUserAddresses,
  addUserAddress,
  updateDefaultAddress,
  getAdminUsers
} from "../controllers/user.controller.js"; //경로에서 임포트연결.
import { authenticateToken } from "../middlewares/auth.middleware.js"; //로그인 검증 미들웨어 임포트

const router = express.Router();
router.get('/adminUsers', authenticateToken, getAdminUsers);
router.patch("/addresses/default", authenticateToken, updateDefaultAddress);
router.get("/addresses", authenticateToken, getUserAddresses); //회원정보 불러와야 해서 미들웨어 임포트
router.post("/addresses", authenticateToken, addUserAddress);
router.post("/register", createUser);
router.put("/update-profile", authenticateToken, updateUser); //회원 정보 수정라우트

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: データベースユーザー管理API
 */


/**
 * @swagger
 * /users:
 *   get:
 *     summary: ユーザー一覧取得
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: ユーザー一覧
 */
router.get("/", getUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: ユーザー作成
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login_id
 *               - password
 *               - name
 *               - email
 *             properties:
 *               login_id:
 *                 type: string
 *                 example: yamada0123
 *               password:
 *                 type: string
 *                 example: yamada0123
 *               name:
 *                 type: string
 *                 example: 山田一郎 
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               phone:
 *                 type: string
 *                 example: 010-1234-5678
 *               zip_code:
 *                 type: string
 *                 example: 100-0001
 *               address:
 *                 type: string
 *                 example: 東京都千代田区永田町1-7-1
 *               address_detail:
 *                 type: string
 *                 example: 101-0001
 *               status:
 *                 type: integer
 *                 example: 0
 *               role:
 *                 type: string
 *                 example: USER
 *     responses:
 *       201:
 *         description: ユーザー作成成功
 *       400:
 *         description: 不正なリクエスト
 */
router.post("/", createUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: ユーザー削除
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ユーザーID
 */
router.delete("/:id", deleteUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: ユーザー基本情報修正
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ユーザーID (login_id)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login_id:
 *                 type: string
 *                 example: hong123
 *               password:
 *                 type: string
 *                 format: password
 *                 example: newpassword123
 *               name:
 *                 type: string
 *                 example: 山田一郎
 *               email:
 *                 type: string
 *                 example: hong@test.com
 *               phone:
 *                 type: string
 *                 example: 010-1234-5678
 *               zip_code:
 *                 type: string
 *                 example: 06234
 *               address:
 *                 type: string
 *                 example: 東京都千代田区永田町1-7-1
 *               address_detail:
 *                 type: string
 *                 example: 101-0001
 *               status:
 *                 type: integer
 *                 example: 0
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 example: USER
 *     responses:
 *       200:
 *         description: 修正成功
 *       404:
 *         description: ユーザーが見つかりません
 *       409:
 *         description: 重複値が存在します
 */
router.put("/:id", updateUser);


export default router;