import express from 'express';
import { createSale, getSales,getSaleById } from '../controllers/saleController.js';
import { validateCreateSale, handleValidationErrors } from '../validators/saleValidator.js';
import { isVendedorOrAdmin,verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/',verifyToken,isVendedorOrAdmin, validateCreateSale, handleValidationErrors, createSale);
router.get('/', verifyToken, isVendedorOrAdmin, getSales);
router.get('/:id', verifyToken, isVendedorOrAdmin, getSaleById);


export default router;

