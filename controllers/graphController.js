const mongoose = require('mongoose');

const Event = require('../models/Event')
const constants = require('../constants');

const today = new Date();

// mongoose.connect(process.env._MONGODB_BASE_URL, { useNewUrlParser: true } );

exports.graph = async (req, res) => {

    const requestYear = Number(req.params.year);
    const requestMonth = Number(req.params.month);

    const todaysDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const events = await Event.find( { beginYear: requestYear, beginMonth: constants._MONTHS_ABBREVIATED[requestMonth - 1], created: {$gte: todaysDate} } );

    events.sort(function (a, b){
        return a.beginDay-b.beginDay
    })

    res.render('graph', { pageName: 'graph', headerTitles: ['app', 'list'], requestYear, requestMonth, monthsAbbreviated: constants._MONTHS_ABBREVIATED } );
};