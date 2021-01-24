
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const AWS = require("aws-sdk");
AWS.config.getCredentials(function (err) { });
AWS.config.update({ region: "eu-west-2" });
const docClient = new AWS.DynamoDB.DocumentClient();

const { ensureValidToken } = require("../../config/api/auth.js")

router.get('/apptokens', ensureValidToken, (req, res) => {
    res.send(req.user)
})

module.exports = router;