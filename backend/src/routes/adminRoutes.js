const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.post('/', adminController.getAdmin);
router.put('/', adminController.updateAdminPassword);

module.exports = router;