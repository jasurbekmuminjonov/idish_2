const Transportion = require('../models/Transportion');
const Product = require('../models/Product');

exports.createTransportion = async (req, res) => {
    try {
        const { products, to_warehouse, from_warehouse } = req.body;

        if (!products?.length || !to_warehouse) {
            return res.status(400).json({ message: "Mahsulotlar va qabul qiluvchi ombor majburiy." });
        }

        const updatedProducts = [];

        for (const item of products) {
            const { product_id, quantity, unit } = item;

            const product = await Product.findById(product_id);
            if (!product) {
                return res.status(404).json({ message: `Mahsulot topilmadi: ${product_id}` });
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
            updatedProducts.push({
                product_id: product._id,
                quantity,
                transport_fee_per_quantity: item.transport_fee_per_quantity || 0
            });
        }

        const newTransportion = new Transportion({
            products: updatedProducts,
            from_warehouse: from_warehouse,
            to_warehouse,
        });

        await newTransportion.save();

        res.status(201).json({ message: "Jo'natma muvaffaqiyatli yaratildi", data: newTransportion });
    } catch (err) {
        console.error("Xatolik:", err.message);
        return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
    }
};


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