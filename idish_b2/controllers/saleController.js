const Sale = require("../models/Sale");
const Product = require("../models/Product");

const sellProduct = async (req, res) => {
  const {
    clientId,
    partnerId,
    productId,
    quantity,
    warehouseId,
    currency,
    sellingPrice,
    discount,
    paymentMethod,
    unit,
  } = req.body;

  if ((!clientId && !partnerId) || !productId || !quantity || !warehouseId || !paymentMethod) {
    return res.status(400).json({ message: "Either clientId or partnerId and all other required fields must be provided." });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    product.box_quantity -= (quantity / product.package_quantity_per_box / product.quantity_per_package).toFixed(2);
    if (product.isPackage) {
      product.package_quantity -= quantity / product.quantity_per_package;
    }
    product.quantity -= quantity;
    product.total_kg -= parseFloat(
      (
        (unit === "box_quantity"
          ? quantity / product.package_quantity_per_box / (product.isPackage ? product.quantity_per_package : 1)
          : unit === "package_quantity"
            ? (product.isPackage ? quantity / product.quantity_per_package : 0)
            : unit === "quantity"
              ? quantity
              : 0) *
        (unit === "quantity"
          ? product.kg_per_quantity
          : unit === "package_quantity"
            ? (product.isPackage ? product.kg_per_package : 0)
            : product.kg_per_box)
      ).toFixed(2)
    );

    await product.save();

    const newSale = new Sale({
      ...(clientId && { clientId }),
      ...(partnerId && { partnerId }),
      productId,
      quantity,
      sellingPrice,
      payment: currency === "USD" ? { usd: sellingPrice * quantity, sum: 0 } : { usd: 0, sum: sellingPrice * quantity },
      warehouseId,
      unit,
      paymentMethod,
      discount,
    });

    await newSale.save();
    res.status(201).json(newSale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSalesHistory = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("clientId", "name")
      .populate("productId", "name purchasePrice.value sellingPrice.value code size currency")
      .populate("warehouseId", "name")
      .sort({ createdAt: -1 });
    // Поле partnerId теперь строка, популяция не требуется
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClientHistory = async (req, res) => {
  const { clientId } = req.params;

  try {
    const sales = await Sale.find({ clientId })
      .populate("productId", "name purchasePrice.value sellingPrice.value")
      .populate("warehouseId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPartnerHistory = async (req, res) => {
  const { partnerId } = req.params;

  try {
    const sales = await Sale.find({ partnerId })
      .populate("productId", "name purchasePrice.value sellingPrice.value")
      .populate("warehouseId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sellProduct,
  getSalesHistory,
  getClientHistory,
  getPartnerHistory,
};