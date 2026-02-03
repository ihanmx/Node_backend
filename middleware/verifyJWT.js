const jwt = require("jsonwebtoken");
require("dotenv").config();

//this middleware protects routes
const verifyJWT = (req, res, next) => {
  //read the req headers expected Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
  const authHeader = req.headers.authorization || req.headers.Authorization; //some clients use lowercase some uppercase
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401); //if no header or Bearer it rejects
  console.log(authHeader); //bearer token
  const token = authHeader.split(" ")[1]; //extract token from object split(' ') → ["Bearer", "<token>"]
  //compares the token id matches with access token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.sendStatus(403); //invalid token forbidden
    }
    req.user = decoded.UserInfo.username; //we sent it with jwt so we take it from it and attacked it to user req
    req.roles = decoded.UserInfo.roles;
    // const accessToken=jwt.sign(
    //     {"username":foundUser.username},
    //     process.env.ACCESS_TOKEN_SECRET,
    //     {expiresIn:'30s'});

    //this step intreduce the user without hitting DB each time

    next();
  });
};

module.exports = verifyJWT;
