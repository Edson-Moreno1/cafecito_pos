import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({

    customerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        default: null
    },
    paymentMethod:{
        type: String,
        required: true,
        enum:["cash","credit_card","debit_card","transfer"],
        default: "cash"       
    },
    subtotal:{
        type: Number,
        required: true,
        min: 0
    },
    discountPercent:{
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    discountAmount:{
        type: Number,
        default: 0,
        min: 0
    },
    total:{
        type: Number,
        required: true,
    }

},{
    timestamps: true
});

export default mongoose.model('sale', saleSchema);