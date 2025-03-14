const path = require('path');
const Chat = require('../models/chat');
const sequelize = require('../util/database');

exports.getMainPage = (req, res) => {
    //console.log('Get Main chat page');
    res.sendFile(path.join(__dirname, '..', 'view', 'main.html'));
}

exports.postChat = async (req, res) => {
    const t = await sequelize.transaction();
    const {chat} = req.body;
    
    try {
        await req.user.createChat({
            message: chat
        }, {transaction: t});
        await t.commit();
        return res.status(201).json({message: 'message Sent'});
    } catch(error) {
        await t.rollback();
        console.log(error);
        return res.status(500).json({message: 'Internal Server Error!'});
    }
}

exports.getChatData = async (req, res) => {
    //console.log('in to get Data');
    try {
        const userId = req.user.id;
        const chatData = await Chat.findAll({where: {userId}});
        return res.status(200).json({success: true,chatData});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Internal Server error'});
    }
};