
const Comment = require('../models/comment')
const Post = require('../models/post')


async function createComment(req, res) {
  try {
    const commentObj = { ...req.body, author: req.sub.userId };
    const post = await Post.findById(commentObj.post);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    const createdComment = await Comment.create(commentObj);
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
async function deleteComment(req, res) {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }
    if (req.sub.userId.toString() !== comment.author._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized action',
      });
    }

    const post = await Post.findById(comment.post);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    post.comments = post.comments.filter(c => c.toString() !== commentId);
    await post.save();
    await comment.deleteOne();
    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully!',
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${err.message}`,
    });
  }
}
async function editComment(req, res) {
  try {
    console.log('edit comment')

    const commentId = req.params.id;
    const existingComment = await Comment.findById(commentId);

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: 'Comment Not Found'
      });
    }
    if (req.sub.userId.toString() !== existingComment.author._id.toString())
      return res.status(401).json({
        success: false,
        message: 'Unauthorized action',
      });

      existingComment.text = req.body.text;
      const editedComment = await existingComment.save();
  
      return res.status(200).json({
        success: true,
        message: 'Comment edited successfully',
        data: editedComment,
      });
    }
  catch (err) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${err.message}`,
    });
  }
}
module.exports= {
    createComment,
    deleteComment,
    editComment
  }