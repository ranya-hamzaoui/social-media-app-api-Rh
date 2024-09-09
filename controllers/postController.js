const { ResponseRender } = require('./../helpers/glocal-functions');
const  { errors_messages } = require('./../constants/errors_messages');
const  { success_messages } = require('./../constants/success_messages');
const fs = require('fs');
const path = require('path')
var Post = require('../models/post');
var Follow = require('../models/follow');
const PostLike = require('../models/postLike');


function savePost(req, res) {
    
    console.log('user connected--------', req.sub)
    const post = req.body;
    const user = req.sub; 

    const postData = {
        description: post.description,
        photo: 'null', 
        user: user.userId
    };

    console.log('userData ----------',postData)

    const newPost = new Post(postData);

    newPost.save()
        .then((postSaved) => {
            return res.status(200).json(ResponseRender(200, success_messages.ITEM_CREATED, { post: postSaved }));
        })
        .catch((error) => {
            return res.status(500).json(ResponseRender(500, errors_messages.SERVER_ERROR, { message: 'Error saving the post' }));
        });
}
async function getPostsByFollows(req, res) {
    try {
        const page = Number(req.params.page)|| 1;
        const itemsPerPage = 10;
        const userId = req.sub.userId;

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

        // Count total posts to calculate pagination
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

async function getPostsConnectedUser(req, res) {
    try {
        const page = Number(req.params.page)|| 1;
        const itemsPerPage = 10;
        const userId = req.sub.userId;

        const posts = await Post.find({ user: userId })
                                .sort('-createdAt')
                                .populate('user')
                                .skip((page - 1) * itemsPerPage)
                                .limit(itemsPerPage)
                                .exec();

        const totalPosts = await Post.countDocuments({ user: userId });

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
        console.log('Error:', error);
        return res.status(500).send({ message: 'Error returning the posts' });
    }
}

async function getPosts(req, res) {
    try {
        const page = Number(req.params.page)|| 1;
        const itemsPerPage = 4;
        const posts = await Post.find({})
                                .sort('-createdAt')
                                .populate('user')
                                .populate('comments')
                                .populate({
                                    path: 'comments',
                                    options: { sort: { createdAt: -1 } }
                                })
                                // .populate({
                                //     path : 'comments',
                                //     populate : {
                                //       path : 'user'
                                //     }
                                //   })
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
function getPostsWithoutPage(req, res){

    Post.find({}).populate('user')
                 .sort('-createdAt')
                 .populate('user')
                 .exec()
       .then((posts) => {
        return res.status(200).send({
            posts 
        });
      })
      .catch((error) => {
        return res.status(500).send({message: 'Error returning the posts'});
    }); 

}
function getPostsUser(req, res){

    const page =req.params.page || 1;
    const user = req.sub.userId;   
    const itemsPerPage = 4;

    Post.find({user: user}).sort('-created_at').
    populate('user').
    paginate(page, itemsPerPage, (err, publications, total) => {
        if (err) return res.status(500).send({message: 'Error returning the publications'});

        if(!publications) return res.status(404).send({message: 'No publications available'});

        return res.status(200).send({
            total_items: total,
            pages : Math.ceil(total/itemsPerPage),
            page: page,
            items_per_page: itemsPerPage,
            publications 
        });
    });
}
function getImageFile(req, res){
    
    const imageFile = req.params.imageFile;
    const pathFile = './uploads/'+imageFile;
        
    fs.exists(pathFile, (exists) => {
       if(exists){
           res.sendFile(path.resolve(pathFile));
       }else{
           res.status(200).send({message: 'The image doesn´t exist'});
       }
    });
    
}
function deletePost(req, res) {
  
    const postId = req.params.id; 
    const user = req.sub; 

    Post.findOneAndDelete({ _id: postId, user: user.userId })
        .then((deletedPost) => {
            if (!deletedPost) {
                return res.status(404).json(ResponseRender(404, errors_messages.ITEM_NOT_FOUND, { message: 'Post not found or user is not authorized' }));
            }
            return res.status(200).json(ResponseRender(200, success_messages.ITEM_DELETED, { post: deletedPost }));
        })
        .catch((error) => {
            return res.status(500).json(ResponseRender(500, errors_messages.SERVER_ERROR, { message: 'Error deleting the post' }));
        });
}
function editPost(req, res) {
    const postId = req.params.id; // Assuming the post ID is passed in the request parameters
    const user = req.sub; // User information from the request
    const postUpdates = req.body; // Updated post data

    // Find the post by ID and ensure it belongs to the current user, then update it
    Post.findOneAndUpdate(
        { _id: postId, user: user.userId }, // Find the post by ID and user ID
        { $set: postUpdates }, // Update the post with new data
        { new: true } // Return the updated document
    )
    .then((updatedPost) => {
        if (!updatedPost) {
            return res.status(404).json(ResponseRender(404, errors_messages.ITEM_NOT_FOUND, { message: 'Post not found or user is not authorized' }));
        }
        return res.status(200).json(ResponseRender(200, success_messages.ITEM_UPDATED, { post: updatedPost }));
    })
    .catch((error) => {
        return res.status(500).json(ResponseRender(500, errors_messages.SERVER_ERROR, { message: 'Error updating the post' }));
    });
}

async function getAllPostByLike  (req, res) {
    const userId = req.sub.userId;
  
    try {

      const posts = await Post.find()
      .sort('-createdAt')
      .populate('user')
      .populate('comments')
      .populate({
          path: 'comments',
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
  

module.exports = {
    savePost,
    getPosts,
    getPostsByFollows,
    getPostsConnectedUser,
    getImageFile,
    deletePost,
    editPost,
    getAllPostByLike
    
}