import express from 'express';
import {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
} from '../controllers/customerController.js';
import { isVendedorOrAdmin, verifyToken } from '../middlewares/authMiddleware.js';
import { 
    validateCreateCustomer, 
    validateUpdateCustomer, 
    handleValidationErrors 
} from '../validators/customerValidator.js';

const router = express.Router();

router.get('/', verifyToken, isVendedorOrAdmin, getAllCustomers);
router.get('/:id', verifyToken, isVendedorOrAdmin, getCustomerById);
router.post('/', verifyToken, isVendedorOrAdmin, validateCreateCustomer, handleValidationErrors, createCustomer);

// --- FIX: PUT y DELETE ahora tienen verifyToken + isVendedorOrAdmin ---
// Antes estaban completamente desprotegidos
router.put('/:id', verifyToken, isVendedorOrAdmin, validateUpdateCustomer, handleValidationErrors, updateCustomer);
router.delete('/:id', verifyToken, isVendedorOrAdmin, deleteCustomer);

export default router;