const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth")
const profileRouter = require("./routes/profile")
const requestRouter = require("./routes/request")
const userRouter = require("./routes/user")

app.use("/", authRouter);
app.use("/", profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);

connectDB()
    .then(() => {
        console.log("Database connected!");
        app.listen(process.env.PORT, () => {
            console.log("Server is successfully listening on port 3000");
        });
    })
    .catch((err) => {
        console.log("Error connecting to database");
    });
