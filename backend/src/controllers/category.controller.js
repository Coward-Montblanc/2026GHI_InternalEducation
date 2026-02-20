import * as categoryModel from "../models/category.model.js";

// 모든 카테고리 조회
export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error("カテゴリー取得エラー:", error);
    res.status(500).json({ message: "カテゴリー取得中にエラーが発生しました。" });
  }
};

// 카테고리 상세 조회
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.getCategoryById(id);

    if (!category) {
      return res.status(404).json({ message: "カテゴリーが存在しません。" });
    }

    res.json(category);
  } catch (error) {
    console.error("カテゴリー詳細取得エラー:", error);
    res.status(500).json({ message: "カテゴリー詳細取得中にエラーが発生しました。" });
  }
};

// 카테고리 생성
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "カテゴリー名は必須です。" });
    }

    const categoryId = await categoryModel.createCategory(name);
    res.status(201).json({
      message: "カテゴリーが作成されました。",
      category_id: categoryId,
    });
  } catch (error) {
    console.error("カテゴリー作成エラー:", error);
    res.status(500).json({ message: "カテゴリー作成中にエラーが発生しました。" });
  }
};

// 카테고리 수정
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "カテゴリー名は必須です。" });
    }

    const affectedRows = await categoryModel.updateCategory(id, name);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "カテゴリーが存在しません。" });
    }

    res.json({ message: "カテゴリーが修正されました。" });
  } catch (error) {
    console.error("カテゴリー修正エラー:", error);
    res.status(500).json({ message: "カテゴリー修正中にエラーが発生しました。" });
  }
};

// 카테고리 논리 삭제
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await categoryModel.deleteCategory(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "カテゴリーが存在しません。" });
    }

    res.json({ message: "カテゴリーが非公開になりました。" });
  } catch (error) {
    console.error("カテゴリー非公開エラー:", error);
    res.status(500).json({ message: "カテゴリー非公開中にエラーが発生しました。" });
  }
};