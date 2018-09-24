const express = require('express');
const router = express.Router();
const User = require('../mongoose/User');
const Middleware = require('./middleware.js');
const constants = require('./constants.js');

router.post('/find', (req,res) => {
  User.findById(req.body.id)
    .exec((err, user) => {
      if(err || !user) {
        res.send({error:true, message: 'Could not find user'});
        return;
      }
      res.send({error: false, message:'user was found', user});
    })
})

router.post('/create',(req,res)=>{
 //create new user
 if(req.body.username && req.body.password){ //enforce request data
   User.findOne({username: req.body.username})
    .exec(function(err, user){
      if(user !== null){
        //res.send({error: true, message: 'user already exists!'});
        finish(res, req, "register", {user: null, error: true, message :"user already exists!"});
      }
      else{
        var user = new User({
          username: req.body.username,
          password: req.body.password,
          orders: [],
          cart: [],
        })
       user.save((err,result)=> {
         if (err){
           finish(res, req, "register", {user: null, error: true, message :"Error when saving user"});
           return;
         }
         //console.log("User saved successfully ")
         req.session.userId = user._id;
         finish(res, req, "home", {error: false, message: 'user create success', userId: user._id});
        })
      }
    })
  }
})

router.post('/auth', (req,res) => {
  if(req.body.username && req.body.password){
    User.auth(req.body.username,req.body.password, (err,userId) => {
      if(err) {
        finish(res, req, 'login', {error: true, message: err, user: null})
        return;
      }
      //console.log("route user", userId);
      req.session.userId = userId;
      req.session.username = req.body.username;
      finish(res, req, 'home', {error: false, message: "login success", user: userId})
    })
  }
  else{
    finish(res, req, 'login', {error: true, message: 'request is incomplete (missing username or password)', user: null});
  }
})

router.get('/logout', Middleware, (req,res) => {
  if(req.session){
    req.session.destroy((err) => {
      if(err) {
        finish(res, req, 'home',{user: null, error: true, message: 'something went wrong with logging out #2'});
      }
      else{
        finish(res, req, 'home', {user: null, error: false, message: "logout success"});
      }
    })
  }
  else{
    finish(res, req, "home", {user: null, error: true, message: "you must be logged in to logout"})
  }
})

function finish(res, req, dest, vars){
  if(constants.testing){
    res.send(vars)
    return;
  }
  else{
    dest = '../'+dest;
    if(req.session){
      if(vars.error){
        //console.log(vars.message);
        req.session.error = vars.message;
      }
      else{
        req.session.error = null;
      }
    }
    res.redirect(dest)
  }
}

module.exports = router;
