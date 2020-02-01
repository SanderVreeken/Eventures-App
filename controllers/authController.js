const promisify = require('es6-promisify');
const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.loginForm = (req, res) => {
    res.render('login');
};

exports.registerForm = (req, res) => {
    res.render('register');
};

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply a name.').notEmpty();
    req.sanitizeBody('email').normalizeEmail({
        remove_exntension: false,
    });
    req.checkBody('email', 'The email address is not valid.').isEmail();
    req.checkBody('password', 'Password cannot be blank.').notEmpty();
    req.checkBody('password-confirm', 'Confirmed password cannot be blank.').notEmpty();
    req.checkBody('password-confirm', 'The password entered do not match.').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.render('register', { body: req.body } )
        return;
    }
    next();
}

exports.register = async (req, res, next) => {
    const user = User( { email: req.body.email, name: req.body.name } );
    const register = promisify(User.register, User);
    await register(user, req.body.password);
    next();
}

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/app'
})

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'YOU ARE NOW LOGGED OUT! 👋');

    res.redirect('/login');
}

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
        return;
    }
    res.redirect('/login');
}