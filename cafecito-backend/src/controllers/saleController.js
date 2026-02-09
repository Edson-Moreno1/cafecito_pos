import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

import { calculateDiscount } from "../services/discountService.js";
import { processSaleItems } from "../services/saleService.js";

export const createSale = async (req, res) => {
    try{
        const { customerId, items, paymentMethod } = req.body;

        console.log("--Iniciando nueva venta---");
        
        // Paso 1: Validar/Buscar cliente (SOLO SI EXISTE customerId)
        let customer = null;
        if (customerId) {
            customer = await Customer.findById(customerId);
            if (!customer) {
                return res.status(404).json({ message: "Cliente no encontrado" });
            }
        }

        // Paso 2: Obtener Productos de la base de datos
        const productsInDb = await Product.find({_id: { $in: items.map(item => item.product)}});
        
        // Validar que encontramos todos los productos solicitados
        if(productsInDb.length !== items.length){
            return res.status(400).json({ message: "Uno o más productos no existen en la base de datos" });
        }

        // Paso 3: Validar stock y calcular Subtotal 
        for(const itemRequest of items){
            const product = productsInDb.find(p => p._id.toString() === itemRequest.product);

            // Validar stock
            if(product.stock < itemRequest.quantity){
                return res.status(400).json({ message: `Stock insuficiente para: ${product.name}`});
            }
        }

        // Paso 4: Procesamiento de items
        const {subtotal, saleDetails} = processSaleItems(items, productsInDb);

        // Paso 5: Calcular Descuento
        const discountPercentage = customer ? calculateDiscount(customer.purchasesCount) : 0;
        const discountAmount = (subtotal * discountPercentage) / 100;
        const finaltotal = subtotal - discountAmount;

        // Generador de ID Único
        const uniqueSaleId = `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Paso 6: Persistencia (Guardar todo)
        // A. Guardar la venta
        const newSale = new Sale({
            saleId: uniqueSaleId,
            customerId: customer ? customer._id : null,
            items: saleDetails,
            subtotal: subtotal,
            discountPercent: discountPercentage,
            discountAmount: discountAmount,
            total: finaltotal,
            paymentMethod: paymentMethod
        });
        const savedSale = await newSale.save();

        // B. Actualizar al Cliente (+1 compra) SOLO SI EXISTE
        if (customer) {
            customer.purchasesCount += 1;
            await customer.save();
        }

        // C. Actualizar Stock de Productos
        for(const itemRequest of items){
            await Product.findByIdAndUpdate(itemRequest.product, {
                $inc: {stock: -itemRequest.quantity}
            });
        }

        // Paso 7: Respuesta al FrontEnd
        res.status(201).json({
            message: "Venta registrada con éxito",
            sale: savedSale
        });
            
    }catch(error){
        console.error("Error al crear venta:", error);
        res.status(500).json({
            message: "Error interno al procesar la venta",
            error: error.message
        });
    }
};

export const getSales = async (req, res) => {
    try{
        const sales = await Sale.find()
        .populate("customerId", "name email")
        .sort({ createdAt: -1});

        res.status(200).json(sales);
    }catch(error){
        res.status(500).json({ message: "Error al obtener las ventas"});
    }
};

export const getSalebyId = async (req, res) => {
    try{
        const { id } = req.params;

        const sale = await Sale.findOne({
            $or: [{_id: id}, {saleId: id}]
        }).populate("customerId", "name email");

        if(!sale){
            return res.status(404).json({ message: "Venta no encontrada"});
        }

        res.status(200).json(sale);
    }catch(error){
        res.status(500).json({ message: "Error al obtener la venta"});
    }
};