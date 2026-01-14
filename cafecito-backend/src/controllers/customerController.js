import Customer from '../models/Customer.js';

export const getAllCustomers = async (req, res) => {
    try{
        const customers = await Customer.find().sort({ purchasesCount: -1 });
        res.status(200).json(customers);
    }catch(error){
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

export const updateCustomer = async (req, res) => {
    try{
        const { id } = req.params;
        const customer = await Customer.findByIdAndUpdate(id, req.body, { new: true });
        if(!customer){
            return res.status(404).json({ message: 'Cliente no encontrado'});
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