const jwt = require("jsonwebtoken");
const User = require("../models/user");
const dotenv = require('dotenv');
dotenv.config();

const userAuth = async(req, res, next) =>{
    try {
        const {token} = req.cookies
    if(!token){
        return res.status(401).send("Please login!")
    }

    const decodedMessage = jwt.verify(token, process.env.JWT_SECRET);
    const {_id} = decodedMessage

    const user = await User.findById(_id);
    if(!user){
        throw new Error("Login again!")
    }
    req.user = user
    next()
    } catch (err) {
        res.status(400).send(err.message)
    }
}

module.exports = {userAuth}