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

    const response_p = { //이미지 리스트 구별
      ...product,
      mainImage: product.images.find(img => img.role === 1)?.image_url || null,
      subImages: product.images.filter(img => img.role === 2).map(img => img.image_url),
      detailImages: product.images.filter(img => img.role === 3).map(img => img.image_url),
    };

    return res.json(response_p);
  } catch (error) {
    console.error("商品詳細取得エラー:", error); 
    return response.error(res , "商品詳細取得エラーが発生しました。" , 500);
  }
};

export const getAllProductsForAdmin = async (req, res) => { //관리자 페이지용 상품검색
  try {
    
    const { name, product_id, category_id, status, startDate, endDate } = req.query; //한페이지 10개씩 보이게
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);

    const F_StartDate = startDate ? `${startDate} 00:00:00` : null;
    const F_EndDate = endDate ? `${endDate} 23:59:59` : null;

    const offset = (Number(page) - 1) * limit;

    const filters = { //비우면 전체검색 되게 undefined로 비움
      product_id: product_id || undefined,
      name: name || undefined,
      category_id: category_id || undefined,
      status: (status !== undefined && status !== "") ? status : undefined,
      created_at: (F_StartDate && F_EndDate) ? [F_StartDate, F_EndDate] : undefined,
      limit: limit,
      offset: offset
    };
    const { products, totalCount } = await productModel.findProducts(filters);
    
    res.json({
      success: true,
      products: products,
      pagination: {
        totalItems: totalCount,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / limit) || 1 
      }
    });
  } catch (err) {
    console.error("管理者商品一覧取得エラー:", err);
    return response.error(res, "商品一覧取得エラー", 500);
  }
};

export const getProducts = async (req, res) => { //메인화면용 카테고리 상품검색 함수
  try {
    const { category, name } = req.query; 
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 24); //한페이지 6X4= 24개
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
    return response.error(res , "商品一覧取得エラーが発生しました。" , 500);
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

    return response.success(res, { productId }, "商品が正常に登録されました。", 201);
    /*res.status(201).json({  
      success: true, 
      message: "商品が正常に登録されました。",
      productId: productId 
    });*/

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

// 추천 상태 업데이트 함수
export const patchRecommendStatus = async (req, res) => {
  const { productId } = req.params;
  const { is_recommended } = req.body;

  if (is_recommended === undefined || ![0, 1].includes(Number(is_recommended))) {
    return response.error(res, "商品修正エラーが発生しました。", 400);
  }

  try {
    const affectedRows = await productModel.updateRecommendStatus(productId, is_recommended);

    if (affectedRows === 0) {
      return response.error(res, "商品エラーが発生しました。", 404);
    }

    return response.success(res, { is_recommended }, "おすすめ状態が更新されました。");
  } catch (error) {
    console.error("컨트롤러 에러 (patchRecommendStatus):", error);
    return response.error(res, "サーバーエラーが発生しました。", 500);
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