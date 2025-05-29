const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: false,
    },
    partnerId: {
      type: String, // Изменяем на String вместо ObjectId
      required: false, // Оставляем опциональным
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    payment: {
      type: {
        sum: Number,
        usd: Number,
      },
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "credit"],
      required: true,
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sale", saleSchema);