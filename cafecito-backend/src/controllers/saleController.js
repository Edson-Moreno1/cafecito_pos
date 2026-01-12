import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

import { calculateDiscount } from "../services/discountService.js";

export const createSale = async (req, res) => {
    try{
        const { customerId,items, paymentMethod } = req.body;

        console.log("--Iniciando nueva venta---")
// Paso1: Validar /Buscar cliente
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
//Paso 2: Obtener Productos de la base de datos
        const productsInDb = await Product.find({_id: { $in: items.map(item => item.productId)}});
//Validar que encontramos todos los productos solicitados
        if(productsInDb.length !== items.length){
            return res.status(400).json({ message: "Uno o más productos no existen en la base de datos" });
        }
//Paso 3: Validar stock y calcular Subtotal 
//Nota : Aun no restamos stock, solo calculamos numeros 
        let subtotal = 0;
        const finalItems = [];

        for(const itemRequest of items){
            const product = productsInDb.find(p => p._id.toString() === itemRequest.productId);

            //Validar stock
            if(product.stock < itemRequest.quantity){
                return res.status(400).json({ message: `Stock insuficientes para: ${product.name}`});
            }

            //Calcular precio de esta linea
            const lineTotal = product.price * itemRequest.quantity;
            subtotal += lineTotal;

            //Preparamos el item para guardarlo en la venta (Embeded Document)
            finalItems.push({
                productId: product._id,
                productName: product.name,
                priceAtSale: product.price,
                quantity: itemRequest.quantity,
            });
        }

// Paso 4: Calcular Descuento (Usando tu servicio)
        const discountPercentage = calculateDiscount(customer.purchasesCount);
        const discountAmount = (subtotal * discountPercentage) /100;
        const finaltotal = subtotal - discountAmount;
//Paso 5: Persistencia (Guardar todo)
//A.Guardar la venta
        const newSale = new Sale({
            customerId: customer._id,
            items: finalItems,
            subtotal: subtotal,
            discountPercent: discountPercentage,
            discountAmount: discountAmount,
            total: finaltotal,
            paymentMethod: paymentMethod
        });
        const savedSale = await newSale.save();
//B.Actualizar al Cliente (+1 compra)
        customer.purchasesCount += 1;
        await customer.save();
//C. Actualizar Sctock de Productos
//Ahora que la venta es segura, restamos el inventario
        for(const itemRequest of items){
            const product = productsInDb.find(p => p._id.toString() === itemRequest.productId);
            product.stock -= itemRequest.quantity;
            await product.save();
        }
//Paso 6: Respuesta al FrontEnd
        res.status(201).json({
            message: "Venta registrada con éxito",
            sale: savedSale

        });
            
        res.status(200).json({message: " Controlador conectado correctamente"});
    }catch(error){
        console.error("Error al crear venta:",error);
        res.status(500).json({
            message:"Error interno al procesar la venta",
            error: error.message
        });
    }
};