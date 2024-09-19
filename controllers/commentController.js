
const Comment = require('../models/comment')
const Post = require('../models/post')


async function createCommentNew(req, res) {
  try {
    const commentObj = { ...req.body, author: req.sub.userId };
    const createdComment = await Comment.create(commentObj);
    
    const post = await Post.findById(createdComment.post);
    post.comments.push(createdComment._id);
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Comment created successfully',
      data: createdComment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${err.message}`,
    });
  }
}

  function createComment (req, res) {
  const commentObj = req.body 
  commentObj.author = req.sub.userId
  Comment
    .create(commentObj)
    .then((createdComment) => {
      Post
        .findById(createdComment.post)
        .then(post => {
          let postComments = post.comments
          postComments.push(createdComment._id)
          post.comments = postComments
          post
            .save()
            .then(() => {
              res.status(200).json({
                success: true,
                message: 'Comment created successfully',
                data: createdComment
              })
              
            })
            .catch((err) => {
              console.log(err)
              const message = 'Something went wrong'
              return res.status(401).json({
                success: false,
                message: message+err
              })
            })
        })
    })
    .catch((err) => {
      console.log(err)
      const message = 'Something went wrong :('
      return res.status(401).json({
        success: false,
        message: message
      })
    })
}

  async function deleteComment (req, res) {

  const commentId = req.params.id
  let comment = await Comment.findById(commentId)
    
  if (req.sub.userId.toString() === comment.author._id.toString()) {
    let post = await Post.findById(comment.post)
    console.log(post.comments)
    let postComments = post.comments.filter(c => c.toString() !== commentId)
    post.comments = postComments
    await post.save()
    
    comment
      .deleteOne()
      .then(() => {
        return res.status(200).json({
          success: true,
          message: 'Comment deleted successfully!'
        })
      })
      .catch((err) => {
        console.log(err)
        return res.status(401).json({
          success: false,
          message: 'Something went wrong :('
        })
      })
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    })
  }
}

  async function deleteCommentAncien (req, res)  {

    const commentId = req.params.id
    let comment = await Comment.findById(commentId)

    if (req.sub.userId.toString() === comment.user.toString()) {
      let post = await Post.findById(comment.post)

      let postComments = post.comments.filter(c => c.toString() !== commentId)
      post.comments = postComments
      await post.save()
      
      comment
        .remove()
        .then(() => {
          return res.status(200).json({
            success: true,
            message: 'Comment deleted successfully!'
          })
        })
        .catch((err) => {
          console.log(err)
          return res.status(401).json({
            success: false,
            message: 'Something went wrong :('
          })
        })
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }
}
async function  editComment (req, res)  {
    const commentId = req.params.id
    let existingComment = await Comment.findById(commentId)
      .catch((err) => {
        console.log(err)
        const message = 'Something went wrong :( Check the form for errors.'
        return res.status(401).json({
          success: false,
          message: message
        })
      })
    if (req.user._id.toString() === existingComment.id_creator.toString()) {
      const commentObj = req.body      
      existingComment.text = commentObj.text
      existingComment
        .save()
        .then(editedComment => {
          res.status(200).json({
            success: true,
            message: 'Comment Edited Successfully.',
            data: editedComment
          })
        })
        .catch((err) => {
          console.log(err)
          let message = 'Something went wrong :( Check the form for errors.'
          return res.status(401).json({
            success: false,
            message: message
          })
        })
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials!'
      })
    }
  }
  module.exports={
    createComment,
    deleteComment
  }