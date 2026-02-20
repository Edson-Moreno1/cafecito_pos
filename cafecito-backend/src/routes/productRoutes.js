import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';
import { isAdmin, verifyToken } from '../middlewares/authMiddleware.js';
import { 
    validateCreateProduct, 
    validateUpdateProduct, 
    handleValidationErrors 
} from '../validators/productValidator.js';

const router = express.Router();

// Público
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Solo admin — validadores → handleErrors → controller
router.post('/', verifyToken, isAdmin, validateCreateProduct, handleValidationErrors, createProduct);
router.put('/:id', verifyToken, isAdmin, validateUpdateProduct, handleValidationErrors, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

export default router;