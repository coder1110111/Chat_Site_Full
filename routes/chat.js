const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chatControl');
const authentication = require('../middleware/authenticate');

router.get('/', chatController.getMainPage);

module.exports=router;