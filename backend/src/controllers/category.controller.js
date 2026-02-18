import * as categoryModel from "../models/category.model.js";

// 모든 카테고리 조회
export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error("카테고리 조회 오류:", error);
    res.status(500).json({ message: "카테고리 조회 중 오류가 발생했습니다." });
  }
};

// 카테고리 상세 조회
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.getCategoryById(id);

    if (!category) {
      return res.status(404).json({ message: "카테고리를 찾을 수 없습니다." });
    }

    res.json(category);
  } catch (error) {
    console.error("카테고리 상세 조회 오류:", error);
    res.status(500).json({ message: "카테고리 조회 중 오류가 발생했습니다." });
  }
};

// 카테고리 생성
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "카테고리 이름은 필수입니다." });
    }

    const categoryId = await categoryModel.createCategory(name);
    res.status(201).json({
      message: "카테고리가 생성되었습니다.",
      category_id: categoryId,
    });
  } catch (error) {
    console.error("카테고리 생성 오류:", error);
    res.status(500).json({ message: "카테고리 생성 중 오류가 발생했습니다." });
  }
};

// 카테고리 수정
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "카테고리 이름은 필수입니다." });
    }

    const affectedRows = await categoryModel.updateCategory(id, name);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "카테고리를 찾을 수 없습니다." });
    }

    res.json({ message: "카테고리가 수정되었습니다." });
  } catch (error) {
    console.error("카테고리 수정 오류:", error);
    res.status(500).json({ message: "카테고리 수정 중 오류가 발생했습니다." });
  }
};

// 카테고리 논리 삭제
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await categoryModel.deleteCategory(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "카테고리를 찾을 수 없습니다." });
    }

    res.json({ message: "카테고리가 비공개되었습니다." });
  } catch (error) {
    console.error("카테고리 비공개 오류:", error);
    res.status(500).json({ message: "카테고리 비공개 중 오류가 발생했습니다." });
  }
};