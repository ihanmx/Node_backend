const usersDB={
users:require('../model/users.json'),
setUsers:function(data){this.users=data}

}

const fsPromises=require('fs').promises
const path=require('path')
const { json } = require('stream/consumers')

const handleLogout=async(req,res)=>{

    //on client also delete the access token 

    const cookies=req.cookies
    //we created cookie and added jwt to it
    if(!cookies?.jwt){return res.sendStatus(204)}//no content

    const refreshToken = cookies.jwt

    //check if refresh token in DB
        const foundUser=usersDB.users.find(person=>person.refreshToken===refreshToken)
        //if no found user 
    if(!foundUser){
        res.clearCookie('jwt',{httpOnly:true,sameSite:'None',secure:true})
        return res.sendStatus(201)



    }
    //Delete refreshToken indb 

    const otherUsers=usersDB.users.filter(person=>{person.refreshToken!==foundUser.refreshToken})
    const currentUser={...foundUser,refreshToken:''}
    usersDB.setUsers([...otherUsers,currentUser])
    try{
        await fsPromises.writeFile(path.join(__dirname,'..','model','users.json'),JSON.stringify(usersDB.users))
                res.clearCookie('jwt',{httpOnly:true,sameSite:'None',secure:true})
                 return res.sendStatus(201)






    }catch(err){
        console.log(err)
    }







}

module.exports={handleLogout}