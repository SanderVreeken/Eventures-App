const express = require('express');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const passport = require('passport');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const routes = require('./routes/index');
require('./handlers/passport');
require('dotenv').config();

const app = express();

app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'pug'); 

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressValidator());
app.use(cookieParser());

app.use(session({
    secret: process.env._SECRET,
    key: process.env._KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(session({ secret: 'anything' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.flashes = req.flash();
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes);

module.exports = app;