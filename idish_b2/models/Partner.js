const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    name_partner: {
      type: String,
      required: true,
    },
    partner_number: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      enum: ["USD", "SUM", ""],
    },
    purchasePrice: {
      value: {
        type: Number,
      },
    },
    image_url: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      default: null,
    },
    quantity_per_package: {
      type: Number,
      default: 1,
    },
    total_kg: {
      type: Number,
      default: null,
    },
    kg_per_box: {
      type: Number,
      default: null,
    },
    kg_per_package: {
      type: Number,
      default: null,
    },
    kg_per_quantity: {
      type: Number,
      default: null,
    },
    package_quantity_per_box: {
      type: Number,
      default: 1,
    },
    isPackage: {
      type: Boolean,
      default: true,
    },
    kg_quantity: {
      type: Number,
      default: null,
    },
    box_quantity: {
      type: Number,
      default: null,
    },
    package_quantity: {
      type: Number,
      default: 1,
    },
    sellingPrice: {
      value: {
        type: Number,
      },
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    barcode: {
      type: String,
      unique: true,
      required: true,
    },
    part: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Partner = mongoose.model("Partner", partnerSchema);

module.exports = Partner;