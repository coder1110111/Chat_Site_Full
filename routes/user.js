const express = require('express');
const router = express.Router();

const userController = require('../controllers/userControl');

router.get('/create-user', userController.getPage);
router.post('/create-user', userController.postPage);
router.get('/login', userController.getLogin);
//router.post('/login', userController.postLogin);

module.exports = router;