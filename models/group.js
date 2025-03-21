const sequelize = require('../util/database');
const Sequelize = require('sequelize');

const Group = sequelize.define('group', {
    group_id: {
        type: Sequelize.UUID,
        allowNull:false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    group_name: {
        type: Sequelize.STRING,
        allowNull:false
    }
});

module.exports = Group;