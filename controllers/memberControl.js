const Connector = require('../models/connector');
const User = require('../models/user');
const sequelize = require('../util/database');

exports.memberList = async (req, res) => {
    const GroupId = req.group.group_id;
    console.log(GroupId);
    try{
        const memberData = await Connector.findAll({
            where: {group_id: req.group.group_id},
            attributes: { exclude: ['createdAt', 'updatedAt', 'Connect_id', 'user_id', 'group_id',]},
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'mobile']
                }
            ]
        });
        const connectionType = req.connection.role_type;
        //console.log(memberData);
        return res.status(200).json({success: true, memberData, connectionType});
    } catch(error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Internal Server error'});
    }
}

exports.addMember = async(req, res) => {
    const role_type = req.connection.role_type;
    const {valuetype} = req.body;
    console.log(valuetype);
    console.log(role_type); 
    if(role_type !=='admin') {
        return res.status(403).json({message: 'Forbidden'});
    }
    let user;
    if(valuetype.type === 'mobile') {
        console.log('in mobile type');
        user = await User.findOne({
            where: {
                mobile: valuetype.info
            }
        });
        console.log(user);
    } else if(valuetype.type === 'email') {
        console.log('in email type')
        user = await User.findOne({

            where: {
                email: valuetype.info
            }
        });
        console.log(user);        
    }
    if(!user) {
        return res.status(404).json({message: 'No such user found'});
    }
    const t = await sequelize.transaction();
    const newConnector = await Connector.create({
        group_Name: req.group.group_name,
        role_type: 'member',
        user_id: user.id,
        group_id: req.group.group_id
    }, {transaction: t});
    await t.commit();

    console.log(user);
    return res.status(200).json({message: 'request coming through', newConnector});
}

exports.removeMember = async(req, res) => {
    
    const role_type = req.connection.role_type;
    if(role_type !=='admin') {
        return res.status(403).json({message: 'Forbidden'});
    }

    const userToRemove = req.header('userToRemove');
    console.log(userToRemove, " is the user being removed");

        const t = await sequelize.transaction();
        const existconnector = await Connector.findOne({
            where: {
                group_id: req.group.group_id,
                user_id: userToRemove
            }
        }, {transaction : t});
        if(!existconnector) {
            await t.rollback();
            return res.status(404).json({message: 'No such user found in this group'});
        }
        const repond = await existconnector.destroy({transaction : t});
            t.commit();
    
}