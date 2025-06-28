const ActPartner = require("../models/ActPartner");

// Create a new partner
exports.createActPartner = async (req, res) => {
  try {
    const partner = new ActPartner(req.body);
    await partner.save();
    res.status(201).json(partner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all partners
exports.getActPartner = async (req, res) => {
  try {
    const partners = await ActPartner.find();
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single partner by ID
exports.getActPartnerById = async (req, res) => {
  try {
    const partner = await ActPartner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    res.status(200).json(partner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get partners by warehouse (исправлено)
exports.getActPartnerByWarehouse = async (req, res) => {
  try {
    const partners = await ActPartner.find({
      warehouse: req.params.id,
    }).populate("warehouse");
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a partner by ID
exports.updateActPartnerById = async (req, res) => {
  try {
    const partner = await ActPartner.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    res.status(200).json(partner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a partner by ID
exports.deleteActPartnerById = async (req, res) => {
  try {
    const partner = await ActPartner.findByIdAndDelete(req.params.id);
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    res.status(200).json({ message: "Partner deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
