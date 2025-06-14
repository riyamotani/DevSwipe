const express = require("express");
const router = express.Router();
const { validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");

router.post("/signup", async (req, res) => {
  const user = req.body;
  if (user?.skills?.length > 10) {
    throw new Error("Skills cannot be more than 10");
  }
  try {
    validateSignupData(req);

    const { firstName, lastName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    const savedUser = await newUser.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.json({ message: "User Added successfully!", data: savedUser });
    res.send("User added successfully!");
  } catch (err) {
    res.status(400).send("Error saving the user!" + err.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new Error("Email is not valid");
    }

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send(user);
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.status(200).send("Logged out successfully");
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

router.patch("/reset-password", userAuth, async(req, res)=>{
    try {
        const {newPassword} = req.body
        if(!newPassword){throw new Error("Enter new password")}
        const isStrongPassword = validator.isStrongPassword(newPassword)
        if(!isStrongPassword) {
            throw new Error("Enter a strong password!")
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = req.user;
        user.password = hashedPassword
        await user.save()
        res.send("Password updated successfully!")
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router;
