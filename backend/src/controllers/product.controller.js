import db from "../config/db.js";
import * as productModel from "../models/product.model.js";



export const createProduct = async (req, res) => {
  // 디버깅 로그
  console.log("수신된 BODY:", req.body);
  console.log("수신된 FILES:", req.files);

  const { category_id, name, description, price, stock } = req.body;
  const files = req.files;

  // 이미지 파일 유무 확인
  if (!files || files.length === 0) {
    return res.status(400).json({ success: false, message: "이미지 파일이 없습니다." });
  }

  // 필수 텍스트 데이터가 비어있는지 확인
  if (!category_id || !name || !price) {
     return res.status(400).json({ success: false, message: "필수 정보가 누락되었습니다." });
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
    console.log("생성된 상품 ID:", productId);

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
      message: "상품이 성공적으로 등록되었습니다!",
      productId: productId 
    });

  } catch (error) {
    console.error("등록 에러 상세:", error);
    res.status(500).json({ success: false, message: "서버 저장 중 오류가 발생했습니다." });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    
    // Model의 쿼리도 새로운 테이블 구조(BIGINT 등)를 지원해야 함
    const result = await productModel.getAllProducts(page, limit);
    res.json(result);
  } catch (error) {
    console.error("상품 조회 오류:", error);
    res.status(500).json({ message: "상품 조회 중 오류가 발생했습니다." });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id); // 모델에서 이미지를 가져옴
    
    if (!product) return res.status(404).json({ message: "상품 없음" });

    const response = {
      ...product,
      mainImage: product.images.find(img => img.role === 'MAIN')?.image_url || null,
      subImages: product.images.filter(img => img.role === 'SUB').map(img => img.image_url),
      detailImages: product.images.filter(img => img.role === 'DETAIL').map(img => img.image_url)
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: "조회 중 오류" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await productModel.getProductsByCategory(categoryId);
    res.json(products);
  } catch (error) {
    console.error("카테고리별 상품 조회 오류:", error);
    res.status(500).json({ message: "상품 조회 중 오류가 발생했습니다." });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await productModel.updateProduct(id, req.body);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.json({ message: "상품이 수정되었습니다." });
  } catch (error) {
    console.error("상품 수정 오류:", error);
    res.status(500).json({ message: "상품 수정 중 오류가 발생했습니다." });
  }
};

/*export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await productModel.deleteProduct(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.json({ message: "상품이 삭제되었습니다." });
  } catch (error) {
    console.error("상품 삭제 오류:", error);
    res.status(500).json({ message: "상품 삭제 중 오류가 발생했습니다." });
  }
};*/
