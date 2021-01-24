const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const AWS = require("aws-sdk");
AWS.config.getCredentials(function (err) { });
AWS.config.update({ region: "eu-west-2" });
const docClient = new AWS.DynamoDB.DocumentClient();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.post('/login', (req, res) => {
    const email = req.body.email;
    const appToken = req.body.token;

    const params = {
        TableName: "users",
        Key: {
            email: email,
        }
    };
    docClient.get(params, async function (err, data) {
        if (err) {
            res.send("There has been an error accessing the db");

        } else {
            if (Object.keys(data).length < 1) {
                res.send({ error: 'Email not registered' });
            } else if (Object.keys(data.Item.tokens) < 1) {
                res.send({ error: 'There are no tokens registered on this account' });
            } else {
                const tokenComparepromiseArray = [];
                let authenticatedTokenName;
                for (const tokenName of Object.keys(data.Item.tokens)) {
                    tokenComparepromiseArray.push(new Promise((resolve, reject) => {
                        bcrypt.compare(appToken, data.Item.tokens[tokenName], (err, isMatch) => {
                            if (err) throw err;
    
                            if (isMatch) {
                                match = true;
                                authenticatedTokenName = tokenName;
                                resolve(match);
                            } else {
                                match = false;
                                resolve(match)
                            }
                        })
                    }))
                }
                await Promise.all(tokenComparepromiseArray).then((tokenCompareResult) => {
                    if(tokenCompareResult.includes(true)) {
                        const token = jwt.sign({
                            sub: email,
                            exp: Math.floor(Date.now() / 1000) + (60 * 60),
                            app: authenticatedTokenName
                          }, process.env.JWT_TOKEN_SECRET);
                          res.send({ JWT: token });
                    } else {
                        res.status(401);
                        res.send({ error: 'Unauthorized' });
                    }
                })
            }
        }
    })
})
module.exports = router;