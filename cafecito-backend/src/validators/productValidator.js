import { body, validationResult } from "express-validator";

// Validación para POST /api/products
export const validateCreateProduct = [
    body('name')
        .notEmpty().withMessage('El nombre es requerido')
        .isString().withMessage('El nombre debe ser texto')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('price')
        .notEmpty().withMessage('El precio es requerido')
        .isFloat({ gt: 0 }).withMessage('El precio debe ser mayor a 0'),

    body('stock')
        .notEmpty().withMessage('El stock es requerido')
        .isInt({ min: 0 }).withMessage('El stock debe ser un entero mayor o igual a 0'),

    body('description')
        .optional()
        .isString().withMessage('La descripción debe ser texto'),
];

// Validación para PUT /api/products/:id
// Mismas reglas pero todos los campos son opcionales
export const validateUpdateProduct = [
    body('name')
        .optional()
        .isString().withMessage('El nombre debe ser texto')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('price')
        .optional()
        .isFloat({ gt: 0 }).withMessage('El precio debe ser mayor a 0'),

    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('El stock debe ser un entero mayor o igual a 0'),

    body('description')
        .optional()
        .isString().withMessage('La descripción debe ser texto'),
];

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: 'Error de validación',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};