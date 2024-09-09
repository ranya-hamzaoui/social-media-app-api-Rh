'use strict';
var User = require('../models/user');
var Like = require('../models/postLike');
var Post = require('../models/post');

async function saveLike(req, res) {
    try {
        const user = req.sub;
        const postId = req.params.id;

        if (!user || !postId) {
            return res.status(400).send({ message: 'User or post ID is missing' });
        }

        const like = await Like.findOne({ post: postId }).exec();

        if (like) {
            const userHasLiked = like.users_likes.some(likeEntry => likeEntry.author.toString() === user.userId.toString());

            if (userHasLiked) {
                return res.status(200).send({ message: 'The Like already exists' });
            } else {
                like.users_likes.push({ author: user.userId });
                const likeStored = await like.save();

                if (!likeStored) {
                    return res.status(404).send({ message: 'The like is not stored' });
                }

                // Return the updated like
                return res.status(200).send({ like: likeStored });
            }
        } else {
            // If the like entry doesn't exist for the post, create a new one
            const newLike = new Like({
                post: postId,
                users_likes: [{ author: user.userId }]
            });

            const likeStored = await newLike.save();

            if (!likeStored) {
                return res.status(404).send({ message: 'The like is not stored' });
            }

            // Return the newly created like
            return res.status(200).send({ like: likeStored });
        }
    } catch (error) {
        console.log('Error:', error);
        return res.status(500).send({ message: 'Error processing the like' });
    }
}

function checkLike(req, res){
    
    const userId = req.sub.userId;
    const postId = req.params.id;
    
    Like.find({ 'user':userId, 'post':postId })
    .then(like=> {
        return res.status(200).send({like}); 
    })
    .catch(err=> {
        return res.status(500).send({message: 'Error searching the like'});
    }) 
}

async function deleteLike(req, res) {
    try {

        const  userId = req.sub.userId
      const  postId = req.params.id
      const result = await Like.updateOne(
        { post: postId },
        { $pull: { users_likes: { author: userId } } }
      );
      
      if (result.nModified > 0) {
        console.log("User like removed successfully");
        return res.status(200).send({message: 'The like is deleted correctly'});
      } else {
        console.log("No like found for this user in the post");
        return res.status(400).send({message: 'The like is deleted correctly'});
      }
    } catch (error) {
        console.log("No like found for this user in the post",error);
        return res.status(500).send({message: 'The like is Not deleted correctly'});
    }
  }
async function getLikes(req, res) {
    try {
        const postId = req.params.post; 

        if (!postId) {
            return res.status(400).send({ message: 'Post ID is missing' });
        }
        
        const likes = await Like.find({ post: postId }).populate('users_likes.author').exec();

        // if (!likes || likes.length === 0) {
        //     return res.status(404).send({ message: 'No likes found for this post' });
        // }
        return res.status(200).send({ likes });

    } catch (error) {
        console.log('Error:', error);
        return res.status(500).send({ message: 'Server error' });
    }
}




module.exports = {
    saveLike,
    checkLike,
    deleteLike,
    getLikes
}