const mongoose = require('mongoose');

const TransportionSchema = new mongoose.Schema({
    products: {
        type: [
            {
                product_id: {
                    type: mongoose.Types.ObjectId,
                    ref: "Product"
                },
                quantity: {
                    type: Number,
                    required: true
                },
                transport_fee_per_quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    },
    from_warehouse: {
        type: mongoose.Types.ObjectId,
        ref: "Warehouse"
    },
    to_warehouse: {
        type: mongoose.Types.ObjectId,
        ref: "Warehouse"
    },
    status: {
        type: String,
        enum: ['in_process', 'delivered', 'cancelled'],
        default: 'in_process'
    }

});

module.exports = mongoose.model('Transportion', TransportionSchema);