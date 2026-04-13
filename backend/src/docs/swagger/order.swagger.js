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