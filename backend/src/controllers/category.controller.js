import * as categoryModel from "../models/category.model.js";
import response from "../utils/response.js";
import { RESPONSE_MESSAGES } from "../config/constants.js";

//すべてのカテゴリを検索
export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    return response.success(res, { categories }, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (error) {
    console.error("カテゴリー取得エラー:", error);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.CATEGORY_FETCH_FAILED);
  }
};

//カテゴリ詳細検索
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.getCategoryById(id);

    if (!category) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.CATEGORY_NOT_FOUND);
    }

    return response.success(res, { category }, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (error) {
    console.error("カテゴリー詳細取得エラー:", error);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.CATEGORY_FETCH_FAILED);
  }
};

//カテゴリの作成
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return response.error(res, "カテゴリー名は必須です。", 400);
    }

    const categoryId = await categoryModel.createCategory(name);
    return response.success(res, { category_id: categoryId }, RESPONSE_MESSAGES.SUCCESS.CATEGORY_SAVE, 201);
  } catch (error) {
    console.error("カテゴリー作成エラー:", error);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.CATEGORY_FETCH_FAILED);
  }
};

//カテゴリを編集
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.CATEGORY_NAME_NEED);
    }

    const affectedRows = await categoryModel.updateCategory(id, name);

    if (affectedRows === 0) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.CATEGORY_NOT_FOUND);
    }

    return response.success(res, {}, RESPONSE_MESSAGES.SUCCESS.CATEGORY_CONTENT_CHANGE);
  } catch (error) {
    console.error("カテゴリー修正エラー:", error);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

//カテゴリロジックの削除
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await categoryModel.deleteCategory(id);

    if (affectedRows === 0) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.CATEGORY_NOT_FOUND);
    }

    return response.success(res, {}, RESPONSE_MESSAGES.SUCCESS.CATEGORY_CONTENT_CHANGE);
  } catch (error) {
    console.error("カテゴリー非公開エラー:", error);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};