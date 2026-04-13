/**
 * @swagger
 * /events:
 *   get:
 *     summary: イベント一覧取得
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: イベント一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       event_id:
 *                         type: string
 *                         example: EV1
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

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: イベント詳細取得
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: イベントID
 *     responses:
 *       200:
 *         description: イベント詳細
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 event:
 *                   type: object
 *       404:
 *         description: イベントが見つかりません
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: イベント登録
 *     tags: [Events]
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

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: イベント更新
 *     tags: [Events]
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
 *         description: イベントが見つかりません
 */

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: イベント削除
 *     tags: [Events]
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
 *         description: イベントが見つかりません
 */