const mongoose = require('mongoose');

const PromoSchema = new mongoose.Schema({
    code: String,
    percent: Number,
    type: {
        type: String,
        enum: ['percent', 'amount']
    }
}, { timestamps: true });

module.exports = mongoose.model('Promo', PromoSchema);