const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/forgot', authController.handleForgot);
router.post('/login', authController.login);

module.exports = router;
