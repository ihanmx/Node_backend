const User = require("../model/User");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;

  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  const foundUser = await User.findOne({ username: user }).exec();
  if (!foundUser) return res.status(401).json({ message: "unauthorize" }); //unaothorize
  //evaluate hashed pwd with entered one
  try {
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
      //roles === [2001, 5150];
      // ✔ You get an array of role codes
      const roles = Object.values(foundUser.roles).filter(Boolean); //to hide the role names and get only values no null
      //were to create JWTs
      //dont pass password or secure data because it is availabe
      // Access tokens are short-lived, used for accessing protected resources.

      // Refresh tokens are long-lived, stored in cookies, and only used at the /refresh endpoint to issue new access tokens.

      //short
      const accessToken = jwt.sign(
        { UserInfo: { username: foundUser.username, roles: roles } }, //no need tto send the role in refresh token

        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10s" },
      );

      //long

      const refreshToken = jwt.sign(
        { username: foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" },
      );

      //store the refresh token in DB for logout
      //Refresh token stored server-side

      foundUser.refreshToken = refreshToken;
      const result = await foundUser.save();
      console.log(result);

      res.cookie("jwt", refreshToken, {
        httpOnly: true, //accessible only by web server
        sameSite: "None",
        secure: true, //  in production secure for https only
        maxAge: 24 * 60 * 60 * 1000,
      });

      //in production secure for https only
      // Whether cookies are sent across sites.

      // res.cookie('jwt', refreshToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === 'production',
      //   sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      //   maxAge: 24 * 60 * 60 * 1000
      // });
      //make sure not to save in memory to not be accessed by js so use cookie
      //you have to spicify http only so it is more secure and not available to js
      return res.json({ accessToken, roles }); //for protecting routes
    } else {
      return res.status(401).json({ message: "Password incorrect" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleLogin };
