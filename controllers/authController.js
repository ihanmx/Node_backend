const usersDB={
users:require('../model/users.json'),
setUsers:function(data){this.users=data}

}

const bcrypt=require('bcrypt')


const handleLogin=async(req,res)=>{


        const {user,pwd}=req.body;

    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    const foundUser=usersDB.users.find(person=>person.username===user)
    if(!foundUser) return res.status(401).json({"message":"unauthorize"})//unaothorize
    //evaluate hashed pwd with entered one
    try{
    const match=await bcrypt.compare(pwd,foundUser.password)
    if(match){
        //were to create JWTs
        
        
        res.json({"success":`User ${user} is logged in !!`})}
    else{return res.status(401)

    }

}catch (err) {
        res.status(500).json({ 'message': err.message });
    }





}

module.exports={handleLogin}