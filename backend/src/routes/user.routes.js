import express from "express";
import {
  getUsers, //회원 조회
  createUser, //회원 추가
  deleteUser, //회원 삭제
  updateUser //회원 업데이트
} from "../controllers/user.controller.js"; //경로에서 임포트연결.

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 데이터베이스 회원 관리 API
 */


/**
 * @swagger
 * /users:
 *   get:
 *     summary: 회원 목록 조회
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 회원 목록 반환
 */
router.get("/", getUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: 회원 생성
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
 *                 example: hgd123
 *               password:
 *                 type: string
 *                 example: 1234
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               phone:
 *                 type: string
 *                 example: 010-1234-5678
 *               zip_code:
 *                 type: string
 *                 example: 06234
 *               address:
 *                 type: string
 *                 example: 서울시 강남구 테헤란로
 *               address_detail:
 *                 type: string
 *                 example: 101동 202호
 *               role:
 *                 type: string
 *                 example: USER
 *     responses:
 *       201:
 *         description: 회원 생성 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post("/", createUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: 사용자 삭제
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 회원 ID
 */
router.delete("/:id", deleteUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: 회원 기본 정보 수정
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 회원 ID
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
 *                 example: 홍길동
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
 *                 example: 서울시 강남구 테헤란로
 *               address_detail:
 *                 type: string
 *                 example: 101동 202호
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 example: USER
 *     responses:
 *       200:
 *         description: 수정 성공
 *       404:
 *         description: 회원 없음
 *       409:
 *         description: 중복 값 존재
 */
router.put("/:id", updateUser);


export default router;