'use strict';
const User = require('../models/user');
const Follow = require('../models/follow');
const { ResponseRender } = require('../helpers/glocal-functions');
const  { errors_messages } = require('../constants/errors_messages');
const  { success_messages } = require('../constants/success_messages');

async function addFollow(req, res){

    const {followed} = req.body 
    const followedId = followed._id;
    const {userId} = req.sub; 

    if (userId === followedId) {
        return res.status(400).json({ message: "You cannot follow yourself" });
    }
    try {
        const user = await User.findById(userId);
        const followedUser = await User.findById(followedId);

        if (!user || !followedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const existingFollow = await Follow.find({ user: userId, followed: followedId });
        if (existingFollow && existingFollow.length!=0) {
            return res.status(400).json({ message: "You are already following this user" });
        }
        const follow = new Follow({ user: userId, followed: followedId });
        await follow.save();
        return res.status(200).json({ message: "Successfully followed the user" });

    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
}
async function getFollowingUsers(req, res){

    const userId = req.sub.userId;
    const page = Number(req.params.page) || 1;    
    const itemsPerPage = Number(req.params.perPage) ||  10;
    try {   
    const followings =  await Follow.find({user:userId})
        .populate({path: 'followed', select: 'name email photo'})
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .exec();

    const totalfollowings = await Follow.countDocuments({user:userId});
    return res.status(200).send({
        total: totalfollowings,
        pages: Math.ceil(totalfollowings/itemsPerPage),
        followings,
        page: page,
        itemsPerPage: itemsPerPage
     }); 
        
    } catch (error) {
        return res.status(500).send({ message: 'Error returning the posts' });
    } 
}
async function getunSubscribe(req,res){
    try {
        const {userId} = req.sub;
        const followedUsers = await Follow.find({ user: userId }).select('followed').lean();
        const followedUserIds = followedUsers.map(follow => follow.followed);
        const usersNotFollowed = await User.
        find({ _id: { $nin: [...followedUserIds, userId] } }).
        select( 'name photo email _id').exec()
        res.json({data : usersNotFollowed});
      } catch (err) {
        res.status(500).send({ error: 'An error occurred' });
      }
}
async function deleteFollow(req, res) {
    const {userId} = req.sub; 
    const {id:followId} = req.params;

    try {
        const result = await Follow.deleteOne({ user: userId, followed: followId }); // Use deleteOne for better clarity
        if (result.deletedCount === 0) {
            return res.status(404).send({ message: 'Follow relationship not found' });
        }
        return res.status(200).send({ message: 'Unfollow completed successfully' });
    } catch (err) {
        console.error('Error unfollowing:', err); // Log the error for debugging
        return res.status(500).send({ message: 'Error unfollowing' });
    }
}
function getFollowedUsers(req, res){

    const userId = req.user.sub;
    const page = Number(req.params.page) || 1;
    const itemsPerPage = 4;
    
    Follow.find({followed:userId}).populate('user').paginate(page, itemsPerPage, (err, follows, total) => {
         if(err) return res.status(500).send({message: 'Server error'});
        
         if(!follows) return res.status(404).send({message: 'You are not followed'});
        
        followUserIds(req.user.sub).then((value) => {
            return res.status(200).send({
               total: total,
               pages: Math.ceil(total/itemsPerPage),
               follows,
               users_following: value.following,
               users_follow_me: value.followed,
            });
        });
    });
}
module.exports = {
    addFollow,
    getFollowingUsers,
    getunSubscribe,
    deleteFollow,
    getFollowedUsers
}