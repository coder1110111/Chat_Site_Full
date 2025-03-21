const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chatControl');
const groupController = require('../controllers/groupControl');
const authenticate = require('../middleware/authentication');
const GroupFinder = require('../middleware/groupFinder');
const ConnectionTrue = require('../middleware/connectorCheck');

router.get('/', chatController.getMainPage);

router.get('/get-Group-Data', authenticate, groupController.getGroupData);
router.post('/create-Group', authenticate, groupController.createGroup);

router.get('/get-chat-Data/:groupId', authenticate, GroupFinder, ConnectionTrue, chatController.getChatData);   //Initial fetching of the messages

router.delete('/leave-Group/:groupId', authenticate, GroupFinder, ConnectionTrue, chatController.leaveGroup);
//router.use('/members')
module.exports=router;