const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authentication');
const GroupFinder = require('../middleware/groupFinder');
const ConnectionTrue = require('../middleware/connectorCheck');
const memberController = require('../controllers/memberControl');

router.get('/groupMember/:groupId', authenticate, GroupFinder, ConnectionTrue, memberController.memberList);
router.post('/addGroupMember/:groupId', authenticate, GroupFinder, ConnectionTrue, memberController.addMember)

module.exports = router;