const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

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
  const duplicate = usersDB.users.find((person) => person.username === user);

  if (duplicate) return res.sendStatus(409); //Conflict

  try {
    //hashing pwd
    const hashedPwd = await bcrypt.hash(pwd, 10); //10 is the salt rounds (cost factor). 10 round of hashing
    //store the new user
    const newUser = {
      username: user,
      password: hashedPwd,
      roles: { User: 2001 },
    }; //default role
    usersDB.setUsers([...usersDB.users, newUser]);
    //write the fs
    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(usersDB.users),
    );

    console.log(usersDB.users);
    res.status(201).json({ success: `New user ${user} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
