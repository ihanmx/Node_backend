const User = require("../model/User");

const path = require("path");
const fsPromises = require("fs").promises;
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  //async for bcrybt

  const { user, pwd } = req.body;

  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  //check if duplicated name
  const duplicate = await User.findOne({ username: user }).exec();

  if (duplicate) return res.sendStatus(409); //Conflict

  try {
    //hashing pwd
    const hashedPwd = await bcrypt.hash(pwd, 10); //10 is the salt rounds (cost factor). 10 round of hashing
    //store the new user
    const result = await User.create({
      username: user,
      password: hashedPwd,
    }); //default role        //    roles: {"User":2001 added automatically
    console.log(result);
    res.status(201).json({ success: `New user ${user} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
