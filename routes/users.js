/**
 * Created by wayne on 10/25/2015.
 */
var express = require('express');
var router = express.Router();
var Week = require('../models/week');
var Account = require('../models/account');


//Query database for username and return the user's id
var findUserIdByUsername = function(username, callback){
    Account.findOne({username: username}, function(err,user){
        if(!user)
            return callback(new Error('No user matching ' + username));
        return callback(null, user);
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

//find user id if username is present in the route path
router.param('username',function(req, res, next, username){
    console.log('username param was detected: ' + username);
    findUserIdByUsername(username,function(err,user){
        if(err) return next(err);
        req.userId = user._id;
        req.currentWeek = user.currentWeek;
        return next();
    })
});

//find the specified week of the user
router.param('weekNum',function(req, res, next, weekNum){
    console.log('weekNum param was detected: ' + weekNum);
    findWeekNumOfUser(weekNum,req.userId,function(err,week){
        if(err) return next(err);
        req.weekNum = week;
        return next();
    })
});

router.route('/:username')
    // return the current week of the user
    .get(function(req,res,next){
        res.json(req.currentWeek);
    })
    // set the current week of the user
    .put(function(req,res){
        console.log("update week: " + req.body.currentWeek);
        Account.update({_id: req.userId}, {$set: {currentWeek: req.body.currentWeek}}, function(err){
            if(err) return res.send(500,err);
            return res.json({message: "Current week updated successfully"});
        });
    })
    //create a new week for the user
    .post(function(req,res, next){
        var week = new Week;
        week.user = req.userId;
        week.weekNumber = req.body.weekNumber;
        week.volumeDay = req.body.volumeDay;
        week.lightDay = req.body.lightDay;
        week.intensityDay = req.body.intensityDay;
        week.save(function(err,week){
            if(err) return res.send(500, err);
            return res.json(week);
        });
    })

router.route('/:username/:weekNum')
    //returns a particular week based on weekNum
    .get(function(req, res, next){
        res.json(req.weekNum[0]);
    })
    //update specified week
    .put(function(req, res){
        var properties = {};
        for(var prop in req.body){
            if(req.body.hasOwnProperty(prop))
                properties[prop] = req.body[prop]
        }
        console.log(properties);

        Week.update({_id: req.weekNum[0]._id}, {$set: properties}, function(err){
            if(err) return res.send(500, err);
            return res.json({message: "Properties: updated successfully"});
        });
    })
    //delete existing week
    .delete(function(req, res){
        Week.remove({_id: req.weekNum[0]._id}, function(err){
            if(err) return res.send(500, err);
            res.json("deleted:(");
        });
    });



module.exports = router;