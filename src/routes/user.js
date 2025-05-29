const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const router = express.Router();
const ConnectionRequest = require("../models/connectionRequest");

router.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", "firstName lastName photoUrl age gender about skills");
        res.json({
            message: "Connection requests fetched successfully",
            data: connectionRequests
        })
    } catch (error) {
        res.status(500).json({ message: "Error: " + error.message })
    }
})

router.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connections = await ConnectionRequest.find({
            $or: [{ toUserId: loggedInUser._id, status: "accepted" }, { fromUserId: loggedInUser._id, status: "accepted" }]
        }).populate("fromUserId", "firstName lastName photoUrl age gender about skills")
            .populate("toUserId", "firstName lastName photoUrl age gender about skills");

        const data = connections.map((connection) => {
            if (connection.fromUserId._id.equals(loggedInUser._id)) {
                return connection.toUserId;
            } else {
                return connection.fromUserId;
            }
        });
        res.json({
            message: "Connections fetched successfully",
            data: data
        })
    } catch (error) {
        res.status(500).json({ message: "Error: " + error.message })
    }
})

router.get("/user/feed", userAuth, async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        const loggedInUser = req.user;
        const connectRequests = await ConnectionRequest.find({ $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }] })
        const hideConnections = new Set();

        connectRequests.forEach((request) => {
            hideConnections.add(request.fromUserId.toString());
            hideConnections.add(request.toUserId.toString());
        })

        const connections = await User.find({
            $and: [{ _id: { $nin: Array.from(hideConnections) } }, { _id: { $ne: loggedInUser._id } }]
        }).select("firstName lastName photoUrl age gender about skills").skip(skip).limit(limit);

        res.json({
            message: "Feed fetched successfully",
            data: connections
        })

    } catch (error) {
        res.status(500).json({ message: "Error: " + error.message })
    }
})

module.exports = router;