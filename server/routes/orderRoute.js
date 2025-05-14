import express from 'express';
import authUser from '../middlewares/authUser.js';
import { cancelOrderByAdmin, cancelOrderByUser, deliverOrderByAdmin, getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD)
orderRouter.get('/user', authUser, getUserOrders)
orderRouter.get('/seller', authSeller, getAllOrders)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.put("/cancel/user/:orderId", authUser, cancelOrderByUser);
orderRouter.put("/cancel/seller/:orderId", authSeller, cancelOrderByAdmin);
orderRouter.put("/deliver/seller/:orderId", authSeller, deliverOrderByAdmin);

export default orderRouter;