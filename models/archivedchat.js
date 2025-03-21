const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ArchivedChat = sequelize.define('ArchivedChat', {
    archived_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    group_id: {
        type: Sequelize.UUID,
        allowNull: false
    },
    sent_by: {
        type: Sequelize.STRING,
        allowNull: false
    },
    message_content: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    file_path: {
        type: Sequelize.STRING,
        allowNull: true
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = ArchivedChat;