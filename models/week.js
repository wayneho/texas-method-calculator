/**
 * Created by wayne on 10/24/2015.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Week = new Schema({
    weekNumber: String,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'Account'},
    startDate: {type: Date, default: Date.now},
    complete: Boolean,
    volumeDay: {
        squat: {
            weight: String,
            difficulty: String
        },
        benchPress: {
            weight: String,
            difficulty: String
        },
        overheadPress: {
            weight: String,
            difficulty: String
        }
    },
    intensityDay: {
        squat: {
            weight: String,
            difficulty: String
        },
        benchPress: {
            weight: String,
            difficulty: String
        },
        deadlift: {
            weight: String,
            difficulty: String
        },
        overheadPress: {
            weight: String,
            difficulty: String
        }
    }
});
module.exports = mongoose.model('Week', Week);