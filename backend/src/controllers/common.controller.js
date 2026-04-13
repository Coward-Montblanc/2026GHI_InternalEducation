import * as commonModel from '../models/common.model.js';
import response from "../utils/response.js";
import { RESPONSE_MESSAGES, STATUS_MESSAGES } from "../config/constants.js";
import fs from 'fs';
import path from 'path';

//ファイルアップロード関連
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_ENTERED);
    }

    const baseUrl = process.env.VITE_API_URL || 'http://localhost:3000';
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    return response.success(res, { 
      url: imageUrl, 
      fileName: req.file.filename 
    }, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
    
  } catch (err) {
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

export const deleteImageFile = async (req, res) => {
  try {
    const { fileNames } = req.body;

    if (!fileNames || !Array.isArray(fileNames)) {
      return response.success(res, {}, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
    }

    fileNames.forEach(fileName => {
      if (typeof fileName !== 'string') return; 

      const safeFileName = path.basename(fileName);
      const filePath = path.join(path.resolve(), "uploads", safeFileName);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted: ${safeFileName}`);
      }
    });

    return response.success(res, {}, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (err) {
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};


//select文データ関連
export const getCommonCodes = async (req, res) => {
  try {
    const { group_code } = req.params;

    const filter = { is_used: STATUS_MESSAGES.is_used.Enable };
    
    if (group_code !== 'all') {
      filter.group_code = group_code;
    }

    const codes = await commonModel.findCodesByGroup(filter);

    return response.success(res, { codes }, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (err) {
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

export const addCommonCode = async (req, res) => {
  try {
    const id = await commonModel.createCommonCode(req.body);
    return response.success(res, { id }, 201);
  } catch (err) {
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};

export const patchCodeStatus = async (req, res) => {
  try {
    const { codeId } = req.params;
    const { is_used } = req.body;

    const success = await commonModel.updateCodeStatus(codeId, is_used);

    if (success) {
      return response.success(res, {}, 200);
    } else {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);
    }
  } catch (err) {
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};