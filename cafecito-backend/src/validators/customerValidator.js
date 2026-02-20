import { body, validationResult } from "express-validator";

// Validación para POST /api/customers
export const validateCreateCustomer = [
    body('name')
        .notEmpty().withMessage('El nombre es requerido')
        .isString().withMessage('El nombre debe ser texto')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('email')
        .optional({ values: 'falsy' })  // Permite null, "", undefined
        .isEmail().withMessage('El email debe tener un formato válido'),

    body('phone')
        .optional({ values: 'falsy' })
        .isString().withMessage('El teléfono debe ser texto')
        .isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 caracteres'),

    // Validación custom: al menos uno de los dos es requerido
    body().custom((_, { req }) => {
        if (!req.body.phone && !req.body.email) {
            throw new Error('Se requiere al menos un teléfono o email');
        }
        return true;
    }),
];

// Validación para PUT /api/customers/:id
export const validateUpdateCustomer = [
    body('name')
        .optional()
        .isString().withMessage('El nombre debe ser texto')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('email')
        .optional({ values: 'falsy' })
        .isEmail().withMessage('El email debe tener un formato válido'),

    body('phone')
        .optional({ values: 'falsy' })
        .isString().withMessage('El teléfono debe ser texto')
        .isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 caracteres'),
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