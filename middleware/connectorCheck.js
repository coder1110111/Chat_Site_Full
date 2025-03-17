const Connector = require('../models/connector');

const ConnectionTrue = async (req, res, next) => {
    
    //console.log(req.user.id);
    try{
        const connection = await Connector.findOne({
            where: {
                group_id: req.group.group_id,
                user_id: req.user.id
            }
        });
        if(!connection) {
            return res.status(404).json({message: 'Not allowed to post in this Group.'})
        }
        //console.log(connection);
        req.connection = connection;
        next();

    } catch(error) {
        console.log('DataBAse Error: >>' + error);
        return res.status(500).json({message: "Internal Server error!"});
    }
}

module.exports= ConnectionTrue;