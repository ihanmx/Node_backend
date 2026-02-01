const whitelist=['http://yoursite.com','http://127.0.0.1:5500','http://localhost:3500']

const corOptions={
    //allows access with no origins like mobiles apps or curl
    origin:function(origin,callback){
        if(!origin||whitelist.indexOf(origin)!==-1){ //!origin for dev

            callback(null,true) //err null
        }else{
            callback(new Error('not allowed by cors'))
        }



    }
    }
module.exports=corOptions