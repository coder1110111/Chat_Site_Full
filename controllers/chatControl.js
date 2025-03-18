const path = require('path');
const { Op } = require('sequelize');
const Chat = require('../models/chat');
const Group = require('../models/group');

const sequelize = require('../util/database');


exports.getMainPage = (req, res) => {
    //console.log('Get Main chat page');
    res.sendFile(path.join(__dirname, '..', 'view', 'main.html'));
}

exports.postChat = async (req, res) => {
    const t = await sequelize.transaction();
    const {message} = req.body;
    console.log(message);
    
    try {
        await req.group.createChat({
            message_content : message,
            sent_by: req.user.name + " " + req.user.email
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
    //console.log(req.user.id);
    //console.log(req.group);
    const lastMsgId = req.header('lastChatId');
    //console.log(lastMsgId);
    try {
        //const userId = req.user.id;
        //console.log(lastMsgId);
        const chatData = await Chat.findAll(
            {
                where: {
                    chat_id: {[Op.gt]: lastMsgId},
                    group_id: req.group.group_id
                },
                order: [['chat_id', 'DESC']],
                limit: 50
            }
        );
        console.log(chatData);
        return res.status(200).json({success: true,chatData});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Internal Server error'});
    }
};

exports.leaveGroup = async(req, res) => {
    const t = await sequelize.transaction();
    console.log(req.connection);
    try {        
        await req.connection.destroy({transaction : t});
        await t.commit();
        res.status(200).json({message: "Left Group"});
    } catch (err) {
        console.log(err);
        res.status(500).json({success: false, message: 'Internal Server error'});
    }
}