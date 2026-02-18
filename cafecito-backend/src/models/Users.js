import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    role:{
        type: String,
        enum: ['admin','vendedor'],
        default: 'vendedor'
    }
},{
    timestamps: true
});

// ✅ CORREGIDO: next es un parámetro de la función
userSchema.pre('save', async function (next) {
    
    // Si la contraseña no fue modificada, continuar sin hashear
    if (!this.isModified('password')) {
        console.log('⏭️ Password no modificado, saltando hash');
        return next();
    }

    try {
         
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log('✅ Password hasheado exitosamente');
        
    } catch (error) {
       
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

export default mongoose.model('User', userSchema);