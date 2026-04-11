import express from "express";
import * as cartController from "../controllers/cart.controller.js"; 
import { authenticateToken } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.patch("/item/:cart_item_id/status", authenticateToken, cartController.toggleCartItemStatus);

router.delete("/item/:cart_item_id", authenticateToken, cartController.removeCartItem);

router.post("/addcart", authenticateToken, cartController.addToCart);

router.get("/:login_id", authenticateToken, cartController.getCartItems);



export default router;