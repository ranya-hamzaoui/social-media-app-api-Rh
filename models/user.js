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
        default: 'default_photo_url.jpg', 
    },
    photoCover: {
        type: String,
        default: 'default_photo_url', 
    },
    photos: [{
        type: String,
        default: 'default_photo_url', 
    }],
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
    phone: {
        type: Number,
        // required: [true, 'Number is required'],
        trim: true,
    },
    job: {
        type: String,
        // required: [true, 'Job is required'],
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

UserSchema.index({ email: 1 });

const User = mongoose.model('User', UserSchema);
module.exports = User;
