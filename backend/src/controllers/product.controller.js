import db from "../config/db.js";
import * as productModel from "../models/product.model.js";
import response from "../utils/response.js";
import fs from "fs";
import path from "path";

// 인기상품 조회 (view 10 이상) 프론트엔드로는 아직 미구현
export const getRankProducts = async (req, res) => {
  try {
    const products = await productModel.getRankProducts();
    res.json(products);
  } catch (err) {
    return response.error(res , "人気商品取得エラー" , 500);
  }
};

// 상품 상세 조회 시 view 증가
export const getProductViewUp = async (req, res) => {
  try {
    const { id } = req.params;
    // GET 요청일 때만 조회수 증가 Options에서 확인과정에서 조회수가 한번 더 증가하기도 함. GET 요청이 아닐 때는 증가하지 않도록 조건 추가
    // +2이었던 원인 자체는 main.tsx에 있습니다. 
    if (req.method === "GET") {
      await productModel.incrementView(id);
    }
    const product = await productModel.getProductById(id);
    if (!product) return response.error(res , "商品が存在しません。" , 404);
    res.json(product);
  } catch (error) {
    console.error("商品詳細取得エラー:", error); 
    return response.error(res , "商品詳細取得エラーが発生しました。" , 500);
  }
};

export const getAllProductsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const data = await productModel.getAllProductsForAdmin(Number(page), Number(limit), search);
    res.json(data);
  } catch (err) {
    console.error("管理者商品一覧取得エラー:", err);
    return response.error(res, "商品一覧取得エラー", 500);
  }
};

export const createProduct = async (req, res) => {
  // デバッグログ
  console.log("受信したBODY:", req.body);
  console.log("受信したFILES:", req.files);

  const { category_id, name, description, price, stock } = req.body;
  const files = Array.isArray(req.files?.images) ? req.files.images : [];
  const detailFiles = Array.isArray(req.files?.detail_images) ? req.files.detail_images : [];

  // 이미지 파일 유무 확인
  if (!files || files.length === 0) {
    return response.error(res , "画像ファイルがありません。" , 400);
  }

  // 필수 텍스트 데이터가 비어있는지 확인
  if (!category_id || !name || !price) {
    return response.error(res , "必須情報が不足しています。" , 400);
  }

  const connection = await db.getConnection(); //이미지가 없을 경우를 대비한 트랜잭션 커넥션

  try { 
    //상품 기본 정보 저장
    await connection.beginTransaction(); //트랜잭션 시작, 

      //상품 아이디 지정방식이 varchar로 바뀌면서 바꿔야했습니다. 
    const productId = await productModel.createProduct(connection, {
      category_id,
      name,
      description,
      price,
      stock,
      status: 0,
    });
    console.log("生成された商品ID:", productId);

    // 사진 저장 메인1 서브2
    for (let i = 0; i < files.length; i++) { //첫번째 이미지를 메인으로 저장해주는 부분, for문을 통해서 번호 지정
      const imageUrl = `/uploads/${files[i].filename}`;
      const role = i === 0 ? 1 : 2; //main sub에서 12로 변경
      await connection.execute(
        `INSERT INTO product_images (product_id, image_url, image_order, role) VALUES (?, ?, ?, ?)`,
        [productId, imageUrl, i + 1, role]
      );
    }
    // role3은 상세 이미지로
    for (let i = 0; i < detailFiles.length; i++) {
      const imageUrl = `/uploads/${detailFiles[i].filename}`;
      await connection.execute(
        `INSERT INTO product_images (product_id, image_url, image_order, role) VALUES (?, ?, ?, ?)`,
        [productId, imageUrl, i + 1, 3]
      );
    }

    await connection.commit(); //트랜잭션 끝. 모든 작업이 성공하면 DB반영

    // 성공 응답 (프론트엔드의 res.data.success 조건과 일치시킴)
    res.status(201).json({  //response로 변경해야함.
      success: true, 
      message: "商品が正常に登録されました。",
      productId: productId 
    });

  } catch (error) {
    await connection.rollback();
    console.error("登録エラー詳細:", error);
    return response.error(res , "サーバー保存中にエラーが発生しました。" , 500);
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
    res.json(result);
  } catch (error) {
    console.error("商品取得エラー:", error?.message || error);
    return response.error(res , "商品取得中にエラーが発生しました。" , 500);
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id); // 모델에서 이미지를 가져옴
    
    if (!product) return response.error(res , "商品が存在しません。" , 404);

    const response_p = {
      product,
      mainImage: product.images.find(img => img.role === 1)?.image_url || null,
      subImages: product.images.filter(img => img.role === 2).map(img => img.image_url),
      detailImages: product.images.filter(img => img.role === 3).map(img => img.image_url),
      view: product.view // 조회수 추가
    };

    res.json(response_p);
  } catch (error) {
    console.error("商品詳細取得エラー:", error);
    return response.error(res , "商品詳細取得中にエラーが発生しました。" , 500);
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
    return response.error(res , "商品取得中にエラーが発生しました。" , 500);
  }
};

//상품수정
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const files       = req.files?.images        ?? [];
  const detailFiles = req.files?.detail_images ?? [];

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 텍스트 정보 수정
    const affectedRows = await productModel.updateProduct(id, req.body);
    if (affectedRows === 0) {
      await connection.rollback();
      return response.error(res, "商品が存在しません。", 404);
    }

    // 일단 이미지를 새로 추가해야만 바뀌는 방식,x버튼등을 클릭해서 삭제하는 방식을 고려중
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
    res.json({ success: true, message: "商品が修正されました。" });
  } catch (error) {
    await connection.rollback();
    console.error("商品修正エラー:", error);
    return response.error(res, "商品修正エラーが発生しました。", 500);
  } finally {
    connection.release();
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