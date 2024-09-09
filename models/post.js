const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        trim: true,
        default: ""
    },
    description: {
      type: String,
      trim: true,
      default: "",
      required: "You must supply a text"
    },
    photo: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: "You must supply a User"
    }, 
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      default: [],
      ref: 'Comment'
    }]
  });

postSchema.index({ user: 1 });
postSchema.index({ createdAt: -1 });  

module.exports = mongoose.model('Post', postSchema);