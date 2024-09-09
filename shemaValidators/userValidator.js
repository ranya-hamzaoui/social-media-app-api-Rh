const { ResponseRender } = require('./../helpers/glocal-functions');
const  { errors_messages } = require('./../constants/errors_messages');
const Joi = require("@hapi/joi");

Joi.objectId = require("joi-objectid")(Joi);

exports.registerSchema = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(30)
      .required(),
    email: Joi.string()
      .min(5)
      .max(30)
      .pattern(
        new RegExp(
          /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        )
      )
      .required(),
    password: Joi.string().min(6).max(30).required(),
    gender: Joi.string().valid('male', 'female').optional()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    console.log('err', error)
    return res.status(400).json(ResponseRender(400,errors_messages.BAD_REQUEST,{message:error.message}));
  }
  next();
};

exports.loginSchema = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(ResponseRender(400,errors_messages.BAD_REQUEST,{message:error.message}));
  }
  console.log('it ok!!!!!!!')
  next();
};