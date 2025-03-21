const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Chat = sequelize.define('chat', {
    chat_id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message_content: {
        type: Sequelize.STRING,
        allowNull: true
    },
    file_path: {
        type: Sequelize.STRING,
        allowNull: true
    },
    sent_by: {
        type: Sequelize.UUID,
        allowNull: false,
    }
});

module.exports = Chat;