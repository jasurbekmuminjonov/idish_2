const Product = require("../models/Product");
const mongoose = require("mongoose");
const Partner = require("../models/Partner");

// Create a new product
// exports.createProduct = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const product = new Product(req.body);
//     const partner = new Partner(req.body);

//     await product.save({ session });
//     // Agar partner ham saqlash kerak bo'lsa, quyidagisini ochiq qoldiring:
//     await partner.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json(product);
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(400).json({ error: error.message });
//   }
// };
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      name_partner,
      partner_number,
      partner_address,
      currency,
      purchasePrice,
      warehouse,
      category,
      size,
      code,
      part,
      quantity = 0,
      box_quantity = 0,
      package_quantity = 0,
      total_kg = 0,
    } = req.body;

    // Mos product bor-yo'qligini tekshiramiz
    const existingProduct = await Product.findOne({
      name,
      name_partner,
      partner_number,
      partner_address,
      currency,
      "purchasePrice.value": purchasePrice?.value,
      warehouse,
      category,
      size,
      code,
      part,
    });

    if (existingProduct) {
      // Eski product yangilanadi
      existingProduct.quantity =
        (existingProduct.quantity || 0) + Number(quantity);
      existingProduct.box_quantity =
        (existingProduct.box_quantity || 0) + Number(box_quantity);
      existingProduct.package_quantity =
        (existingProduct.package_quantity || 0) + Number(package_quantity);
      existingProduct.total_kg =
        (existingProduct.total_kg || 0) + Number(total_kg);
      await existingProduct.save();

      // Mos partnerni ham topamiz
      const existingPartner = await Partner.findOne({
        productId: existingProduct._id,
      });

      if (existingPartner) {
        existingPartner.quantity =
          (existingPartner.quantity || 0) + Number(quantity);
        existingPartner.box_quantity =
          (existingPartner.box_quantity || 0) + Number(box_quantity);
        existingPartner.package_quantity =
          (existingPartner.package_quantity || 0) + Number(package_quantity);
        existingPartner.total_kg =
          (existingPartner.total_kg || 0) + Number(total_kg);
        await existingPartner.save();
      }

      return res
        .status(200)
        .json({ message: "Product updated", product: existingProduct });
    }

    // Yangi product va partner yaratiladi
    const newProduct = new Product(req.body);
    await newProduct.save();

    req.body.productId = newProduct._id;
    const newPartner = new Partner(req.body);
    await newPartner.save();

    res
      .status(201)
      .json({ message: "Product and Partner created", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { size: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
        ],
      };
    }

    const products = await Product.find(query).populate("warehouse");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("warehouse");
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get products by warehouse
exports.getProductsByWarehouse = async (req, res) => {
  try {
    const products = await Product.find({ warehouse: req.params.id }).populate(
      "warehouse"
    );
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    await Partner.findOneAndUpdate({ productId: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    await Partner.findOneAndDelete({ productId: req.params.id });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setDiscountForProducts = async (req, res) => {
  try {
    const { name, category, code, size, discount } = req.body;

    if (!name || !category || !code || !size || discount == null) {
      return res
        .status(400)
        .json({ message: "Barcha maydonlar to'ldirilishi kerak" });
    }

    const products = await Product.find({ name, category, code, size });

    if (products.length === 0) {
      return res.status(404).json({ message: "Mahsulotlar topilmadi" });
    }

    const updatePromises = products.map(async (product) => {
      product.discount = discount;

      if (
        product.sellingPrice &&
        typeof product.sellingPrice.value === "number"
      ) {
        product.sellingPrice.value -=
          (product.sellingPrice.value / 100) * discount;
      }

      return product.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      message: "Chegirma muvaffaqiyatli qo'llandi",
      updatedCount: products.length,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.setDiscountForProducts = async (req, res) => {
  try {
    const { name, category, code, size, discount } = req.body;

    if (!name || !category || !code || !size || discount == null) {
      return res
        .status(400)
        .json({ message: "Barcha maydonlar to'ldirilishi kerak" });
    }

    const products = await Product.find({ name, category, code, size });

    if (products.length === 0) {
      return res.status(404).json({ message: "Mahsulotlar topilmadi" });
    }

    const updatePromises = products.map(async (product) => {
      product.discount = discount;

      if (
        product.sellingPrice &&
        typeof product.sellingPrice.value === "number"
      ) {
        product.sellingPrice.value -=
          (product.sellingPrice.value / 100) * discount;
      }

      return product.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      message: "Chegirma muvaffaqiyatli qo'llandi",
      updatedCount: products.length,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.removeDiscountForProducts = async (req, res) => {
  try {
    const { name, category, code, size } = req.body;

    if (!name || !category || !code || !size) {
      return res
        .status(400)
        .json({ message: "Barcha maydonlar to'ldirilishi kerak" });
    }

    const products = await Product.find({ name, category, code, size });

    if (products.length === 0) {
      return res.status(404).json({ message: "Mahsulotlar topilmadi" });
    }

    const updatePromises = products.map(async (product) => {
      const discount = product.discount || 0;

      if (
        product.sellingPrice &&
        typeof product.sellingPrice.value === "number"
      ) {
        product.sellingPrice.value =
          product.sellingPrice.value / (1 - discount / 100);
      }

      product.discount = 0;

      return product.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      message: "Chegirma olib tashlandi",
      updatedCount: products.length,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
