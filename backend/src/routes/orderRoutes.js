const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

router.post('/', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'productImages', maxCount: 10 },
]), createOrder);

router.get('/', protect, getOrders);
router.patch('/:orderId/status', protect, updateOrderStatus);

module.exports = router; 