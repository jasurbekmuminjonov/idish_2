const mongoose = require('mongoose'); // Добавляем импорт mongoose

const partnerSchema = new mongoose.Schema({
     partner_name: {
          type: String,
          required: true,
          trim: true
     },
     partner_number: {
          type: String,
          required: true,
          unique: true,
          trim: true
     },
     createdAt: {
          type: Date,
          default: Date.now
     }
});
module.exports = mongoose.model('ActPartner', partnerSchema);