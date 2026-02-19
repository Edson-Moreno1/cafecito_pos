import Product from '../models/Product.js';


/* export const getAllProducts = async (req, res) => {
    try{
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(products);
    }catch(error){
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; */

export const getAllProducts = async ( req, res) => {
    try{

        const {q, page=1,limit=20} = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        if(isNaN(pageNum)|| pageNum<1){
            return res.status(400).json({ message: 'page debe ser un tenero mayor a 0'});
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