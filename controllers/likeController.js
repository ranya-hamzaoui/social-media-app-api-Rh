'use strict';
const Like = require('../models/postLike');

async function saveLike(req, res) {
    try {
        const { userId } = req.sub;
        const postId = req.params.id;

        if (!userId || !postId) {
            return res.status(400).send({ message: 'User or post ID is missing' });
        }
        const like = await Like.findOne({ post: postId }).exec();

        if (like) {
            const userHasLiked = like.users_likes.some(likeEntry => likeEntry.author.toString() === userId.toString());

            if (userHasLiked) {
                return res.status(200).send({ message: 'The Like already exists' });
            } else {
                like.users_likes.push({ author: userId });
                const likeStored = await like.save();

                if (!likeStored) {
                    return res.status(404).send({ message: 'The like is not stored' });
                }
                return res.status(200).send({ like: likeStored });
            }
        } else {
            const newLike = new Like({
                post: postId,
                users_likes: [{ author: userId }]
            });
            const likeStored = await newLike.save();
            if (!likeStored) {
                return res.status(404).send({ message: 'The like is not stored' });
            }
            return res.status(200).send({ like: likeStored });
        }
    } catch (error) {
        console.log('Error:', error);
        return res.status(500).send({ message: 'Error processing the like' });
    }
}
async function deleteLike(req, res) {
    try {
      const  {userId} = req.sub
      const  {id: postId} = req.params
      const result = await Like.updateOne(
        { post: postId },
        { $pull: { users_likes: { author: userId } } }
      );
      if (result.modifiedCount > 0) {
        return res.status(200).send({message: 'The like is deleted correctly'});
      } 
      return res.status(404).json({ message: 'No like found to delete' });

    } catch (error) {
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
        return res.status(200).send({ likes });

    } catch (error) {
        console.log('Error:', error);
        return res.status(500).send({ message: 'Server error' });
    }
}
async function checkLike(req, res) {
    const {userId} = req.sub;
    const {id:postId} = req.params;
    try {
        const likes = await Like.find({ user: userId, post: postId });
        return res.status(200).json({ likes });
    } catch (error) {
        console.error('Error searching the like:', error);
        return res.status(500).json({ message: 'Error searching the like' });
    }
}
module.exports = {
    saveLike,
    deleteLike,
    getLikes,
    checkLike
}