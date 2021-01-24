const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require("../config/auth.js")
//login page
router.get('/', (req, res) => {
    res.render('login');
})
//register page
router.get('/register', (req, res) => {
    res.render('register');
})

router.get('/dashboard',ensureAuthenticated, (req, res) => {
    res.render('dashboard', {
        user: req.user,
        title: 'Dashboard'
    });
})

module.exports = router; 