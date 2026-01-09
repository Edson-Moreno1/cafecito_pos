import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,

    },
    phone:{
        type: String,
        required: false,
    },
    email:{
        type: String,
        required: true,
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