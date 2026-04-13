/**
 * @swagger
 * /products:
 *   get:
 *     summary: すべての商品取得
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: 商品一覧
 */

/**
 * @swagger
 * /products/category/{categoryId}:
 *   get:
 *     summary: カテゴリ別商品取得
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: カテゴリID
 *     responses:
 *       200:
 *         description: カテゴリ別商品一覧
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: 商品詳細取得
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     responses:
 *       200:
 *         description: 商品詳細情報
 *       404:
 *         description: 商品が見つかりません
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: 商品作成
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - name
 *               - price
 *               - stock
 *               - images
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: スマート TV 65インチ
 *               description:
 *                 type: string
 *                 example: 最新型スマート TVです
 *               price:
 *                 type: integer
 *                 example: 1500000
 *               stock:
 *                 type: integer
 *                 example: 10
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: 商品作成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 商品が作成されました。
 *                 product_id:
 *                   type: integer
 *                   example: 25
 */

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: 商品修正
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: 修正された商品名
 *               description:
 *                 type: string
 *                 example: 修正された説明
 *               price:
 *                 type: integer
 *                 example: 2000000
 *               stock:
 *                 type: integer
 *                 example: 5
 *               main_image:
 *                 type: string
 *                 example: /images/updated.jpg
 *     responses:
 *       200:
 *         description: 商品修正成功
 *       404:
 *         description: 商品が見つかりません
 */