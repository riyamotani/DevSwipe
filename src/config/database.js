const mongoose = require("mongoose")
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async() => {
    await mongoose.connect(process.env.MONGODB_URL)
    // const db = mongoose.connection;
    // return db;
};

module.exports = connectDB