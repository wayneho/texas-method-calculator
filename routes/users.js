/**
 * Created by wayne on 10/25/2015.
 */
var express = require('express');
var router = express.Router();
var Week = require('../models/week');
var Account = require('../models/account');

var findUserIdByUsername = function(username, callback){
    Account.findOne({username: username}, function(err,account){
        if(!account)
            return callback(new Error('No user matching ' + username));
        return callback(null, account._id);
    });
};

router.route('/:username/:id')
    //returns a particular week
    .get(function(req, res, next){
        findUserIdByUsername(req.params.username,function(err,userId){
            if(err) return next(err);
            return res.send({message: 'User Id: ' + userId});
        });
    })
    //update existing week
    .put(function(req, res){
        res.send({message: 'TODO modify a week with ID ' + req.params.username+' with ID ' + req.params.id});
    })
    .post(function(req,res){
        res.send({message: 'TODO create a week with ID ' + req.params.username+' with ID ' + req.params.id});
    })
    //delete existing post
    .delete(function(req, res){
        res.send({message: 'TODO delete a week with ID ' + req.params.username+' with ID ' + req.params.id});
    });



module.exports = router;