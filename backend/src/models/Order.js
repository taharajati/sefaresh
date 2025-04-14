const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  favoriteColor: {
    type: String,
    required: true,
  },
  instagram: {
    type: String,
  },
  logo: {
    type: String,
  },
  productImages: [{
    type: String,
  }],
  additionalNotes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema); 