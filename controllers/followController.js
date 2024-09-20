'use strict';
const User = require('../models/user');
const Follow = require('../models/follow');
const mongoose = require("mongoose");
const { ResponseRender } = require('../helpers/glocal-functions');
const  { errors_messages } = require('../constants/errors_messages');
const  { success_messages } = require('../constants/success_messages');

async function addFollow(req, res){

    const followed = req.body.followed 
    const followedId = followed._id;
    const userId = req.sub.userId; 

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
        const saved = await follow.save();
        return res.status(200).json({ message: "Successfully followed the user" });

    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
}
function deleteFollow(req, res){
    
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({'user':userId, 'followed':followId}).remove(err => {
       if(err) return res.status(500).send({message: 'Error unfollowing'}); 
        
       return res.status(200).send({message: 'The unfollow is complete'});
    });   
}
async function getFollowingUsers(req, res){

    const userId = req.sub.userId;
    const page = req.params.page || 1;    
    const itemsPerPage = 4;
    try {   
    const followings =  await Follow.find({user:userId}).
        populate({path: 'followed', select: 'name email photo'})
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
function getFollows(req, res){

    const userId = req.sub.userId;
    Follow.find({user: userId}).populate('followed')
    .exec().
    then((follows) => {
        res.status(200).send({follows});
    }).catch(err=>{
        if(err) return res.status(500).send({message: 'Server error'});
    })
    
}
//liste des personnes qui me suit 
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
}//GET FOLLOWING LIST , la liste que moi je les suivi
async function getunSubscribe(req,res){
    try {
        const userId = req.sub.userId;
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
async function followUserIds(user_id){

    const following = await Follow.find({"user": user_id}).select({'_id':0, '_v':0, 'user':0}).exec().then((follows) => {
        return follows;
        }).catch((err) => {
                return handleError(err);    
        });

    const followed = await Follow.find({"followed": user_id}).select({'_id':0, '_v':0, 'followed':0}).exec().then((follows) => {
        return follows;
        }).catch((err) => {
                return handleError(err);    
        });
    

    const following_clean = [];
    
    following.forEach((follow) => {
        following_clean.push(follow.followed);
    });
    
    var followed_clean = [];
    
    followed.forEach((follow) => {
        followed_clean.push(follow.user);
    });

    return{
        following: following_clean,
        followed: followed_clean
    }
    
}
module.exports = {
    addFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getFollows,
    getunSubscribe
}