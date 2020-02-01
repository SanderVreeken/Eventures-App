const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const eventSchema = new mongoose.Schema({
    title: String,
    beginYear: String,
    beginMonth: String,
    beginDay: String,
    endYear: String,
    endMonth: String,
    endDay: String,
    created: {
        type: Date,
        default: Date.now
    },   
    location: String 
});

module.exports = mongoose.model('Event', eventSchema);

