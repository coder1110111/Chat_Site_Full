const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');


exports.getPage = (req, res, next) => {
    console.log("Get Signup Page");
    res.sendFile(path.join(__dirname, '..', 'view', 'signUp.html'));
};

exports.postPage = async (req, res, next) => {
    console.log("Arrived Here!");
    const {username, email, number, password} = req.body;
    console.log(username + email + number + password);
    if(!username || !email || !number || !password) {
        console.log("Validation Error!");
        return res.status(400).json({error: "All fields must be provided."});
    }

    try {
        const existUser1 = await User.findOne({where: {email}});
        if(existUser1){
            return res.status(409).json({message:'Email already in Use!'});
        }
        /* const existUser2 = await User.findOne({where: {number}});
        if(existUser2){
            return res.status(409).json({message:'Mobile Number already in Use!'});
        } */
        bcrypt.hash(password, 10, async (error, hash) => {
            //Stopped Here
            console.log(error);
            await User.create({
                name: username,
                email: email,
                mobile: number,
                password: hash
            });
            res.status(201).json({message: 'User Created'});
        })
    } catch(err) {
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error!'});
    }
}

exports.getLogin = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'view', 'login.html'));
}