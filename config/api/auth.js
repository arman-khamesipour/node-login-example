const jwt = require('jsonwebtoken');

module.exports = {
    ensureValidToken: function (req, res, next) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401) // if there isn't any token
      
        jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err, user) => {
          if (err) {
            console.log(err)
            return res.sendStatus(403)
          }
          req.user = user
          return next() // pass the execution off to whatever request the client intended
        })
    }
}