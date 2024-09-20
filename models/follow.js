'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User'},
    followed: { type: Schema.ObjectId, ref: 'User'},
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Follow', FollowSchema);