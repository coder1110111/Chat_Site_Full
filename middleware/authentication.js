const jwt = require('jsonwebtoken');
require("dotenv").config()
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    console.log('in Authentication');
    //console.log(req);
    const token = req.header('authorization');
    //console.log(token + '>>> is token');
    if(!token){
        return res.status(401).json({message: "Unauthorized: Please login again!"});
    }

    try {
        const id = jwt.verify(token, process.env.JWT_KEY).id;
        const user = await User.findOne({where: {id}});
        if(!user) {
            return res.status(404).json({message: "This user does not Exist. Please Sign Up!"});
        }
        req.user = user;
        console.log("Is Authenticated");
        next();
    } catch(error) {
        return res.status(403).json({message: 'Forbidden'});
    }
}

module.exports = authenticate;