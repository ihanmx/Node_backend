const User = require("../model/User");

const { json } = require("stream/consumers");

const handleLogout = async (req, res) => {
  //on client also delete the access token

  const cookies = req.cookies;
  //we created cookie and added jwt to it
  if (!cookies?.jwt) {
    return res.sendStatus(204);
  } //no content

  const refreshToken = cookies.jwt;

  //check if refresh token in DB
  const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();
  //if no found user
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(201);
  }
  //Delete refreshToken indb

  foundUser.refreshToken = "";
  const result = await foundUser.save();
  console.log(result);
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  return res.sendStatus(201);
};

module.exports = { handleLogout };
