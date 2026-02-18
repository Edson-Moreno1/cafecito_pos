import express from 'express';
import { createSale, getSales } from '../controllers/saleController.js';
import { validateCreateSale, handleValidationErrors } from '../validators/saleValidator.js';

const router = express.Router();

router.post('/', validateCreateSale, handleValidationErrors, createSale);
router.get('/', getSales);


export default router;

