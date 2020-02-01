const express = require('express');
const router = express.Router();

const indexController = require('../controllers/indexController');
const authController = require('../controllers/authController');
const appController = require('../controllers/appController');
const listController = require('../controllers/listController');
const graphController = require('../controllers/graphController');

const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', indexController.index)

router.get('/register', authController.registerForm)
router.post('/register', 
    authController.validateRegister,
    authController.register,
    authController.login)

router.get('/login', authController.loginForm)
router.post('/login', catchErrors(authController.login));

router.get('/logout', authController.logout)

router.get('/app', appController.start)
router.get('/app/:year/:month', 
    authController.isLoggedIn,
    appController.app)

router.get('/excel/:year/:month', 
    authController.isLoggedIn,
    appController.excel)

router.get('/list/:year/:month', 
    authController.isLoggedIn, 
    listController.list)

router.get('/graph/:year/:month', 
    authController.isLoggedIn, 
    graphController.graph)

module.exports = router;
