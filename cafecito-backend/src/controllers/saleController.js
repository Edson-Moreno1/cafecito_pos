import mongoose from "mongoose"; 
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

import { calculateDiscount,getLoyaltyMessage } from "../services/discountService.js";
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

        // Preparar la venta 
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
        //Paso 6: Persitencia Atomica

        let savedSale;

        const session = await mongoose.startSession();
        session.startTransaction();
        try {

        savedSale = await newSale.save({ session });

        // B. Actualizar al Cliente (+1 compra) SOLO SI EXISTE
        if (customer) {
            customer.purchasesCount += 1;
            await customer.save({ session });
        }

        // C. Actualizar Stock de Productos
        for(const itemRequest of items){
            await Product.findByIdAndUpdate(itemRequest.product, {
                $inc: {stock: -itemRequest.quantity}
            }, { session });
        }
        //Todo salió bien → confirmar cambios
        await session.commitTransaction();

    }catch(error){
         //Algo falló → revertir TODO
        await session.abortTransaction();
        throw error;
    } finally {
        //  Siempre cerrar la sesión
        session.endSession();
    }

        // Paso 6.5 Construir ticket
        // El mensaje se calucla DESPUES del incremento de purchasesCount

        const LoyaltyMessage =customer ? getLoyaltyMessage(customer.purchasesCount): "Bienvenido a cafecito feliz";
        const ticket ={
            saleId: uniqueSaleId,
            timestamp: savedSale.createdAt,
            storeName: "Cafecito Feliz",
            customerName: customer ? customer.name : "Cliente Anónimo",
            items: saleDetails.map(item => ({
                name: item.productNameSnapshot,
                qty: item.quantity,
                unitPrice: item.unitPriceSnapshot,
                lineTotal: item.lineTotal
            })),
            subtotal: subtotal,
            discount: `${discountPercentage}% (-$${discountAmount.toFixed(2)})`,
            total: finaltotal,
            paymentMethod: paymentMethod,
            loyaltyMessage: LoyaltyMessage
        };

        // Paso 7: Respuesta al FrontEnd
        res.status(201).json({
            message: "Venta registrada con éxito",
            sale: savedSale,
            ticket: ticket
        });
            
    }catch(error){
        console.error("Error al crear venta:", error);
        res.status(500).json({
            message: "Error interno al procesar la venta",
            error: error.message
        });
    }
};

//Paginacion en getSales 

export const getSales = async (req, res) => {
    try{
        const { page = 1, limit = 20} = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        if(isNaN(pageNum)|| pageNum <1){
            return res.status(400).json({message: 'page debe ser un entero mayor a 0'});
        }
        if(isNaN(limitNum)|| limitNum <1 || limitNum >100){
            return res.status(400).json({message: 'limit debe ser un entero entre 1 y 100'});
        }
        const skip = (pageNum -1) * limitNum;
        const [sales, total] = await Promise.all([
            Sale.find()
                .populate("customerId", " name email phone")
                .sort({ createdAt: -1})
                .skip(skip)
                .limit(limitNum),
            Sale.countDocuments()
        ]);
        res.status(200).json({
            data: sales,
            total: total,
            page: pageNum,
            limit: limitNum
        });
    }catch(error){
        res.status(500).json({message: "Error al obtener las ventas", error: error.message});
    }
};

export const getSaleById = async (req, res) => {
    try{
        const { id } = req.params;
        const query = mongoose.Types.ObjectId.isValid(id) ? {$or: [{_id: id},{saleId: id}]}:{saleId: id};
        const sale = await Sale.findOne(query).populate("customerId", "name email");

        if(!sale){
            return res.status(404).json({ message: "Venta no encontrada"});
        }

        res.status(200).json(sale);
    }catch(error){
        res.status(500).json({ message: "Error al obtener la venta", error: error.message });
    }
};