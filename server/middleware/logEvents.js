// event emmit:is a module that allows you to call function when spicific event happens


const {format}=require('date-fns')
const {v4:uuidv4}=require('uuid')
const fs=require('fs')
const fsPromises=require('fs').promises
const path=require('path')

const logEvents=async(message,logName)=>{

    const dateTime=`${format(new Date(),'yyyyMMdd\tHH:mm:ss')}`;
    const logDateTime=`${dateTime}\t${uuidv4()}\t${message}\n`;

    console.log(logDateTime);
    try{
        if(!fs.existsSync(path.join(__dirname,'..','logs'))){

         await fsPromises.mkdir(path.join(__dirname,'..','logs'),(err)=>{
                if(err) throw err;
                console.log('logs folder created');
            })
        }

        await fsPromises.appendFile(path.join(__dirname,'..','logs',logName),logDateTime);

    }catch(err){
        console.log(err);
    }




}

const logger=(req,res,next)=>{
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`,"reqLog.txt")
    console.log(`${req.method} ${req.path}`)
    next()//must call next because it is custom
}

module.exports={logEvents,logger}