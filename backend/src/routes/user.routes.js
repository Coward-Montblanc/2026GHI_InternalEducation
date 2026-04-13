import express from "express";
import {
  getUsers, 
  createUser, 
  deleteUser, 
  updateUser, 
  getUserAddresses,
  addUserAddress,
  updateDefaultAddress,
  getAdminUsers
} from "../controllers/user.controller.js"; 
import { authenticateToken } from "../middlewares/auth.middleware.js"; 

const router = express.Router();
router.get('/adminUsers', authenticateToken, getAdminUsers);
router.patch("/addresses/default", authenticateToken, updateDefaultAddress);
router.get("/addresses", authenticateToken, getUserAddresses); 
router.post("/addresses", authenticateToken, addUserAddress);
router.post("/register", createUser);
router.put("/update-profile", authenticateToken, updateUser); 


router.get("/", getUsers);

router.post("/", createUser);

router.delete("/:id", deleteUser);

router.put("/:id", updateUser);


export default router;