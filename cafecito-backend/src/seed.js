import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Customer from './models/Customer.js';
import Sale from './models/Sale.js';

dotenv.config();

const catalog = [
    { category: 'Bebidas calientes', items: ['Espresso Americano', 'Capuccino Vainilla', 'Latte Macchiato', 'Mocha Blanco', 'Flat White'] },
    { category: 'Frappucino', items: ['Cookies & Cream Frap', 'Mocha Frap', 'Caramel Frap', 'Matcha Frap', 'Java Chip Frap'] },
    { category: 'Bebidas frias', items: ['Iced Americano', 'Iced Caramel Latte', 'Limonada de Pitaya', 'Refreshers Mango Star', 'Shaken Espresso'] },
    { category: 'Bebidas Base Té', items: ['Chai Tea Latte', 'Té Verde Matcha', 'Té Negro Clásico', 'Infusión de Frutos Rojos', 'London Fog'] },
    { category: 'Cold Brew', items: ['Cold Brew Clásico', 'Nitro Cold Brew', 'Cold Brew con Crema de Salada', 'Vanilla Sweet Cream Cold Brew'] },
    { category: 'Alimentos', items: ['Croissant de Jamón y Queso', 'Muffin de Arándanos', 'Bagel con Cream Cheese', 'Cheesecake de Frambuesa', 'Panini de Pavo'] },
    { category: 'Cafe en grano', items: ['Grano Colombia (250g)', 'Grano Etíope Tostado Medio', 'Mezcla de la Casa (1kg)', 'Descafeinado Premium'] }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("☕ Conectado para el seeding final...");

        // Limpiar para empezar de cero
        await Product.deleteMany({});
        await Customer.deleteMany({});
        await Sale.deleteMany({});

        // 1. Crear Productos
        const productsToInsert = [];
        catalog.forEach(cat => {
            cat.items.forEach(item => {
                productsToInsert.push({
                    name: item,
                    price: Math.floor(Math.random() * (150 - 45) + 45),
                    category: cat.category,
                    stock: 50,
                    isActive: true
                });
            });
        });
        const createdProducts = await Product.insertMany(productsToInsert);

        // 2. Crear Clientes
        const names = ['Ana García', 'Luis Rodriguez', 'Carla Soto', 'Roberto Gómez', 'Elena Peña'];
        const customers = [];
        for (let i = 0; i < 15; i++) {
            customers.push({
                name: `${names[i % names.length]} ${i}`,
                email: `cliente${i}@test.com`,
                phone: `555-${1000 + i}`,
                purchasesCount: Math.floor(Math.random() * 10)
            });
        }
        const createdCustomers = await Customer.insertMany(customers);

        // 3. Crear Ventas (Ajustado a tu Schema estricto)
        const sales = [];
        for (let i = 0; i < 50; i++) {
            const randomCustomer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
            const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
            const qty = Math.floor(Math.random() * 2) + 1;
            const subtotal = randomProduct.price * qty;

            sales.push({
                saleId: `SALE-${Date.now()}-${i}`, // Generamos un ID manual para el seed
                customerId: randomCustomer._id,
                paymentMethod: i % 2 === 0 ? 'cash' : 'card', // Valores correctos del enum
                items: [{
                    productId: randomProduct._id, // Nombre correcto del campo
                    productNameSnapshot: randomProduct.name,
                    unitPriceSnapshot: randomProduct.price,
                    quantity: qty,
                    lineTotal: subtotal
                }],
                subtotal: subtotal,
                discountPercent: 0,
                discountAmount: 0,
                total: subtotal,
                createdAt: new Date(Date.now() - (i * 3600000)) // Ventas en diferentes horas
            });
        }
        await Sale.insertMany(sales);

        console.log("✅ SEED COMPLETO: Productos, Clientes y Ventas creados sin errores.");
        process.exit();
    } catch (error) {
        console.error("❌ Error detectado:");
        console.log(error);
        process.exit(1);
    }
};

seedDB();