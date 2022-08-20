const Joi = require("joi");
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
require("dotenv").config();
const _ = require('lodash');
// const jwt = require('jsonwebtoken');

const schema = Joi.object({
  userName: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(3).max(30).required(),
  repeat_password: Joi.ref("password"),
  phone: Joi.string().min(10).max(15).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "in", "io", "org", "edu"] },
    })
    .required(),
});

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  phone : {
    type:Number,
    required : true,
  }
});

userSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ _id: this._id ,username:this.username}, process.env.JWT_PRIVATE_KEY);
  return token;
}
userSchema.methods.verifyAuthToken = function(token){
  const decode = jwt.verify(token,process.env.JWT_PRIVATE_KEY);
  console.log(decode);
}

const User = mongoose.model('User', userSchema);

// async function getUserById(userid) {
//   const query = `SELECT * from users where userid = "${userid}";`;
//   const res = await executeSqlQuery(query);
//   if (res[0]) return res[0];
//   return false;
// }

async function getUserByEmail(email) {
  let user = await User.findOne({ email: email });
  if(user) return user;
  return false;
}

async function createUser(params) {
  try{
    const salt = await bcrypt.genSalt(10);
    params.password = await bcrypt.hash(params.password, salt);
    user = new User(_.pick(params, ['userName', 'email', 'password','phone']));
    await user.save();
    const token = user.generateAuthToken();
    return token;
  }
  catch(err){
    return false;
  }
}

function validateCreateRequest({
  userName,
  email,
  password,
  phone,
  repeat_password,
}) {
  return schema.validate({
    userName,
    email,
    password,
    phone,
    repeat_password,
  });
}

async function updateUserOne(password,email){
  try{
    let user =await User.findOne({email: email});
      if (!user) return false;
    user.password = password;
    user = await user.save();
    return user;
  }
  catch(ex){
     return false;
  }
}

module.exports = { 
  validateCreateRequest,
  getUserByEmail,
  // getUserById,
  createUser,
  updateUserOne,
  User
};
exports.User = User; 
// exports.validateCreateRequest = validateCreateRequest;