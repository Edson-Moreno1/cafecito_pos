import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({

    customerId:{
        type: Number,
        required: false
    },
    paymentMethod:{
        type: String,
        required: true,
        enum: ['efectivo', 'tarjeta_credito', 'tarjeta_debito','transferencia'],
        default: 'efectivo'
    },
    subtotal:{
        type: Number,
        required: true,
    },
    discountPercent:{
        type: Number,
        required: false,
        default: 0
    },
    discountAmount:{
        type: Number,
        required: false,
        default: 0
    },
    total:{
        type: Number,
        required: true,
    }

},{
    timestamps: true
});

export default mongoose.model('sale', saleSchema);