import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { addProduct, changeStock, deleteProduct, productById, productByIdUp, productList, updateProduct } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post('/add', upload.array(["images"]), authSeller, addProduct);
productRouter.get('/list', productList)
productRouter.get('/id', productById)
productRouter.get('/:id', productByIdUp)
productRouter.post('/stock', authSeller, changeStock)
productRouter.delete("/delete/:id", authSeller, deleteProduct); 
productRouter.put('/update/:id', authSeller, updateProduct);


export default productRouter;