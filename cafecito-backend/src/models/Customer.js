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
        trim: true,
        default: null,
    },
    email:{
        type: String,
        lowercase: true,
        trim: true,
        default: null,
    },
    purchasesCount:{
        type: Number,
        required: true,
        default: 0
    }
},{
    timestamps: true
});


customerSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: 'string' } } });
customerSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
customerSchema.pre('validate',function(){
    if(!this.phone && !this.email){
        this.invalidate('phone', 'Se requiere al menos un número de teléfono o un correo electrónico');
        this.invalidate('email', 'Se requiere al menos un número de teléfono o un correo electrónico');
    }
    
});

export default mongoose.model('Customer', customerSchema);