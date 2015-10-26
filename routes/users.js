/**
 * Created by wayne on 10/25/2015.
 */
var express = require('express');
var router = express.Router();
var Week = require('../models/week');
var Account = require('../models/account');

function isAuthenticated (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects

    //allow all get request methods
    if(req.method === "GET"){
        return next();
    }
    if (req.isAuthenticated()){
        return next();
    }

    // if the user is not authenticated then redirect him to the login page
    return res.redirect('/#/login');
}

router.use('/', isAuthenticated);

//Query database for username and return the user's id
var findUserIdByUsername = function(username, callback){
    Account.findOne({username: username}, function(err,user){
        if(!user)
            return callback(new Error('No user matching ' + username));
        return callback(null, user._id);
    });
};

//Query database for the week number corresponding to the user
var findWeekNumOfUser = function(weekNum, userId, callback){
    Week.find({weekNumber: weekNum}).where('user').equals(userId).exec(function(err, week){
        if(!week.length)
            return callback(new Error('No week matching number ' + weekNum));
        return callback(null, week);
    });
};

router.param('username',function(req, res, next, username){
    console.log('username param was detected: ' + username);
    findUserIdByUsername(username,function(err,userId){
        if(err) return next(err);
        req.userId = userId;
        return next();
    })
});

router.param('weekNum',function(req, res, next, weekNum){
    console.log('weekNum param was detected: ' + weekNum);
    findWeekNumOfUser(weekNum,req.userId,function(err,week){
        if(err) return next(err);
        req.weekNum = week;
        return next();
    })
});

router.route('/:username/:weekNum')
    //returns a particular week
    .get(function(req, res, next){
        res.json(req.weekNum);
    })
    //update existing week
    .put(function(req, res){
        res.send({message: 'TODO modify a week with ID ' + req.params.username+' with ID ' + req.params.id});
    })
    .post(function(req,res, next){
        var week = new Week;
        week.user = req.userId;
        week.weekNumber = req.body.weekNumber;
        week.complete = req.body.complete;
        week.volumeDay = req.body.volumeDay;
        week.intensityDay = req.body.intensityDay;
        week.save(function(err,week){
            if(err){
                return res.send(500, err);
            }
            return res.json(week);
        });
    })
    //delete existing post
    .delete(function(req, res){
        res.send({message: 'TODO delete a week with ID ' + req.params.username+' with ID ' + req.params.id});
    });



module.exports = router;