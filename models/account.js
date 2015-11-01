/**
 * Created by wayne on 10/24/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
    currentWeek: {type: Number, default: 1}
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
