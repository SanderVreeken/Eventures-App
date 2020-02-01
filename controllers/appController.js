const mongoose = require('mongoose');
const excelNode = require('excel4node')
const promisify = require('es6-promisify');

const Event = require('../models/Event')
const constants = require('../constants');

const today = new Date();
const todaysDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

mongoose.connect(process.env._MONGODB_BASE_URL, { useNewUrlParser: true } );

exports.start = (req, res) => {

    // Redirect to the actual app page whereby month one is January.
    res.redirect(`/app/${today.getFullYear()}/${today.getMonth() + 1}`)
};

exports.app = async (req, res) => {

    const requestYear = Number(req.params.year);
    const requestMonth = Number(req.params.month);

    const numberOfDaysMonth = getDaysInMonth(requestYear, requestMonth);
    const numberOfDaysMonthBefore = getDaysInMonthBefore(requestYear, requestMonth);
    const firstWeekday = getFirstWeekday(requestYear, requestMonth, 1);

    const holidays = await Event.find( { beginYear: requestYear, beginMonth: constants._MONTHS_ABBREVIATED[requestMonth - 1], created: { $gte: todaysDate }, location: "Public-Holidays-NL" });
    const preparedHolidays = prepareEvents(numberOfDaysMonth, holidays);
    const events = await Event.find( { beginYear: requestYear, beginMonth: constants._MONTHS_ABBREVIATED[requestMonth - 1], created: { $gte: todaysDate }, location: { $ne: "Public-Holidays-NL" } });
    // created: {$gte: todaysDate}
    const preparedEvents = prepareEvents(numberOfDaysMonth, events);

    res.render('app', { pageName: 'app', headerTitles: ['app', 'list'], preparedHolidays, preparedEvents, user: req.user, monthsAbbreviated: constants._MONTHS_ABBREVIATED, weekDays: constants._WEEKDAYS, today, requestYear, requestMonth, numberOfDaysMonth, numberOfDaysMonthBefore, firstWeekday, monthsEnglish: constants._MONTHS_ENGLISH } );
};

exports.excel = async (req, res) => {

    const requestYear = Number(req.params.year);
    const requestMonth = Number(req.params.month);
    const user = req.user;

    const events = await Event.find( { beginYear: requestYear, beginMonth: constants._MONTHS_ABBREVIATED[requestMonth - 1], created: {$gte: todaysDate} } );
    events.sort(function (a, b){
        return a.beginDay-b.beginDay
    })

    createExcel(requestYear, requestMonth, user, events, res, constants._MONTHS_ENGLISH);
}

var getDaysInMonth = function(year, month) {

    return new Date(year, month, 0).getDate();
};

var getDaysInMonthBefore = function(year, month) {

    var yearNumber = year;
    var monthNumber = month - 1

    if(monthNumber == 0) {
        yearNumber--
        monthNumber = 12
    }

    return new Date(yearNumber, monthNumber, 0).getDate();
};

// Function in order to find out what weekday is the first day of the month, whereby an integer is returned and Sundayx equals zero.
var getFirstWeekday = function(year, month, day) {

    return new Date(year, month - 1, day).getDay();
}

var prepareEvents = function(numberOfDaysMonth, events) {

    let data = [];
    for (a = 1; a <= numberOfDaysMonth; a++) {
        var eventDictionary = { title: [], beginYear: [], beginMonth: [], beginDay: [], endYear: [], endMonth: [], endDay: [], created: [], location: [] };
        data.push(eventDictionary)
    }

    for (b = 0; b < events.length; b++) {
        if(events[b].beginYear == events[b].endYear && events[b].beginMonth == events[b].endMonth && events[b].beginDay == events[b].endDay) {
            data[events[b].beginDay - 1].title.push(events[b].title);
            data[events[b].beginDay - 1].beginYear.push(events[b].beginYear);
            data[events[b].beginDay - 1].beginMonth.push(events[b].beginMonth);
            data[events[b].beginDay - 1].beginDay.push(events[b].beginDay);
            data[events[b].beginDay - 1].endYear.push(events[b].endYear);
            data[events[b].beginDay - 1].endMonth.push(events[b].endMonth);
            data[events[b].beginDay - 1].endDay.push(events[b].endDay);
            data[events[b].beginDay - 1].created.push(events[b].created);
            data[events[b].beginDay - 1].location.push(events[b].location);
        }
    }

    return data
}

