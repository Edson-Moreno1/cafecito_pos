import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100,

    },
    phone:{
        type: String,
        sparse: true,
        unique: true,
        trim: true,
    },
    email:{
        type: String,
        sparse: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    purchasesCount:{
        type: Number,
        required: true,
        default: 0
    }
},{
    timestamps: true
});

customerSchema.pre('validate',function(next){
    if(!this.phone && !this.email){
        return next(new Error('Se requiere al menos un telèfono o email'));
    }
    next();
});

export default mongoose.model('Customer', customerSchema);