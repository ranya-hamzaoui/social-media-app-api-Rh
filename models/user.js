// 'use strict';

// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;

// var UserSchema = Schema({
//     name: String,
//     email: {
//         type : String ,
//         unique: true 
//     },
//     password: String,
//     photo: String,
//     dateBirth: String,
//     gender : String,  
//     passwordResetToken: {
//         type: String,
//         select: false,
//     }, 
//     passwordResetExpires: {
//         type: Date,
//         select: false,
//     }
// });

// module.exports = mongoose.model('User', UserSchema);

const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true, 
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        },
    photo: {
        type: String,
        default: 'default_photo_url', 
    },
    dateBirth: {
        type: Date,
        required: true, 
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
});

UserSchema.index({ email: 1 });

const User = mongoose.model('User', UserSchema);
module.exports = User;
