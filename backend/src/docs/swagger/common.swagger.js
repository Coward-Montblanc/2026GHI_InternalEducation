/**
 * @swagger
 * tags:
 *   name: Common
 *   description: 共通コードとドロップボックスオプションの管理
 */

/**
 * @swagger
 * /common/codes/{codeId}/status:
 *   patch:
 *     summary: コードの有効化/無効化状態の変更
 *     tags: [Common]
 *     parameters:
 *       - in: path
 *         name: codeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: code_id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_used:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: 状態変更の成功
 */

/**
 * @swagger
 * /common/codes/{group_code}:
 *   get:
 *     tags: [Common]
 *     summary: グループ別共通コード照会
 *     description: |
 *       - PRODUCT_CATEGORY: 商品カテゴリ一覧
 *       - EMAIL_DOMAIN: メールドメインリスト
 *       - PHONE_COUNTRY_CODE: 国別の電話番号コードリスト
 *     parameters:
 *       - in: path
 *         name: group_code
 *         required: true
 *         description: 照会するグループ名
 *         schema:
 *           type: string
 *           example: EMAIL_DOMAIN
 *           enum: [all,PRODUCT_CATEGORY, EMAIL_DOMAIN, PHONE_COUNTRY_CODE]
 *     responses:
 *       200:
 *         description: 正常に照会されました。
 */

/**
 * @swagger
 * /common/codes:
 *   post:
 *     summary: 共通コード新規登録
 *     description: |
 *       - PRODUCT_CATEGORY: 商品カテゴリ一覧
 *       - EMAIL_DOMAIN: メールドメインリスト
 *       - PHONE_COUNTRY_CODE: 国別の電話番号コードリスト
 *     tags: [Common]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_code:
 *                 type: string
 *                 example: "PHONE_COUNTRY_CODE"
 *               code_value:
 *                 type: string
 *                 example: "+82"
 *               code_name:
 *                 type: string
 *                 example: "South Korea"
 *               attr1:
 *                 type: string
 *                 nullable: true
 *                 description: "ガイド形式"
 *                 example: "010-0000-0000"
 *     responses:
 *       201:
 *         description: 登録の成功
 */