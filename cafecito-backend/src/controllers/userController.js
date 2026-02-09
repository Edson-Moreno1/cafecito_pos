import User from '../models/Users.js';
import bcrypt from 'bcryptjs';

// GET /api/users — Lista todos los usuarios (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
};

// POST /api/users — Crear usuario (admin only)
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Verificar si ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        const user = new User({ name, email, password, role: role || 'cajero' });
        await user.save();

        // Devolver sin password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario', error: error.message });
    }
};

// PUT /api/users/:id — Actualizar usuario (admin only)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;

        const user = await User.findById(id).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (password && password.trim() !== '') {
            user.password = password; // pre-save hook will hash it
        }

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json(userResponse);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }
        res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
    }
};

// DELETE /api/users/:id — Eliminar usuario (admin only)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // No permitir que el admin se elimine a sí mismo
        if (req.user._id.toString() === id) {
            return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
    }
};