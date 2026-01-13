import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    // CAMBIO 1: Piden un ID legible para humanos (ej: "SALE-12345")
    saleId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    // CAMBIO 2: Enum simplificado (solo "card", no "credit_card")
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer"],
      default: "cash",
    },
    // CAMBIO 3: Nombres de variables "Snapshot"
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productNameSnapshot: String, // Antes: productName
        unitPriceSnapshot: Number,   // Antes: priceAtSale
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        lineTotal: Number, // Antes no lo guardábamos, ahora sí
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Sale", saleSchema);