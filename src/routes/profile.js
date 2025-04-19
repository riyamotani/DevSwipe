const express = require("express");
const router = express.Router();
const User = require("../models/user");
const {userAuth} = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");

router.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user
        res.send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if(!validateEditProfileData(req)){
            throw new Error("Invalid edit request!")
        }

        const loggedInUser = req.user

        Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName}, your profile is updated successfully!`,
            data: loggedInUser
        })

    } catch (error) {
        res.status(400).send("Error: " + error.message)
    }
})

router.get("/user", async (req, res) => {
    const userEmail = req.body.emailId;
    try {
        const user = await User.findOne({ emailId: userEmail });
        if (!user) {
            res.status(404).send("User not found!");
        } else {
            res.send(user);
        }
    } catch (error) {
        res.status(400).send("Something went wrong!");
    }
});

router.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (error) {
        res.status(400).send("Something went wrong!");
    }
});

router.delete("/user", async (req, res) => {
    const userId = req.body.userId;
    try {
        await User.findByIdAndDelete(userId);
        res.send("User deleted successfully");
    } catch (error) {
        res.status(400).send("Something went wrong!");
    }
});

router.patch("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    const data = req.body;

    try {
        const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];

        const isAllowedUpdate = Object.keys(data).every((k) => {
            ALLOWED_UPDATES.includes(k);
        });

        if (!isAllowedUpdate) {
            throw new Error("Update not allowed");
        }

        if (data?.skills?.length > 10) {
            throw new Error("Skills cannot be more than 10");
        }

        await User.findByIdAndUpdate({ _id: userId }, data);
        res.send("User updated successfully");
    } catch (error) {
        res.status(400).send("Update failed" + error.message);
    }
});

module.exports = router;