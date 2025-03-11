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

exports.postLogin = async (req, res) => {
    const {email, password} = req.body;
    console.log(email + " " + password);
    if(!email || !password) {
        return res.status(400).json({message: 'Validation Error!'});
    } else {
        try {
            const user = await User.findOne({where: {email}});
            if(!user) {
                return res.status(409).json({message: 'Email is not Registered. Please Register to access site.'});
            } else {
                const checkPass = await bcrypt.compare(password, user.password);
                if(checkPass) {
                    //later can generate jswtoken
                    const token = jwt.sign({id: user.id}, process.env.JWT_KEY);
                    return res.status(200).json({message:'Successfully Logged In!', token});
                }
                else if(!checkPass) {
                    return res.status(401).json({message: 'Password Incorrect!'});
                }
            }
        } catch {
            return res.status(500).json({error: 'Internal Server Error!'});
        }
    }
}