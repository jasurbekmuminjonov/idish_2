const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
      // required: true,
    },
    partnerId: {
      type: String,
      default: null,
      // required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "credit"],
      default: "credit",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "SUM", "KYG"],
    },
    paymentHistory: {
      type: [
        {
          amount: Number,
          date: {
            type: Date,
            default: Date.now(),
          },
          currency: {
            type: String,
            required: true,
            enum: ["USD", "SUM", "KYG"],
          },
          storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
          },
          type: {
            type: String,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Debt", debtSchema);
