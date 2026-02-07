const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles) return res.sendStatus(401); //unauthorized if no roles or req
    const rolesArray = [...allowedRoles];
    console.log(rolesArray);
    console.log(req.roles);

    const result = req.roles
      .map((role) => rolesArray.includes(role))
      .find((val) => val === true);
    if (!result) return res.sendStatus(403); //forbidden if no matching role
    next();
  }; //this is middleware it have to be in this format
};

module.exports = verifyRoles;
