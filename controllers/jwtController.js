const jwt = require('jsonwebtoken');
const User = require('../models/user'); 

exports.authenticateJWT = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    jwt.verify(token, process.env.SECRETE_KEY, (err, authData) => {
      if (err) {
        console.error("JWT Verification Error:", err);
        return res.status(403).json({
          code: "Invalid Token!",
        });
      } else {
        req.user =  User.findById(authData.userId)
          .then(user => {
            if (!user) {
              return res.status(403).json({
                code: "User not found!",
              });
            }
            req.user = user;
            next();
          })
          .catch(error => {
            console.error("User Fetch Error:", error);
            return res.status(500).json({
              code: "Internal Server Error",
            });
          });
      }
    });
  } else {
    res.status(403).json({
      code: "Token missing!",
    });
  }
};

