const Transportion = require('../models/Transportion');
const Product = require('../models/Product');

exports.createTransportion = async (req, res) => {
    try {
        const { id } = req.user
        const { products, to_warehouse } = req.body


    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.getSentTransportions = async (req, res) => {
    try {
        const { id, role } = req.user
        let transportions;
        if (role === 'warehouse' || role === 'store') {
            transportions = await Transportion.find({ from_warehouse: new mongoose.Types.ObjectId(id) }).populate("from_warehouse")
                .populate("to_warehouse")
                .populate("products.product_id");;
        } else {
            transportions = await Transportion.find().populate("from_warehouse")
                .populate("to_warehouse")
                .populate("products.product_id");;
        }
        res.status(200).json(transportions);

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.getGotTransportions = async (req, res) => {
    try {
        const { id, role } = req.user
        let transportions;
        if (role === 'warehouse' || role === 'store') {
            transportions = await Transportion.find({ to_warehouse: new mongoose.Types.ObjectId(id) }).populate("from_warehouse")
                .populate("to_warehouse")
                .populate("products.product_id");;
        } else {
            transportions = await Transportion.find().populate("from_warehouse")
                .populate("to_warehouse")
                .populate("products.product_id");;
        }
        res.status(200).json(transportions);

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}