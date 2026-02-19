import Customer from '../models/Customer.js';

/* export const getAllCustomers = async (req, res) => {
    try{
        const customers = await Customer.find().sort({ purchasesCount: -1 });
        res.status(200).json(customers);
    }catch(error){
        res.status(500).json({ message: 'Error al obtener los clientes', error: error.message });
    }
}; */

export const getAllCustomers = async ( req, res) => {
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
        const filter = {};
        if(q && q.trim() !== ''){
            filter.$or = [
                { name: { $regex: q.trim(), $options: 'i' } },
                { email: { $regex: q.trim(), $options: 'i' } },
                { phone: { $regex: q.trim(), $options: 'i' } }
            ];
        }

        const skip = (pageNum - 1) * limitNum;
        const [customers, total] = await Promise.all([
            Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Customer.countDocuments(filter)
        ]);
        res.status(200).json({
            data: customers,
            total:total,
            page: pageNum,
            limit: limitNum,
        });
    } catch(error){
        res.status(500).json({ message: 'Error al obtener los clientes', error: error.message });
    }
};
export const getCustomerById = async (req, res) => {
    try{
        const { id } = req.params;
        const customer = await Customer.findById(id);
        if(!customer){
            return res.status(404).json({ message: 'Cliente no encontrado'});
        }
        res.status(200).json(customer);
    }catch(error){
        res.status(500).json({ message: 'Error al obtener el cliente', error: error.message });
    }
};

export const createCustomer = async (req, res) => {
    try{
        const {name,email,phone} = req.body;
        const customer = new Customer({ name, email, phone });
        await customer.save();
        res.status(201).json(customer);
    }catch(error){
        if (error.code === 11000){
            return res.status(400).json({message:'El correo ya està registrado'});
        }
        res.status(500).json({ message: 'Error al crear el cliente', error: error.message });
    }
};



export const updateCustomer = async (req,res) => {
    try{
        const {id} = req.params;

        const {name,email,phone} = req.body;
        const updateData = { name, email, phone };

        Object.keys(updateData).forEach(key => {
            if(updateData[key] === undefined) delete updateData[key];
        });

        const customer = await Customer.findByIdAndUpdate(id, updateData, { new: true });
        if(!customer){
            return res.status(404).json({message:'Cliente no encontrado'});
        }
        res.status(200).json(customer);
    }catch(error){
        res.status(500).json({ message: 'Error al actualizar el cliente', error: error.message });
    }
};
export const deleteCustomer = async (req, res) => {
    try{
        const { id } = req.params;
        const customer = await Customer.findByIdAndDelete(id);
        if(!customer){
            return res.status(404).json({ message: 'Cliente no encontrado'});
        }
        res.status(200).json({ message: 'Cliente eliminado con éxito' });
    }catch(error){
        res.status(500).json({ message: 'Error al eliminar el cliente', error: error.message });
    }
};