const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chatControl');
const authenticate = require('../middleware/authentication');

router.get('/', chatController.getMainPage);
router.post('/chat-save', authenticate, chatController.postChat);

module.exports=router;