const path = require('path');
const sequelize = require('../util/database');

exports.getMainPage = (req, res) => {
    console.log('Get Main chat page');
    res.sendFile(path.join(__dirname, '..', 'view', 'main.html'));
}

exports.postChat = async (req, res) => {
    const t = await sequelize.transaction();
    const {chatData} = req.body;
    
    try {
        await req.user.createChat({
            message: chatData
        }, {transaction: t});
        await t.commit();
        return res.status(201).json({message: 'message Sent'});
    } catch(error) {
        await t.rollback();
        console.log(error);
        return res.status(500).json({message: 'Internal Server Error!'});
    }
}