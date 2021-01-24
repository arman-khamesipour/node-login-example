const express = require('express');
const https = require('https')
const fs = require('fs')
const router = express.Router();
const app = express();
const expressEjsLayout = require('express-ejs-layouts')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const path = require('path');

require("./config/passport")(passport)

//EJS
app.set('view engine', 'ejs');
app.use(expressEjsLayout);
//BodyParser
app.use(express.urlencoded({ extended: false }));
//express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '/public')));
//use flash
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})
//Routes for website
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/', require('./routes/apptoken'));

//Routes for API
app.use('/api', require('./routes/api/login'));
app.use('/api', require('./routes/api/apptoken'));

https.createServer({
    key: fs.readFileSync('certs/localhost.key'),
    cert: fs.readFileSync('certs/localhost.crt')
}, app).listen(process.env.NODE_PORT, () => {
    console.log('Listening on ' + process.env.NODE_PORT)
  })