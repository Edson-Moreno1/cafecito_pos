import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
    saleId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    productId:{
        type: String,
        required: true
    },
    productNameSnapshot:{
        type: String,
    },
    unitPriceSnapshot:{
        type: Number,
    },
    quantity:{
        type:  Number,
        required: true,
        min: 1
    },
    lineTotal:{
        type: Number,
        required: true,
        min: 0.01
    }
},{
    timestamps: true
});

export default mongoose.model('SaleItem', saleItemSchema);