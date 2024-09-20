const bcrypt = require("bcryptjs");
const User = require('../models/user');
const Post = require('../models/post');
const Follow = require('../models/follow');

const { ResponseRender } = require('../helpers/glocal-functions');
const  { errors_messages } = require('../constants/errors_messages');
const  { success_messages } = require('../constants/success_messages');
const {generateToken,generateRefreshToken} = require('../middelware/jwtHelper');
const  _ = require('lodash');
var blacklistedTokens = []; 
var tokenList= {}
const upload = require('../helpers/upload')


async function login (req, res) {
  try {

    const { email, password } = req.body;
    const user = await User.findOne({ email });
        
    if (!user) {
      return res.status(408).json(ResponseRender(408,errors_messages.INVALID_CREDENTIALS,{ message: 'Invalid email or password'}));
    }
    const isMatch = await bcrypt.compare(password, user.password.trim());
    
    if (!isMatch) {
      return res.status(408).json(ResponseRender(408,errors_messages.INVALID_CREDENTIALS,{ message: 'Invalid email or password'}));
    }
    const token = generateToken({userId: user._id, email: user.email});
    const refreshToken = generateRefreshToken(user); 
    const userDetail = {_id:user._id,name:user.name,email:user.email,photo:user.photo}
    const response = {user:userDetail, token, refreshToken};
    return res.status(200).json(ResponseRender(200,success_messages.SUCCESS_LOGIN,response));

  } catch (error) {
    console.log('error',error)
    return res.status(500).json(ResponseRender(500,errors_messages.SERVER_ERROR,{message: error.message}));
  }
};

async function register (req, res)  {
    
    const {email,name,dateBirth,gender,password} = req.body

    User.findOne({email}).then((user) => {
     if (user) return res.status(409).json(ResponseRender(409,errors_messages.ACCOUNT_ALREADY_EXIST,{}));
     
     bcrypt.hash(password,10,async (err, hash) => {
          if (err) {
            return res.status(500).json(ResponseRender(500,errors_messages.SERVER_ERROR,{message: err}));
          } else {

            const user = new User({
              email,
              name,
              dateBirth,
              gender,              
              password: hash,
            });
  
            user
              .save()
              .then((user) => {
               return res.status(200).json(ResponseRender(200,success_messages.ACCOUNT_CREATED,{user}));
              })
              .catch((error) => {
                 return res.status(500).json(ResponseRender(500,errors_messages.SERVER_ERROR,{message: error}));
              });
          }
        });
    });
  };
async function getProfile (req, res)  {
    try {
      const _id = req.params.id || req.sub.userId;
      const user = await User.findOne({ _id: _id });
      const totalfollowings = await Follow.countDocuments({user:_id});
      const totalPosts = await Post.countDocuments({user:_id});
      const totalfolloweds = await Follow.countDocuments({followed:_id});
      let response = {user, totalPosts, totalfolloweds, totalfollowings}
      return res.status(200).json(ResponseRender(200, success_messages.USER_PROFILE_FETCHED, response));
    } catch (error) {
      console.log('user', error)
      return res.status(500).json(ResponseRender(500, errors_messages.SERVER_ERROR, { message: error.message }));
    }
};
async function getAllUsers  (req, res)  {
  try {
    const users = await User.find({}); 
    return res.status(200).json(ResponseRender(200,success_messages.LIST_FOUND,{users}));
  } catch (error) {    
    return res.status(500).json(ResponseRender(500, errors_messages.SERVER_ERROR, { message: error.message }));
  }
}

async function logout  (req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken || !(refreshToken in tokenList)) {
      return res.status(401).send({
          state: "failed",
          message: "Invalid or expired refresh token",
          data: null
      });
  }
  res.status(200).json({
      state: "success",
      message: "Logged out successfully",
      data: null
  });
};
async function refreshToken  (req, res)  {

  let refreshToken = req.body.refreshToken;
  // add expiration test 
  if ((refreshToken) && (refreshToken in tokenList)) {
    {
      res.status(401).send({
          state: "failed",
          message: 'expired refresh',
          data: null
      })
    }
   }
  jwt.verify(refreshToken, configToken.REFRESH_SECRET_KEY,{ algorithms: configToken.ALGORITHM_JWT } ,(err, decoded) => {
   if (err)  return res.status(401).json(ResponseRender(401,errors_messages.UNAUTHORIZED ,{}));
   const token = generateToken(decoded.user);
   const refresh_token = generateRefreshToken(decoded.user); 
   const response = {userDetails:decoded.user, token, refresh_token};
   tokenList[refresh_token].token = token;

   return res.status(200).json(ResponseRender(200,success_messages.SUCCESS_REFRESH,response));
 })
}

// app.post('/api/users/:userId/upload', upload.single('profileImage'),

async function editProfile  (req, res){
  try {
    const userId = req.sub.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    // if (user.profileImage) {
      //   fs.unlinkSync(user.profileImage);
      // }
    user.photo = req.file.originalname;
    console.log('file name', req.file.originalname)
    await user.save();

    res.json({ message: 'Profile image updated successfully', imageUrl: req.file.path });
  } catch (error) {
    console.log('errorrrrr', error)
    res.status(500).json({ error: 'An error occurred while updating the profile image' });
  }
}
module.exports= {
  register,
  login,
  getProfile,
  getAllUsers,
  logout,
  refreshToken,
  editProfile
}

  