const usersDB={
users:require('../model/users.json'),
setUsers:function(data){this.users=data}

}

//this controller creates new access token 

const jwt=require('jsonwebtoken')
require('dotenv').config();

const handleRefreshToken=async(req,res)=>{
    const cookies=req.cookies
    //we created cookie and added jwt to it
    if(!cookies?.jwt){return res.sendStatus(401)}
    console.log(cookies.jwt)
    const refreshToken=cookies.jwt;



    const foundUser=usersDB.users.find(person=>person.refreshToken===refreshToken)//we stored it through auth
    if(!foundUser) return res.status(403).json({"message":"forbidden"})//unaothorize
    //evaluate hashed pwd with entered one
    try{
        jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,decoded)=>{
            if(err||decoded.username!== foundUser.username) return res.sendStatus(403);
            const accessToken=jwt.sign({
                "username":decoded.username
            },process.env.ACCESS_TOKEN_SECRET,{expiresIn:'30s'})

            res.json({accessToken})



        })
   


}catch (err) {
        res.status(500).json({ 'message': err.message });
    }





}

module.exports={handleRefreshToken}