/**
 * Created by wayne on 10/24/2015.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Week = new Schema({
    weekNumber: Number,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'Account'},
    startDate: {type: Date, default: Date.now},
    completed: {type: Boolean, default: false},
    volumeDay: {
        squat: {
            weight: Number,
            difficulty: String
        },
        benchPress: {
            weight: Number,
            difficulty: String
        },
        overheadPress: {
            weight: Number,
            difficulty: String
        }
    },
    lightDay:{
        squat: {
            weight: Number
        },
        benchPress: {
            weight: Number
        },
        overheadPress: {
            weight: Number
        }
    },
    intensityDay: {
        squat: {
            weight: Number,
            difficulty: String
        },
        benchPress: {
            weight: Number,
            difficulty: String
        },
        deadlift: {
            weight: Number,
            difficulty: String
        },
        overheadPress: {
            weight: Number,
            difficulty: String
        }
    }
});
module.exports = mongoose.model('Week', Week);