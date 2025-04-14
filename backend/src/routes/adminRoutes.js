const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { login, createAdmin } = require('../controllers/adminController');

router.post('/login', login);
router.post('/create', protect, createAdmin);

module.exports = router; 