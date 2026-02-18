import express from 'express';
import { createSale, getSales } from '../controllers/saleController.js';
import { validateCreateSale, handleValidationErrors } from '../validators/saleValidator.js';
import { isVendedorOrAdmin,verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/',verifyToken,isVendedorOrAdmin, validateCreateSale, handleValidationErrors, createSale);
router.get('/', verifyToken, isVendedorOrAdmin, getSales);


export default router;

