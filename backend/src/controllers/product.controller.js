import * as productModel from "../models/product.model.js";

// 상품 조회 (페이지네이션)
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24; //24개까지
    
    const result = await productModel.getAllProducts(page, limit);
    res.json(result);
  } catch (error) {
    console.error("상품 조회 오류:", error);
    res.status(500).json({ message: "상품 조회 중 오류가 발생했습니다." });
  }
};

// 상품 상세 조회
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.json(product);
  } catch (error) {
    console.error("상품 상세 조회 오류:", error);
    res.status(500).json({ message: "상품 조회 중 오류가 발생했습니다." });
  }
};

// 카테고리별 상품 조회
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

// 상품 생성
export const createProduct = async (req, res) => {
  try {
    const productId = await productModel.createProduct(req.body);
    res.status(201).json({
      message: "상품이 생성되었습니다.",
      product_id: productId,
    });
  } catch (error) {
    console.error("상품 생성 오류:", error);
    res.status(500).json({ message: "상품 생성 중 오류가 발생했습니다." });
  }
};

// 상품 수정
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

// 상품 삭제
export const deleteProduct = async (req, res) => {
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
};