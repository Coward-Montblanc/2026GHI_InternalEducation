import * as categoryModel from "../models/category.model.js";
import response from "../utils/response.js";

// 모든 카테고리 조회
export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error("カテゴリー取得エラー:", error);
    return response.error(res, "カテゴリー取得中にエラーが発生しました。", 500);
  }
};

// 카테고리 상세 조회
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.getCategoryById(id);

    if (!category) {
      return response.error(res, "カテゴリーが存在しません。", 404);
    }

    res.json(category);
  } catch (error) {
    console.error("カテゴリー詳細取得エラー:", error);
    return response.error(res, "カテゴリー詳細取得中にエラーが発生しました。", 500);
  }
};

// 카테고리 생성
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return response.error(res, "カテゴリー名は必須です。", 400);
    }

    const categoryId = await categoryModel.createCategory(name);
    return response.success(res, { category_id: categoryId }, "カテゴリーが作成されました。", 201);
  } catch (error) {
    console.error("カテゴリー作成エラー:", error);
    return response.error(res, "カテゴリー作成中にエラーが発生しました。", 500);
  }
};

// 카테고리 수정
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return response.error(res, "カテゴリー名は必須です。", 400);
    }

    const affectedRows = await categoryModel.updateCategory(id, name);

    if (affectedRows === 0) {
      return response.error(res, "カテゴリーが存在しません。", 404);
    }

    res.json({ message: "カテゴリーが修正されました。" });
  } catch (error) {
    console.error("カテゴリー修正エラー:", error);
    return response.error(res, "カテゴリー修正中にエラーが発生しました。", 500);
  }
};

// 카테고리 논리 삭제
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await categoryModel.deleteCategory(id);

    if (affectedRows === 0) {
      return response.error(res, "カテゴリーが存在しません。", 404);
    }

    res.json({ message: "カテゴリーが非公開になりました。" });
  } catch (error) {
    console.error("カテゴリー非公開エラー:", error);
    return response.error(res, "カテゴリー非公開中にエラーが発生しました。", 500);
  }
};