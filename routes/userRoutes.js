const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.index);
router.get('/:username', userController.show);
router.post('/', userController.store);
router.patch('/:username/status', userController.setStatus);

module.exports = router;
