const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
    partnerId: {
      type: String,
      default: null,
    },
    products: {
      type: [
        {
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
          quantity: {
            type: Number,
            required: true,
          },
          promokodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Promo",
            required: false,
            default: null,
          },
          totalAmount: {
            type: Number,
            required: true,
          },
          sellingPrice: {
            type: Number,
            required: true,
          },
          unit: {
            type: String,
            required: true,
          },
          currency: {
            type: String,
            required: true,
            enum: ["USD", "SUM", "KYG"],
          },
        },
      ],
      default: true,
    },
    remainingAmount: {
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
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
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
            enum: ["USD", "SUM", "KGS"],
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
    promokodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promo",
      required: false,
      default: null,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Debt", debtSchema);
