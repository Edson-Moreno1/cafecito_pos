import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100,
    },
    price: {
        type: Number,
        required: true,
        min: 0.01
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    description: {
        type: String,
        required: false
    },
    isActive:{
        type: Boolean,
        default: true
    }
},{
    timestamps: true
});

export default mongoose.model('Product', productSchema);