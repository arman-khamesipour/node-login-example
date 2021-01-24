const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
// AWS setup
const AWS = require("aws-sdk");

AWS.config.getCredentials(function (err) { });
AWS.config.update({ region: "eu-west-2" });
const ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const docClient = new AWS.DynamoDB.DocumentClient();
//login handle
router.get('/login', (req, res) => {
    res.render('login');
})
router.get('/register', (req, res) => {
    res.render('register')
})
//Register handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    if (!name || !email || !password || !password2) {
        errors.push({ msg: "Please fill in all fields" })
    }
    //check if match
    if (password !== password2) {
        errors.push({ msg: "Passwords do not match" });
    }

    //check if password is more than 6 characters
    if (password.length < 6) {
        errors.push({ msg: 'Password needs to be at least 6 characters' })
    }
    if (errors.length > 0) {
        res.render('register', {
            errors: errors,
            name: name,
            email: email,
            password: password,
            password2: password2
        })
    } else {
        const params = {
            TableName: "users",
            Key: {
                email: email,
            }
        };
        docClient.get(params, function (err, data) {
            if (err) {
                response.send(
                    "There has been an error accessing the db"
                );
            } else {
                if (Object.keys(data).length > 0) {
                    errors.push({ msg: 'Email already registered' });
                    res.render('register',{errors,name,email,password,password2});
                } else {
                    const newUser = {
                        email: email,
                        name: name,
                        password: password
                    }
                    //hash password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt,
                            (err, hash) => {
                                if (err) throw err;
                                const newUserQuery = {
                                    TableName: "users",
                                    Item: {
                                        email: { S: email },
                                        name: { S: name },
                                        password: { S: hash },
                                        tokens: {M : {}}
                                    }
                                };
                                //save user
                                ddb.putItem(newUserQuery, function (err, data) {
                                    if (err) {
                                        console.log("Error", err);
                                    } else {
                                        console.log("Success", data);
                                        req.flash('success_msg', 'Registration successful');
                                        res.redirect('/');
                                    }
                                });
                            }));
                }
            }
        });
    }
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
        failureFlash: true,
    })(req, res, next);
})

//logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Logged out');
    res.redirect('/');
})
module.exports = router;