const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number
});

const orderSchema = new mongoose.Schema({
  // Basic Information
  storeName: {
    type: String,
    required: true,
  },
  businessType: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  whatsapp: {
    type: String,
  },
  telegram: {
    type: String,
  },
  
  // Branding
  logo: {
    type: String,
  },
  favoriteColor: {
    type: String,
    required: true,
  },
  preferredFont: {
    type: String,
  },
  brandSlogan: {
    type: String,
  },
  categories: {
    type: String,
    required: true,
  },
  estimatedProducts: {
    type: String,
    required: true,
  },
  productDisplayType: {
    type: String,
    required: true,
  },
  specialFeatures: {
    type: String,
  },
  productImages: [{
    type: String,
  }],
  
  // Pricing Plan
  pricingPlan: {
    type: String,
    required: true,
    enum: ['basic', 'standard', 'advanced', 'custom']
  },
  additionalModules: [{
    type: String,
  }],
  additionalNotes: {
    type: String,
  },
  
  // اطلاعات تکمیلی برای نمایش در صفحه سفارش‌ها
  customerName: {
    type: String,
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema); 