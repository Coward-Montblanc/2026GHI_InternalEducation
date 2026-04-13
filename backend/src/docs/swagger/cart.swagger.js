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