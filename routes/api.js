/**
 * Created by wayne on 10/24/2015.
 */
var express = require('express');
var router = express.Router();

router.route('/week')
    //returns every week
    .get(function(req, res){
        //temporary solution
        res.send({message: 'TODO return every week'});
    })
    .post(function(req, res){
        //temporary solution
        res.send({message: 'TODO create new week'});
    });

router.route('/week/:id')
    //returns a particular week
    .get(function(req, res){
        res.send({message: 'TODO return week with ID ' + req.params.id});
    })
    //update existing week
    .put(function(req, res){
        res.send({message: 'TODO modify a week with ID ' + req.params.id});
    })
    //delete existing post
    .delete(function(req, res){
        res.send({message: 'TODO delete a week with ID ' + req.params.id});
    });

module.exports = router;