import db from "../config/db.js";
import * as productModel from "../models/product.model.js";


// 인기상품 조회 (view 10 이상) 프론트엔드로는 아직 미구현
export const getRankProducts = async (req, res) => {
  try {
    const products = await productModel.getRankProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "人気商品取得エラー" });
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
    if (!product) return res.status(404).json({ message: "商品が存在しません。" });
    res.json(product);
  } catch (error) {
    console.error("商品詳細取得エラー:", error); 
    res.status(500).json({ message: "商品詳細取得エラーが発生しました。" });
  }
};

export const createProduct = async (req, res) => {
  // デバッグログ
  console.log("受信したBODY:", req.body);
  console.log("受信したFILES:", req.files);

  const { category_id, name, description, price, stock } = req.body;
  const files = req.files;

  // 이미지 파일 유무 확인
  if (!files || files.length === 0) {
    return res.status(400).json({ success: false, message: "画像ファイルがありません。" });
  }

  // 필수 텍스트 데이터가 비어있는지 확인
  if (!category_id || !name || !price) {
     return res.status(400).json({ success: false, message: "必須情報が不足しています。" });
  }

  const connection = await db.getConnection(); //이미지가 없을 경우를 대비한 트랜잭션 커넥션

  try { 
    //상품 기본 정보 저장
    await connection.beginTransaction(); //트랜잭션 시작, 

    const [productResult] = await connection.execute( //DB가 아닌 트랜잭션
      `INSERT INTO products (category_id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)`,
      [category_id, name, description, price, stock]
    );

    const productId = productResult.insertId;
    console.log("生成された商品ID:", productId);

    // 이미지 정보 저장 (루프를 돌며 DB에 기록)
    for (let i = 0; i < files.length; i++) {
      const imageUrl = `/uploads/${files[i].filename}`;
      const role = (i === 0) ? 'MAIN' : 'SUB'; //메인 서브 이미지 판별

      await connection.execute(
        `INSERT INTO product_images (product_id, image_url, image_order, role) VALUES (?, ?, ?, ?)`,
        [productId, imageUrl, i + 1, role]
      );
    }

    await connection.commit(); //트랜잭션 끝. 모든 작업이 성공하면 DB반영

    // 성공 응답 (프론트엔드의 res.data.success 조건과 일치시킴)
    res.status(201).json({ 
      success: true, 
      message: "商品が正常に登録されました。",
      productId: productId 
    });

  } catch (error) {
    console.error("登録エラー詳細:", error);
    res.status(500).json({ success: false, message: "サーバー保存中にエラーが発生しました。" });
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
    console.error("商品取得エラー:", error);
    res.status(500).json({ message: "商品取得中にエラーが発生しました。" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id); // 모델에서 이미지를 가져옴
    
    if (!product) return res.status(404).json({ message: "商品が存在しません。" });

    const response = {
      product,
      mainImage: product.images.find(img => img.role === 'MAIN')?.image_url || null,
      subImages: product.images.filter(img => img.role === 'SUB').map(img => img.image_url),
      detailImages: product.images.filter(img => img.role === 'DETAIL').map(img => img.image_url),
      view: product.view // 조회수 추가
    };

    res.json(response);
  } catch (error) {
    console.error("商品詳細取得エラー:", error);
    res.status(500).json({ message: "商品詳細取得中にエラーが発生しました。" });
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
    res.status(500).json({ message: "商品取得中にエラーが発生しました。" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await productModel.updateProduct(id, req.body);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "商品が存在しません。" });
    }

    res.json({ message: "商品が修正されました。" });
  } catch (error) {
    console.error("商品修正エラー:", error);
    res.status(500).json({ message: "商品修正中にエラーが発生しました。" });
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