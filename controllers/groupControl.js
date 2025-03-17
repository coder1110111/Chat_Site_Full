const Group = require('../models/group');
const Connector = require('../models/connector');

const sequelize = require('../util/database');

exports.createGroup = async (req, res) => {
    const t = await sequelize.transaction();
    const {groupName, role_type} = req.body;
    console.log(groupName+" "+role_type);
    if(!groupName) {
        return res.status(400).json({error: "All fields must be valid."})
    }
    try {
        const grpData = await Group.create({
            group_name: groupName,
            admin_id: req.user.id,
        }, {transaction: t});
        //console.log(grpData.dataValues);
        //console.log(grpData.dataValues.group_id);
        
        await Connector.create({
            group_Name: groupName,
            role_type: role_type,
            user_id: req.user.id,
            group_id: grpData.dataValues.group_id
        }, {transaction: t});

        await t.commit();
        res.status(201).json({message: 'Group Created'});

    } catch (error) {
        await t.rollback();
        console.log("Error: ", error);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

exports.getGroupData = async(req, res) => {
    try{
        const response = await Connector.findAll(
            {where: {user_id:req.user.id}}
        );
        //console.log(response);
        res.status(200).json({message:'Found Data', response});
    } catch(error) {

    }
}