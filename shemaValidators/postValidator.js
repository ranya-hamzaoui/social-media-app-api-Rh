const { ResponseRender } = require('../helpers/glocal-functions');
const  { errors_messages } = require('../constants/errors_messages');
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

exports.likePostSchema = (req, res, next) => {
  const schema = Joi.object({
    post: Joi.objectId().required(),
    authorId: Joi.objectId().required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(ResponseRender(400,errors_messages.BAD_REQUEST,{message:error.message}));

  }
  next();
};
exports.createPostSchema = (req, res, next) => {
  const validateObject = Object.assign({}, req.body);

  const schema = Joi.object({
    description: Joi.string()
      .allow("")
      .required(),
  });

  const { error, value } = schema.validate(validateObject);
  if (error) {
    console.log('error',error)
    return res.status(400).json(ResponseRender(400,errors_messages.BAD_REQUEST,{message:error.message}));
  }
  next();
};