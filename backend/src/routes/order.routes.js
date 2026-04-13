import express from "express";
import * as orderController from "../controllers/order.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js"; 

const router = express.Router();

router.get('/admin/stats/sales-trend', authenticateToken, orderController.getAdminSalesStats); 
router.get('/admin/:orderId', orderController.getOrderDetailAdmin); 
router.patch('/admin/:orderId', orderController.patchOrderStatusAdmin); 
router.get('/', authenticateToken, orderController.getAdminOrders);


router.post("/", authenticateToken, orderController.createOrder);

router.get("/:order_id", authenticateToken, orderController.getOrder);

router.get("/user/:login_id", authenticateToken, orderController.getOrdersByUser);

export default router;
