const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'نام کاربری یا رمز عبور اشتباه است',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'نام کاربری یا رمز عبور اشتباه است',
      });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'ورود موفقیت‌آمیز بود',
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در ورود',
      error: error.message,
    });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'این نام کاربری قبلاً استفاده شده است',
      });
    }

    const admin = new Admin({
      username,
      password,
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'ادمین با موفقیت ایجاد شد',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در ایجاد ادمین',
      error: error.message,
    });
  }
}; 