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
        required: false,
        unique: true,
        lowercase: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    purchasesCount:{
        type: Number,
        required: true,
        default: 0
    }
},{
    timestamps: true
});

export default mongoose.model('Customer', customerSchema);