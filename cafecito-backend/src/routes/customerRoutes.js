import express from 'express';
import {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
} from '../controllers/customerController.js';
import { isVendedorOrAdmin, verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken,isVendedorOrAdmin, getAllCustomers);
router.get('/:id', verifyToken,isVendedorOrAdmin, getCustomerById);
router.post('/', verifyToken,isVendedorOrAdmin, createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;