import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';
import { isAdmin, verifyToken } from '../middlewares/authMiddleware.js';


const router = express.Router();

//Público

router.get('/', getAllProducts);
router.get('/:id', getProductById);
// Solo admin
router.post('/', verifyToken,isAdmin, createProduct);
router.put('/:id',verifyToken,isAdmin, updateProduct);
router.delete('/:id', verifyToken,isAdmin, deleteProduct);

export default router;