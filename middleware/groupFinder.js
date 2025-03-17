const Group = require('../models/group');

const GroupFinder = async(req, res, next) => {
    //console.log(req.user);
    const groupId = req.params.groupId;
    //console.log(groupId);
    try{
        const group = await Group.findOne({where: {group_id: groupId}});
        if(!group) {
            console.log("Group Not Found");
            return res.status(404).json({message: 'This group does not exist, please try a valid group'});
        }
        req.group = group;
        console.log("GroupFound");
        //console.log(group);
        next();
    } catch(error) {
        console.log(error);
        return res.status(403).json({message: 'Forbidden'});
    }
}

module.exports = GroupFinder;