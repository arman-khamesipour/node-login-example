const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const AWS = require("aws-sdk");
AWS.config.getCredentials(function (err) { });
AWS.config.update({ region: "eu-west-2" });
const docClient = new AWS.DynamoDB.DocumentClient();

const { ensureAuthenticated } = require("../config/auth.js")


router.get('/dashboard/apptoken', ensureAuthenticated, (req, res) => {
    const params = {
        TableName: "users",
        Key: {
            email: req.user.email,
        }
    };
    docClient.get(params, function (err, data) {
        if (err) {
            console.log("There has been an error accessing the db");
            res.sendStatus(500);
            res.send('oops');
        } else {
            if (Object.keys(data).length < 1) {
                res.send({ error: 'Email not registered' });
            } else {
                res.render('apptoken/apptoken', {
                    user: req.user,
                    title: 'App Token',
                    tokens: data.Item.tokens
                });
            }
        }
    });
})

router.get('/dashboard/apptoken/new', ensureAuthenticated, (req, res) => {
    res.render('apptoken/generator', {
        user: req.user,
        title: 'App Token'
    })
});

router.post('/dashboard/apptoken/new', ensureAuthenticated, (req, res) => {
    const tokenName = req.body.tokenName;
    const tokenValue = uuidv4();
    let errors = [];
    bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(tokenValue, salt,
            (err, hash) => {
                if (err) throw err;
                const params = {
                    TableName: "users",
                    Key: {
                        "email": req.user.email,
                    },
                    UpdateExpression: "SET #tokens.#tokenName = :attrValue",
                    ConditionExpression: 'attribute_not_exists(#tokens.#tokenName)',
                    ExpressionAttributeNames: {
                        "#tokens": "tokens",
                        "#tokenName": tokenName
                    },
                    ExpressionAttributeValues: {
                        ":attrValue": hash
                    },
                    ReturnValues: "NONE"
                };
                //save encrypted app token
                docClient.update(params, function (err, data) {
                    if (err) {
                        console.log("Error", err);
                        errors.push({ msg: 'App Token with that name already exists' });
                        res.render('apptoken/generator', {
                            errors,
                            tokenName,
                            user: req.user,
                            title: 'App Token'
                        });
                    } else {
                        console.log("App Token created successfully", data);
                        req.flash('success_msg', 'App Token created successfully');
                        res.render('apptoken/generated', {
                            user: req.user,
                            title: 'App Token',
                            tokenValue: tokenValue
                        });
                    }
                });
            }
        )
    )
});

router.post('/dashboard/apptoken/delete/:tokenName', ensureAuthenticated, (req, res) => {
    const tokenName = req.params.tokenName;
    const params = {
        TableName: "users",
        Key: {
            "email": req.user.email,
        },
        UpdateExpression: "REMOVE #tokens.#tokenName",
        ExpressionAttributeNames: {
            "#tokens": "tokens",
            "#tokenName": tokenName
        },
        ReturnValues: "NONE"
    };
    docClient.update(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("App Token deleted successfully", data);
            req.flash('success_msg', 'App Token deleted successfully');
            res.redirect('/dashboard/apptoken');
        }
    });
});

router.post('/dashboard/apptoken/reset/:tokenName', ensureAuthenticated, (req, res) => {
    const tokenName = req.params.tokenName;
    const tokenValue = uuidv4();
    bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(tokenValue, salt,
            (err, hash) => {
                if (err) throw err;
                const params = {
                    TableName: "users",
                    Key: {
                        "email": req.user.email,
                    },
                    UpdateExpression: "SET #tokens.#tokenName = :attrValue",
                    ExpressionAttributeNames: {
                        "#tokens": "tokens",
                        "#tokenName": tokenName
                    },
                    ExpressionAttributeValues: {
                        ":attrValue": hash
                    },
                    ReturnValues: "NONE"
                };
                docClient.update(params, function (err, data) {
                    if (err) {
                        console.log("Error", err);
                    } else {
                        console.log("App Token reset successfully", data);
                        req.flash('success_msg', 'App Token reset successfully');
                        res.render('apptoken/generated', {
                            user: req.user,
                            title: 'App Token',
                            tokenValue: tokenValue
                        });
                    }
                });
            }
        )
    )
});

module.exports = router;