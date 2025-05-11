const express = require('express');
const leaveController = require('../controllers/leaveController');

const router = express.Router();

router.get('/', leaveController.getAllLeaves);
router.get('/user', leaveController.getLeavesByUsername);
router.post('/', leaveController.createLeave);
router.patch('/:id', leaveController.updateLeave);
router.delete('/:id', leaveController.deleteLeave);
router.put('/withdraw/:id', leaveController.withdrawLeave);

module.exports = router;