const express = require('express');
const router = express.Router();

const userController = require('../controllers/userControl');

router.get('/create-user', userController.getPage);
router.post('/create-user', userController.postPage);

module.exports = router;