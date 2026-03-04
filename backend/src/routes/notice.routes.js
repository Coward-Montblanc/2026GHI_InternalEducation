import express from "express";
import * as noticeController from "../controllers/notice.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /notices:
 *   get:
 *     summary: お知らせ一覧取得
 *     tags: [Notices]
 *     responses:
 *       200:
 *         description: お知らせ一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 notices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       notice_id:
 *                         type: string
 *                         example: NT1
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       is_pinned:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                       author_name:
 *                         type: string
 */
router.get("/", noticeController.getNotices);

/**
 * @swagger
 * /notices/{id}:
 *   get:
 *     summary: お知らせ詳細取得
 *     tags: [Notices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: お知らせID
 *     responses:
 *       200:
 *         description: お知らせ詳細
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 notice:
 *                   type: object
 *       404:
 *         description: お知らせが見つかりません
 */
router.get("/:id", noticeController.getNoticeDetail);

/**
 * @swagger
 * /notices:
 *   post:
 *     summary: お知らせ登録
 *     tags: [Notices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               is_pinned:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       201:
 *         description: 登録完了
 *       403:
 *         description: 管理者のみ投稿できます
 */
router.post("/", authenticateToken, noticeController.createNotice);

/**
 * @swagger
 * /notices/{id}:
 *   put:
 *     summary: お知らせ更新
 *     tags: [Notices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               is_pinned:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 更新完了
 *       404:
 *         description: お知らせが見つかりません
 */
router.put("/:id", authenticateToken, noticeController.updateNotice);

/**
 * @swagger
 * /notices/{id}:
 *   delete:
 *     summary: お知らせ削除
 *     tags: [Notices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 削除完了
 *       404:
 *         description: お知らせが見つかりません
 */
router.delete("/:id", authenticateToken, noticeController.deleteNotice);

export default router;
