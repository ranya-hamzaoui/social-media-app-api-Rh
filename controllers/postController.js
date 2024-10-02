const Post = require('../models/post');
const Follow = require('../models/follow');
const PostLike = require('../models/postLike');

const { ResponseRender } = require('./../helpers/glocal-functions');
const  { errors_messages } = require('./../constants/errors_messages');
const  { success_messages } = require('./../constants/success_messages');

async function savePost(req, res) {
    const { description, title } = req.body;
    const {userId} = req.sub;
    const postData = {
        description,
        title,
        photo: 'Captue.png',
        user: userId,
    };
    try {
        const newPost = new Post(postData);
        const postSaved = await newPost.save();
        return res.status(200).json(ResponseRender(200, success_messages.ITEM_CREATED, { post: postSaved }));
    } catch (error) {
        console.error('Error saving the post:', error);
        return res.status(500).json(ResponseRender(500, errors_messages.SERVER_ERROR, { message: 'Error saving the post' }));
    }
}
async function deletePost(req, res) {
    const {id:postId} = req.params; 
    const {userId} = req.sub; 

    try {
        //supprimer post that user is auth
        const deletedPost = await Post.findOneAndDelete({ _id: postId, user: userId });

        if (!deletedPost) {
            return res.status(404).json(ResponseRender(404, errors_messages.ITEM_NOT_FOUND, { message: 'Post not found or user is not authorized' }));
        }
        return res.status(200).json(ResponseRender(200, success_messages.ITEM_DELETED, { post: deletedPost }));
    } catch (error) {
        console.error('Error deleting the post:', error); // Log the error for debugging
        return res.status(500).json(ResponseRender(500, errors_messages.SERVER_ERROR, { message: 'Error deleting the post' }));
    }
}
async function editPost(req, res) {
    const {id:postId} = req.params; 
    const {userId} = req.sub; 
    const postUpdates = req.body;

    try {
        const updatedPost = await Post.findOneAndUpdate(
            { _id: postId, user: userId }, 
            { $set: postUpdates },
            { new: true }
        );
        if (!updatedPost) {
            return res.status(404).json(ResponseRender(404, errors_messages.ITEM_NOT_FOUND, { message: 'Post not found or user is not authorized' }));
        }
        return res.status(200).json(ResponseRender(200, success_messages.ITEM_UPDATED, { post: updatedPost }));
    } catch (error) {
        console.error('Error updating the post:', error); // Log the error for debugging
        return res.status(500).json(ResponseRender(500, errors_messages.SERVER_ERROR, { message: 'Error updating the post' }));
    }
}
async function getAllPostwithLike(req, res) {
    const userId = req.sub.userId;
    try {
      const posts = await Post.find({})
      .sort('-createdAt')
      .populate({
        path: 'user',
        select : 'name photo'
       })
      .populate({
          path: 'comments',
          select :'text user createdAt ',
          populate : {
            path : 'author',
            select : 'name photo' 
          },
          options: { sort: { createdAt: -1 } }
      })
      const result = await Promise.all(posts.map(async (post) => {
      const postLike = await PostLike.findOne({ post: post._id });
      let likedByMe = false;
      let likeCount = 0;
        if (postLike) {
          likeCount = postLike.users_likes.length;
          likedByMe = postLike.users_likes.some(
            (like) => like.author.toString() === userId
          );
        }
         return {
            ...post.toObject(),  
            likedByMe,          
            likeCount          
          };
      }));
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching posts', error });
    }
}
async function getConnectUserPost(req, res) {
    try {
        const page = Number(req.params.page)|| 1;
        const itemsPerPage = 10;
        const {userId} = req.sub;

        const posts = await Post.find({ user: userId })
                                .sort('-createdAt')
                                .populate('user')
                                .skip((page - 1) * itemsPerPage)
                                .limit(itemsPerPage)
                                .exec();

        if (!posts || posts.length === 0) {
            return res.status(404).send({ message: 'No posts available',posts : [] });
        }

        const result = await Promise.all(posts.map(async (post) => {
            const postLike = await PostLike.findOne({ post: post._id });
            let likedByMe = false;
            let likeCount = 0;
              if (postLike) {
                likeCount = postLike.users_likes.length;
                likedByMe = postLike.users_likes.some(
                  (like) => like.author.toString() === userId
                );
              }
               return {
                  ...post.toObject(),  
                  likedByMe,          
                  likeCount          
                };
            }));
        
        const totalPosts = await Post.countDocuments({ user: userId });

        return res.status(200).send({
            totalPages: totalPosts,
            pages: Math.ceil(totalPosts / itemsPerPage),
            page: page,
            itemsPerPage: itemsPerPage,
            result
        });
        // return res.json(result)
    } catch (error) {
        console.log('Error:', error);
        return res.status(500).send({ message: 'Error returning the posts' });
    }
}
async function getPostsByFollows(req, res) {
    try {
        const page = Number(req.params.page)|| 1;
        const itemsPerPage = Number(req.params.perPage)|| 10;
        const {userId} = req.sub;

        const follows = await Follow.find({ user: userId }).populate('followed').exec();

        if (!follows) {
            return res.status(404).send({ message: 'No follows found' });
        }

        const follows_clean = follows.map(follow => { console.log(follow.followed); follow.followed });
        follows_clean.push(userId); 

        const posts = await Post.find({ user: { "$in": follows_clean } })
                                .sort('-createdAt')
                                .populate('user')
                                .skip((page - 1) * itemsPerPage)
                                .limit(itemsPerPage)
                                .exec();

        const totalPosts = await Post.countDocuments({ user: { "$in": follows_clean } });

        if (!posts || posts.length === 0) {
            return res.status(404).send({ message: 'No posts available' });
        }
        return res.status(200).send({
            totalPages: totalPosts,
            pages: Math.ceil(totalPosts / itemsPerPage),
            page: page,
            itemsPerPage: itemsPerPage,
            posts
        });
    } catch (error) {
        console.log('Error:', error);
        return res.status(500).send({ message: 'Error returning the posts' });
    }
}
async function getPosts(req, res) {
    try {
        const page = Number(req.params.page)|| 1;
        const itemsPerPage =  Number(req.params.perPage) || 10 ;
        const posts = await Post.find({})
                                .sort('-createdAt')
                                .populate({
                                    path: 'user',
                                    select : 'name photo'
                                })
                                .populate({
                                    path: 'comments',
                                    options: { sort: { createdAt: -1 } }
                                })
                                .skip((page - 1) * itemsPerPage)
                                .limit(itemsPerPage)
                                .exec();

        const totalPosts = await Post.countDocuments({});
        if (!posts || posts.length === 0) {
            return res.status(404).send({ message: 'No posts available',posts : [] });
        }
        return res.status(200).send({
            totalPages: totalPosts,
            pages: Math.ceil(totalPosts / itemsPerPage),
            page: page,
            itemsPerPage: itemsPerPage,
            posts
        });
    } catch (error) {
        return res.status(500).send({ message: 'Error returning the posts' });
    }
}
module.exports = {
    savePost,
    getPosts,
    getPostsByFollows,
    getConnectUserPost,
    deletePost,
    editPost,
    getAllPostwithLike
}