const Order = require('../models/Order');
const { uploadToCloudinary } = require('../config/cloudinary');

exports.createOrder = async (req, res) => {
  try {
    const { 
      storeName, phoneNumber, businessType, province, city, address, whatsapp, telegram,
      favoriteColor, preferredFont, brandSlogan, categories, estimatedProducts, productDisplayType, specialFeatures,
      pricingPlan, additionalNotes
    } = req.body;
    
    let additionalModules = [];
    if (req.body.additionalModules) {
      try {
        additionalModules = JSON.parse(req.body.additionalModules);
      } catch (error) {
        console.log('Error parsing additionalModules:', error);
      }
    }
    
    let logoUrl = '';
    if (req.files?.logo) {
      logoUrl = await uploadToCloudinary(req.files.logo[0]);
    }

    const productImagesUrls = [];
    if (req.files?.productImages) {
      for (const image of req.files.productImages) {
        const url = await uploadToCloudinary(image);
        productImagesUrls.push(url);
      }
    }

    let total = 0;
    if (pricingPlan === 'basic') {
      total = 10000000;
    } else if (pricingPlan === 'standard') {
      total = 15000000;
    } else if (pricingPlan === 'advanced') {
      total = 20000000;
    } else if (pricingPlan === 'custom') {
      total = 30000000;
    }

    const items = [{
      name: `سفارش سایت ${pricingPlan || 'استاندارد'}`,
      quantity: 1,
      price: total
    }];

    const order = new Order({
      storeName,
      businessType,
      province,
      city,
      address,
      phoneNumber,
      whatsapp,
      telegram,
      logo: logoUrl,
      favoriteColor,
      preferredFont,
      brandSlogan,
      categories,
      estimatedProducts,
      productDisplayType,
      specialFeatures,
      productImages: productImagesUrls,
      pricingPlan,
      additionalModules,
      additionalNotes,
      customerName: storeName,
      items,
      total
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'سفارش با موفقیت ثبت شد',
      data: order,
    });
  } catch (error) {
    console.error('خطا در ثبت سفارش:', error);
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