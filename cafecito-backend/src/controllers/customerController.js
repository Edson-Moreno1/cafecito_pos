import Customer from '../models/Customer.js';



export const getAllCustomers = async ( req, res) => {
    try{

        const {q, page=1,limit=20} = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        if(isNaN(pageNum)|| pageNum<1){
            return res.status(400).json({ message: 'page debe ser un entero mayor a 0'});
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


        if (error.code === 11000){
            const campo = Object.keys(error.keyPattern)[0]; // 'phone' o 'email'
            const labels = { phone: 'teléfono', email: 'correo' };
            return res.status(400).json({
                message: `El ${labels[campo] || campo} ya está registrado`
            });
        }

        res.status(500).json({ message: 'Error al crear el cliente', error: error.message });
    }
};




export const updateCustomer = async (req,res) => {
    try{
        const {id} = req.params;

        const {name,email,phone} = req.body;
        const updateData = { name, email, phone };

        if(name !== undefined) updateData.name = name;
        if(email !== undefined) updateData.email = email;
        if(phone !== undefined) updateData.phone = phone;

        const customer = await Customer.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if(!customer){
            return res.status(404).json({message:'Cliente no encontrado'});
        }
        res.status(200).json(customer);
    }catch(error){
        // Mismo manejo de errores que en create
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

        if(error.code === 11000){
            const campo = Object.keys(error.keyPattern)[0];
            const labels = { phone: 'teléfono', email: 'correo' };
            return res.status(400).json({
                message: `El ${labels[campo] || campo} ya está registrado`
            });
        }

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