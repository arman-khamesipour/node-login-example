const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const AWS = require("aws-sdk");

AWS.config.getCredentials(function (err) { });
AWS.config.update({ region: "eu-west-2" });
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = function (passport) {
    let errors = [];
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            //match user
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
                    if (Object.keys(data).length < 1) {
                        return done(null,false,{message : 'Email not registered'});
                    } else {
                        bcrypt.compare(password, data.Item.password, (err, isMatch) => {
                            if (err) throw err;

                            if (isMatch) {
                                return done(null, data);
                            } else {
                                return done(null, false, { message: 'Password incorrect' });
                            }
                        })
                    }
                }
            })
        })

    )
    passport.serializeUser(function (data, done) {
        done(null, data.Item.email);
    });

    passport.deserializeUser(function (user, done) {
        const params = {
            TableName: "users",
            Key: {
                email: user,
            }
        };
        docClient.get(params, function (err, data) {
            if (err) {
                response.send(
                    "There has been an error accessing the db"
                );
            } else {
                done(null, data.Item);
            }
        })
    });
}; 