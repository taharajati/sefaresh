const Order = require('../models/Order');
const { uploadToCloudinary } = require('../config/cloudinary');

exports.createOrder = async (req, res) => {
  try {
    const { storeName, phoneNumber, category, description, favoriteColor, instagram, additionalNotes } = req.body;
    
    // Upload logo
    let logoUrl = '';
    if (req.files?.logo) {
      logoUrl = await uploadToCloudinary(req.files.logo[0]);
    }

    // Upload product images
    const productImagesUrls = [];
    if (req.files?.productImages) {
      for (const image of req.files.productImages) {
        const url = await uploadToCloudinary(image);
        productImagesUrls.push(url);
      }
    }

    const order = new Order({
      storeName,
      phoneNumber,
      category,
      description,
      favoriteColor,
      instagram,
      logo: logoUrl,
      productImages: productImagesUrls,
      additionalNotes,
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'سفارش با موفقیت ثبت شد',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در ثبت سفارش',
      error: error.message,
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت سفارش‌ها',
      error: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'سفارش یافت نشد',
      });
    }

    res.status(200).json({
      success: true,
      message: 'وضعیت سفارش با موفقیت به‌روزرسانی شد',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی وضعیت سفارش',
      error: error.message,
    });
  }
}; 