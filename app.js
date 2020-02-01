const express = require('express');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
require('dotenv').config();

const app = express();

const routes = require('./routes/index');
require('./handlers/passport');

app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'pug'); 

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressValidator());

app.use(session({ secret: 'anything' }));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes);

module.exports = app;