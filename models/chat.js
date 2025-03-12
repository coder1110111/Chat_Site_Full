const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Chat = sequelize.define('chat', {
    chat_id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Chat;