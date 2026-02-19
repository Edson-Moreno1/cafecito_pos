import Product from '../models/Product.js';


export const getAllProducts = async (req, res) => {
    try{
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(products);
    }catch(error){
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({ message: 'Product not found'});
        }
        res.json(product);
    }catch(error){
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try{
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    }catch(error){
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/* export const updateProduct = async (req, res) => {
    try{
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!product){
            return res.status(404).json({ message: 'Product not found'});
        }
        res.json(product);
    }catch(error){
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; */

export const updateProduct = async (req, res) => {
    try{
        const {name,price,stock,description} = req.body;
        const updateData = { name, price, stock, description };
        Object.keys(updateData).forEach(key => {
            if(updateData[key] === undefined) delete updateData[key];
        });
        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if(!product){
            return res.status(404).json({ message: 'Producto no encontrado'});
        }
        res.json(product);
    }catch(error){
        res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try{
        const product = await Product.findByIdAndUpdate(req.params.id,{isActive:false},{new:true});
        if(!product){
            return res.status(404).json({message: 'Product not found'});
        }
        res.json({ message: 'Product archived successfully'});
    }catch(error){
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};