const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        lowercase:true,
        required: true,
        unique: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email" + value)
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter a strong password")
            }
        }
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
    },
    photoUrl: {
        type: String,
        default: "https://www.kindpng.com/picc/m/252-2524695_dummy-profile-image-jpg-hd-png-download.png",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid Photo Url" + value)
            }
        }
    },
    about: {
        type: String
    },
    skills:{
        type: [String]
    }
},{
    timestamps: true
});

userSchema.methods.getJWT = async function(){
    const user = this;
    
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET,{
        expiresIn:"7d"
    });

    return token;
}

userSchema.methods.validatePassword = async function(passwordInputByUser){
    const user = this;

    const isPasswordValid = await bcrypt.compare(passwordInputByUser, user.password);

    return isPasswordValid;
}

const User = mongoose.model("User", userSchema);

module.exports = User;