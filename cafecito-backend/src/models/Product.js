import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true,
        maxlength: 100,
        minlength: 2,
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
    category: {
        type: String,
        required: true,
        enum: {
            values: ['Bebidas calientes','Frappucino','Bebidas frias','Bebidas Base Té','Cold Brew','Alimentos','Cafe en grano'],
            message: '{VALUE} no es una categoriá válida'
        }
    },
    images: [{
        type: String
    }],
    isActive:{
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

export default mongoose.model('Product', productSchema);