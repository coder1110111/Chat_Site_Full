const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Connector = sequelize.define('connector', {
    connect_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        allowNull: false,
        primaryKey: true
    },
    group_Name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    role_type: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Connector;