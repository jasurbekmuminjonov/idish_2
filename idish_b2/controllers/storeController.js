const Store = require('../models/Store');
const Warehouse = require('../models/warehouseModel');
const bcrypt = require('bcryptjs')
exports.createStore = async (req, res) => {
    try {
        const { store_name, store_login, store_password, store_address, w_name, w_login, w_password, w_address } = req.body
        const hashedstore = await bcrypt.hash(store_password, 10)
        const hashedw = await bcrypt.hash(w_password, 10)
        const warehouse = await Warehouse.create({
            name: w_name,
            login: w_login,
            password: hashedw,
            address: w_address,
        })
        const store = await Store.create({
            warehouseId: warehouse._id,
            name: store_name,
            login: store_login,
            password: hashedstore,
            address: store_address,
        })
        return res.json({ message: "Do'kon va ombor yaratildi" })

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}

exports.getStores = async (req, res) => {
    try {
        const stores = await Store.find().populate('warehouseId')
        return res.json(stores)

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Serverda xatolik" });
    }
}