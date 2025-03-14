const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }, 
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    }, 
    mobile: {
        type: Sequelize.STRING(15),
        allowNull: false,
        validate: {
            isNumeric: true,
            len: [5, 15]
        }
    }, 
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = User;