var createExcel = async function(requestYear, requestMonth, user, events, res) {

    var wb = new excelNode.Workbook(); 
    var ws = wb.addWorksheet('Events');

    var headerStyle = wb.createStyle({
        fill: {
            type: 'pattern', 
            patternType: 'solid',
            fgColor: '0A5EA0', 
        },
        font: {
            name: 'Arial',
            color: '#FFFFFF',
            size: 14
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
            vertical: 'center'
        },
    })

    var subheaderStyle = wb.createStyle({
        fill: {
            type: 'pattern', 
            patternType: 'solid',
            fgColor: 'EDEDEF', 
        },
        font: {
            name: 'Arial',
            color: '#000000',
            size: 11
        },
        alignment: {
            wrapText: true,
            vertical: 'center',
        },
    })

    var headerLabelStyle = wb.createStyle({
        fill: {
            type: 'pattern', 
            patternType: 'solid',
            fgColor: 'EDEDEF', 
        },
        font: {
            name: 'Arial',
            color: '#000000',
            size: 11
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
            vertical: 'center'
        },
    })

    var bodyStyle = wb.createStyle({
        font: {
            name: 'Arial',
            color: '#000000',
            size: 11
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
            vertical: 'center'
        },
    })
    
    ws.row(1).setHeight(56);
    for (a = 1; a <= 8; a++) {
        ws.column(a).setWidth(20);
        ws.cell(1, a)
            .style(headerStyle);
    }
    ws.cell(1, 4, 1, 5, true).string("Eventures Events").style(headerStyle);

    for (b = 2; b <= 6; b++) {
        for (c = 1; c <= 8; c++) {
            ws.cell(b, c)
                .style(subheaderStyle);
        }
    }
    ws.cell(3, 2, 3, 7, true).string(`Report of Events for ${constants._MONTHS_ENGLISH[requestMonth - 1].charAt(0).toUpperCase() + constants._MONTHS_ENGLISH[requestMonth - 1].substring(1)} of ${requestYear}, including all venues.`).style(subheaderStyle);
    ws.cell(4, 2, 4, 7, true).string(`Report created by ${user.name}, ${new Date}.`).style(subheaderStyle);

    ws.row(6).setHeight(42);

    ws.cell(6, 1)
        .string('Day')
        .style(headerLabelStyle);

    ws.cell(6, 2)
        .string('Date')
        .style(headerLabelStyle);

    ws.cell(6, 3, 6, 5, true).string(`Event`).style(headerLabelStyle);
    ws.cell(6, 6, 6, 7, true).string(`Location`).style(headerLabelStyle);

    for (d = 0; d < events.length; d++) {

        // TODO: Enter date formats without a time notation.
        ws.cell(7 + d, 2)
            .date(new Date(`${constants._MONTHS_ENGLISH[requestMonth - 1].charAt(0).toUpperCase() + constants._MONTHS_ENGLISH[requestMonth - 1].substring(1)} ${events[d].beginDay}, ${requestYear} 12:00:00`))
            .style({
                font: {
                    name: 'Arial',
                    color: '#000000',
                    size: 11
                },
                alignment: {
                    wrapText: true,
                    horizontal: 'center',
                    vertical: 'center'
                },
                numberFormat: 'dd mmmm yyyy',
            });
       
        ws.cell(7 + d, 1)
            .string(constants._WEEKDAYS[new Date(`${constants._MONTHS_ENGLISH[requestMonth - 1].charAt(0).toUpperCase() + constants._MONTHS_ENGLISH[requestMonth - 1].substring(1)} ${events[d].beginDay}, ${requestYear} 12:00:00`).getDay()])
            .style(bodyStyle);

        ws.cell(7 + d, 3, 7 + d, 5, true).string(events[d].title).style(bodyStyle);
        ws.cell(7 + d, 6, 7 + d, 7, true).string(events[d].location).style(bodyStyle);
    }
    
    const write = promisify(wb.write, wb);
    await write(`Eventures-Data-Report-${constants._MONTHS_ENGLISH[requestMonth - 1].charAt(0).toUpperCase() + constants._MONTHS_ENGLISH[requestMonth - 1].substring(1)}-${requestYear}.xlsx`);

    res.download(`Eventures-Data-Report-${constants._MONTHS_ENGLISH[requestMonth - 1].charAt(0).toUpperCase() + constants._MONTHS_ENGLISH[requestMonth - 1].substring(1)}-${requestYear}.xlsx`);
}
