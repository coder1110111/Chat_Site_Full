const cron = require('node-cron');
const { Op } = require('sequelize');
const Chat = require('./models/chat');
const ArchivedChat = require('./models/archivedchat');
const sequelize = require('./util/database');

cron.schedule('0 0 * * *', async() => {
    console.log('Running to Archive');

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    try{
        const oldMessages = await Chat.findAll({
            where: {
                createdAt: {
                    [Op.lt]: oneDayAgo
                }
            }
        });

        if(oldMessages.length === 0) {
            console.log('Nothing Archivable');
        }
        const t = await sequelize.transaction();
        const archivedMessages = oldMessages.map(msg => ({
            group_id: msg.group_id,
            sent_by: msg.sent_by,
            message_content: msg.message_content,
            file_path: msg.file_path,
            createdAt: msg.createdAt
        }));

        await ArchivedChat.bulkCreate(archivedMessages, {transaction: t})

        const messageIds = oldMessages.map(msg => msg.chat_id);
        await Chat.destroy({
            where: {
                chat_id: messageIds
            }
        }, {transaction: t});
        await t.commit();
        console.log(` Message archived successfully numbering ${archivedMessages.length}`);

    }catch(error) {
        console.error('Error during chat archiving: ', error);
    }
})