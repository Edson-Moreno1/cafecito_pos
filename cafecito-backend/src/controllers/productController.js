import Product from '../models/Product.js';

export const getAllProducts = async ( req, res) => {
    try{
        const {q, page=1,limit=20} = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // --- FIX: typo "tenero" → "entero" ---
        if(isNaN(pageNum)|| pageNum<1){
            return res.status(400).json({ message: 'page debe ser un entero mayor a 0'});
        }
        if(isNaN(limitNum) || limitNum<1 || limitNum>100){
            return res.status(400).json({ message: 'limit debe ser un numero entre 1 y 100'});
        }
        const filter = { isActive: true };
        if(q && q.trim() !== ''){
            filter.name = { $regex: q.trim(), $options: 'i' };
        }

        const skip = (pageNum - 1) * limitNum;
        const [products, total] = await Promise.all([
            Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Product.countDocuments(filter)
        ]);
        res.status(200).json({
            data: products,
            total:total,
            page: pageNum,
            limit: limitNum,
        });
    } catch(error){
        res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({ message: 'Producto no encontrado'});
        }
        res.status(200).json(product);
    }catch(error){
        res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
};

// --- FIX: whitelist de campos en vez de req.body directo ---
// Antes: new Product(req.body) permitía inyectar isActive, __v, etc.
export const createProduct = async (req, res) => {
    try{
        const { name, price, stock, description } = req.body;
        const product = new Product({ name, price, stock, description });
        await product.save();
        res.status(201).json(product);
    }catch(error){
        // Manejo de ValidationError de Mongoose → 422
        if(error.name === 'ValidationError'){
            const details = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(422).json({ 
                error: 'Error de validación', 
                details 
            });
        }
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try{
        const { name, price, stock, description } = req.body;
        const updateData = {};

        // Solo incluir campos enviados explícitamente
        if(name !== undefined) updateData.name = name;
        if(price !== undefined) updateData.price = price;
        if(stock !== undefined) updateData.stock = stock;
        if(description !== undefined) updateData.description = description;

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { 
            new: true,
            runValidators: true  // Ejecuta validaciones del schema en updates
        });
        if(!product){
            return res.status(404).json({ message: 'Producto no encontrado'});
        }
        res.status(200).json(product);
    }catch(error){
        if(error.name === 'ValidationError'){
            const details = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(422).json({ 
                error: 'Error de validación', 
                details 
            });
        }
        res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try{
        const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if(!product){
            return res.status(404).json({ message: 'Producto no encontrado'});
        }
        res.status(200).json({ message: 'Producto archivado con éxito' });
    }catch(error){
        res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
    }
};