const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const router = express.Router();

router.post("/request/send/:status/:toUserId", userAuth,
    async (req, res) => {
        try {
            const fromUserId = req.user._id;
            const toUserId = req.params.toUserId;
            const status = req.params.status;

            const allowedStatus = ["ignored", "interested"]
            if(!allowedStatus.includes(status)){
                return res.status(400).json({message: "Invalid status type: " + status});
            }

            const userExists = await User.findById(toUserId)
            if(!userExists){
                return res.status(404).json({message: "User not found!"});
            }

            const existingConnectionRequest = await ConnectionRequest.findOne({
                $or:[
                    {fromUserId, toUserId},
                    {fromUserId: toUserId, toUserId:fromUserId}
                ]
            })

            if(existingConnectionRequest){
                return res.status(400).json({message: "Connection request already exists"});
            }

            const connectionRequest = new ConnectionRequest({
                fromUserId,
                toUserId,
                status
            })

            const data = await connectionRequest.save();

            res.json({
                message: status === 'ignored' ? req.user.firstName + ' ignored you' : req.user.firstName + ' is interested in you',
                data
            });

        } catch (error) {
            res.status(500).json({message: "Error: " + error.message})
        }
    }
)

router.post("/request/review/:status/:requestId", userAuth,
    async (req, res) => {
        try {
            const loggedInUser = req.user;
            const {status, requestId} = req.params;

            const allowedStatus = ["accepted", "rejected"];
            if(!allowedStatus.includes(status)){
                return res.status(400).json({message: "Invalid status type: " + status})
            }

            const connectionRequest = await ConnectionRequest.findOne({
                _id: requestId,
                toUserId: loggedInUser._id,
                status: "interested"
            })
            if(!connectionRequest){
                return res.status(404).json({message: "Connection request not found"});
            }

            connectionRequest.status = status;

            const data = await connectionRequest.save();

            res.json({message: "Connection request " + status, data});

        } catch (error) {
            res.status(500).json({message: "Error: " + error.message});
        }
    }
)

module.exports = router