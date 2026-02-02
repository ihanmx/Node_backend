const allowedOrigins=require('./allowedOrigins')
const corOptions={
    //allows access with no origins like mobiles apps or curl
    origin:function(origin,callback){
        if(!origin||allowedOrigins.indexOf(origin)!==-1){ //!origin for dev

            callback(null,true) //err null
        }else{
            callback(new Error('not allowed by cors'))
        }



    }
    }
module.exports=corOptions