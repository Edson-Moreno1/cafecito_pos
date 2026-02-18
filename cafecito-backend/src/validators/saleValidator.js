import {body, validationResult} from "express-validator";

export const validateCreateSale = [

    body('items')
        .isArray({min: 1})
        .withMessage('Item debe ser un array con al menos 1 producto'),
        
    body('items.*.product')
        .notEmpty()
        .withMessage('Cada item debe tener un product (ID del producto)'),
        
    body('items.*.quantity')
        .isInt({min: 1})
        .withMessage('La cantidad debe ser un número entero mayor o igual a 1'),
        
    body('paymentMethod')
        .optional()
        .isIn(['cash', 'card','transfer'])
        .withMessage('Método de pago debe ser: cash, card o transfer'),
];

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if ( !errors.isEmpty()) {
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