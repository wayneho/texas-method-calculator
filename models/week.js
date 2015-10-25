/**
 * Created by wayne on 10/24/2015.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Week = new Schema({
    weekNumber: String,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'Account'},
    completedDate: {type: Date, default: Date.now},
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
        press: {
            weight: String,
            difficulty: String
        },
        bench: {
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