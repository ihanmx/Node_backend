const User = require("../model/User");
//this controller creates new access token

const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  //we created cookie and added jwt to it
  if (!cookies?.jwt) {
    return res.sendStatus(401);
  }
  console.log(cookies.jwt);
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();

  //we stored it through auth
  if (!foundUser) return res.status(403).json({ message: "forbidden" }); //unaothorize
  //evaluate hashed pwd with entered one
  try {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || decoded.username !== foundUser.username)
          return res.sendStatus(403);
        const roles = Object.values(foundUser.roles);
        //create new access token
        const accessToken = jwt.sign(
          {
            UserInfo: { username: foundUser.username, roles: roles },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "10s" },
        );

        res.json({ accessToken });
      },
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleRefreshToken };
