const Partner = require("../models/Partner");

// Create a new product
exports.createProductPartner = async (req, res) => {
     try {
          console.log("Request body in createProductPartner:", req.body);
          const product = new Partner(req.body);
          await product.save();
          console.log("Saved product:", product);
          res.status(201).json(product);
     } catch (error) {
          console.error("Error in createProductPartner:", error);
          res.status(400).json({ error: error.message });
     }
};

// Update a product by ID
exports.updateProductPartner = async (req, res) => {
     try {
          console.log("Request body in updateProductPartner:", req.body);
          const product = await Partner.findByIdAndUpdate(req.params.id, req.body, {
               new: true,
               runValidators: true,
          });
          if (!product) {
               return res.status(404).json({ error: "Product not found" });
          }
          console.log("Updated product:", product);
          res.status(200).json(product);
     } catch (error) {
          console.error("Error in updateProductPartner:", error);
          res.status(400).json({ error: error.message });
     }
};

// Get all products
exports.getProductsPartner = async (req, res) => {
     try {
          const products = await Partner.find().populate("warehouse");
          res.status(200).json(products);
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
};

// Get a single product by ID
exports.getProductByIdPartner = async (req, res) => {
     try {
          const product = await Partner.findById(req.params.id).populate("warehouse");
          if (!product) {
               return res.status(404).json({ error: "Product not found" });
          }
          res.status(200).json(product);
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
};

// Get products by warehouse
exports.getProductsByWarehousePartner = async (req, res) => {
     try {
          const products = await Partner.find({ warehouse: req.params.id }).populate("warehouse");
          res.status(200).json(products);
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
};

// Delete a product by ID
exports.deleteProductPartner = async (req, res) => {
     try {
          const product = await Partner.findByIdAndDelete(req.params.id);
          if (!product) {
               return res.status(404).json({ error: "Product not found" });
          }
          res.status(200).json({ message: "Product deleted successfully" });
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
};