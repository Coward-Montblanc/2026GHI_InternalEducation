import db from "../config/db.js";
import * as productModel from "../models/product.model.js";
import response from "../utils/response.js";
import fs from "fs";
import path from "path";
import { RESPONSE_MESSAGES } from "../config/constants.js";

//人気商品を見る（view 10以上）フロントエンドではまだ未実装
export const getRankProducts = async (req, res) => {
  try {
    const products = await productModel.getRankProducts();
    return response.success(res, { products });
  } catch (err) {
    return response.error(res , RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

//商品詳細照会時のビュー増加
export const getProductViewUp = async (req, res) => {
  try {
    const { id } = req.params;
    // GETリクエストの場合にのみヒット数が増加するOptionsでは、確認プロセスでヒット数がもう1度増加します。 
    // GETリクエストではない場合は増加しないように条件を追加
    // +2だった原因自体はmain.tsxにあります。
    if (req.method === "GET") {
      await productModel.incrementView(id);
    }
    const product = await productModel.getProductById(id);
    if (!product) return response.error(res , RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);

    const response_p = { //画像リストの区別
      ...product,
      mainImage: product.images.find(img => img.role === 1)?.image_url || null,
      subImages: product.images.filter(img => img.role === 2).map(img => img.image_url),
      detailImages: product.images.filter(img => img.role === 3).map(img => img.image_url),
    };

    return response.success(res, { response_p });
  } catch (error) {
    console.error("商品詳細取得エラー:", error); 
    return response.error(res , RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT, 500);
  }
};

export const getAllProductsForAdmin = async (req, res) => { //管理者ページの商品検索
  try {
    
    const { name, product_id, category_id, status, is_recommended, startDate, endDate, sortField, sortOrder,
      minPrice, maxPrice, minStock, maxStock, minView, maxView, minSales, maxSales
     } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    

    const F_StartDate = startDate ? `${startDate} 00:00:00` : null;
    const F_EndDate = endDate ? `${endDate} 23:59:59` : null;

    const offset = (Number(page) - 1) * limit;

    const filters = { //空にすると、全体が検索されるようにundefinedで空にする
      product_id: product_id || undefined,
      name: name || undefined,
      category_id: category_id || undefined,
      status: (status !== undefined && status !== "") ? status : undefined,
      is_recommended: (is_recommended !== undefined && is_recommended !== "" && is_recommended !== "all") ? is_recommended : undefined,
      created_at: (F_StartDate && F_EndDate) ? [F_StartDate, F_EndDate] : undefined,
      limit: limit,
      offset: offset,
      sortField: sortField || 'created_at',
      sortOrder: sortOrder || 'DESC',
      price: (minPrice || maxPrice) ? [
        minPrice ? Number(minPrice) : 0, 
        maxPrice ? Number(maxPrice) : 999999999
      ] : undefined,

      stock: (minStock || maxStock) ? [
        minStock ? Number(minStock) : 0, 
        maxStock ? Number(maxStock) : 999999
      ] : undefined,

      view: (minView || maxView) ? [
        minView ? Number(minView) : 0,
        maxView ? Number(maxView) : 9999999
      ] : undefined,

      sales_count: (minSales || maxSales) ? [
        minSales ? Number(minSales) : 0,
        maxSales ? Number(maxSales) : 999999
      ] : undefined,
    };

    const filterOptions = {
      name: 'LIKE',
      created_at: 'BETWEEN',
      price: 'BETWEEN',
      stock: 'BETWEEN'
    };

    const paginationOptions = {
      limit,
      offset,
      sortField: sortField || 'created_at',
      sortOrder: sortOrder || 'DESC'
    };
    const { products, totalCount } = await productModel.findProducts(filters, filterOptions, paginationOptions);
    
    return response.success(res, {
      products,
      pagination: {
        totalItems: totalCount,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / limit) || 1
      }
    }, );
  } catch (err) {
    console.error("管理者商品一覧取得エラー:", err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

export const getProducts = async (req, res) => { //メイン画面用カテゴリ商品検索機能
  try {
    const { category, name } = req.query; 
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const offset = (Number(page) - 1) * limit;

    const filters = {
      category_id: category || undefined,
      name: name || undefined,
      status: 0,
      limit: limit,
      offset: offset
    };

    const { products, totalCount } = await productModel.findProducts(filters);

    return response.success(res, {
            products,
            pagination: {
                totalItems: totalCount,
                currentPage: Number(page),
                totalPages: Math.ceil(totalCount / limit) || 1
            }
        }, "商品リストを取得しました。");
  } catch (error) {
    console.error("商品一覧取得エラー:", error);
    return response.error(res , RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

export const createProduct = async (req, res) => {

  const { category_id, name, description, price, stock } = req.body;
  const files = Array.isArray(req.files?.images) ? req.files.images : [];
  const detailFiles = Array.isArray(req.files?.detail_images) ? req.files.detail_images : [];

  // 画像ファイルの有無の確認
  if (!files || files.length === 0) {
    return response.error(res , RESPONSE_MESSAGES.CLIENT_ERROR.IMAGE_FILE_ERROR);
  }

  // 必須テキストデータが空であることを確認する
  if (!category_id || !name || !price) {
    return response.error(res , RESPONSE_MESSAGES.CLIENT_ERROR.NOT_ENTERED);
  }

  //画像がない場合に備えたトランザクションコネクション
  const connection = await db.getConnection(); 

  try { 
    await connection.beginTransaction(); //トランザクションの開始 

    const productId = await productModel.createProduct(connection, {
      category_id,
      name,
      description,
      price,
      stock,
      status: 0,
    });

    //最初の画像をメインに保存する部分、for文を介して番号付け
    for (let i = 0; i < files.length; i++) { 
      const imageUrl = `/uploads/${files[i].filename}`;
      const role = i === 0 ? 1 : 2;
      await connection.execute(
        `INSERT INTO product_images (product_id, image_url, image_order, role) VALUES (?, ?, ?, ?)`,
        [productId, imageUrl, i + 1, role]
      );
    }

    for (let i = 0; i < detailFiles.length; i++) {
      const imageUrl = `/uploads/${detailFiles[i].filename}`;
      await connection.execute(
        `INSERT INTO product_images (product_id, image_url, image_order, role) VALUES (?, ?, ?, ?)`,
        [productId, imageUrl, i + 1, 3]
      );
    }

    await connection.commit(); //トランザクションの終わり。すべての操作が成功すると、DBを反映

    return response.success(res, { productId }, RESPONSE_MESSAGES.SUCCESS.DEFAULT);

  } catch (error) {
    await connection.rollback();
    console.error("登録エラー詳細:", error);
    return response.error(res , RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  } finally {
    connection.release();
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const search = req.query.search || "";
    const result = await productModel.getAllProducts(page, limit, search);
    return response.success(res, { result });
  } catch (error) {
    console.error("商品取得エラー:", error?.message || error);
    return response.error(res , RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id);
    
    if (!product) return response.error(res , RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);

    const response_p = {
      ...product,
      mainImage: product.images.find(img => img.role === 1)?.image_url || null,
      subImages: product.images.filter(img => img.role === 2).map(img => img.image_url),
      detailImages: product.images.filter(img => img.role === 3).map(img => img.image_url),
    };

    return response.success(res, response_p);
  } catch (error) {
    console.error("商品詳細取得エラー:", error);
    return response.error(res , RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const search = req.query.search || "";
    const products = await productModel.getProductsByCategory(categoryId, search);
    res.json(products);
  } catch (error) {
    console.error("カテゴリ別商品取得エラー:", error);
    return response.error(res , RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const files       = req.files?.images        ?? [];
  const detailFiles = req.files?.detail_images ?? [];

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const result = await productModel.updateProduct(id, req.body, connection);
    if (!result) {
      throw new Error(RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
    }
    

    if (files.length > 0) {
      const [oldImages] = await connection.execute(
        `SELECT image_url FROM product_images WHERE product_id = ? AND role IN (1, 2)`, [id]
      );
      await connection.execute(
        `DELETE FROM product_images WHERE product_id = ? AND role IN (1, 2)`, [id]
      );
      oldImages.forEach(({ image_url }) => {
        const filePath = path.join(path.resolve(), image_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
      for (let i = 0; i < files.length; i++) {
        const imageUrl = `/uploads/${files[i].filename}`;
        const role = i === 0 ? 1 : 2;
        await connection.execute(
          `INSERT INTO product_images (product_id, image_url, image_order, role) VALUES (?, ?, ?, ?)`,
          [id, imageUrl, i + 1, role]
        );
      }
    }

    if (detailFiles.length > 0) {
      const [oldDetailImages] = await connection.execute(
        `SELECT image_url FROM product_images WHERE product_id = ? AND role = 3`, [id]
      );
      await connection.execute(
        `DELETE FROM product_images WHERE product_id = ? AND role = 3`, [id]
      );
      oldDetailImages.forEach(({ image_url }) => {
        const filePath = path.join(path.resolve(), image_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
      for (let i = 0; i < detailFiles.length; i++) {
        const imageUrl = `/uploads/${detailFiles[i].filename}`;
        await connection.execute(
          `INSERT INTO product_images (product_id, image_url, image_order, role) VALUES (?, ?, ?, ?)`,
          [id, imageUrl, i + 1, 3]
        );
      }
    }

    await connection.commit();
    return response.success(res, {}, "商品が修正されました。");
  } catch (error) {
    await connection.rollback();
    console.error("商品修正エラー:", error);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  } finally {
    connection.release();
  }
};

//おすすめステータス更新関数
export const patchRecommendStatus = async (req, res) => {
  const { productId } = req.params;
  const { is_recommended } = req.body;

  if (is_recommended === undefined || ![0, 1].includes(Number(is_recommended))) {
    return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);
  }

  try {
    const affectedRows = await productModel.updateRecommendStatus(productId, is_recommended);

    if (affectedRows === 0) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);
    }

    return response.success(res, { is_recommended }, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (error) {
    console.error("コントローラエラー：", error);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

// チェックされた商品の状態（在庫状態など）を一括変更
export const bulkUpdateStatus = async (req, res) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);
  }

  try {
    const affectedRows = await productModel.bulkUpdateStatus(ids, status);

    if (affectedRows === 0) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);
    }

    return response.success(res, { affectedRows }, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (error) {
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};



/*export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await productModel.deleteProduct(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "商品が存在しません。" });
    }

    res.json({ message: "商品が削除されました。" });
  } catch (error) {
    console.error("商品削除エラー:", error);
    res.status(500).json({ message: "商品削除中にエラーが発生しました。" });
  }
};*/