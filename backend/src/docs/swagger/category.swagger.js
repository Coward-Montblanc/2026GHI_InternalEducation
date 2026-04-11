/**
 * @swagger
 * /categories:
 *   get:
 *     summary: すべてのカテゴリ取得
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: カテゴリ一覧
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
 *                     example: TV/映像家電
 */

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: カテゴリ詳細取得
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: カテゴリID
 *     responses:
 *       200:
 *         description: カテゴリ詳細情報
 *       404:
 *         description: カテゴリが見つかりません
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: カテゴリ作成
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
 *                 example: 新しいカテゴリ
 *     responses:
 *       201:
 *         description: カテゴリ作成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: カテゴリが作成されました。
 *                 category_id:
 *                   type: integer
 *                   example: 7
 */

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: カテゴリ修正
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: カテゴリID
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
 *                 example: 修正されたカテゴリ
 *     responses:
 *       200:
 *         description: カテゴリ修正成功
 *       404:
 *         description: カテゴリが見つかりません
 */

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: カテゴリ論理削除
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: カテゴリID
 *     responses:
 *       200:
 *         description: カテゴリ論理削除成功
 *       404:
 *         description: カテゴリが見つかりません
 */