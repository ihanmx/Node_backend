
const {logEvents}=require('./middleware/logEvents');
const EventEmiiter=require('events');
const http=require('http')
const path=require('path');
const fs=require('fs');
const { text } = require('stream/consumers');
const fsPromises=require('fs').promises

class Emiiter extends EventEmiiter{}



//initialize obj

const myEmiiter=new Emiiter();


myEmiiter.on('log',(msg,fileName)=>{

    logEvents(msg,fileName);
})
const PORT=process.env.PORT||3500




//respose stans for res 
const serveFile=async(filePath,contentType,response)=>{

    try{

        const rawData=await fsPromises.readFile(filePath,!contentType.includes('image')?'utf-8':'');//utf not accepts images
        const data=contentType==='application/json'?JSON.parse(rawData):rawData //maybe we want to add logic so we have to convert json to js then convert it back to json using stringify
        response.writeHead(filePath.includes('404.html')?404:200,{'content-type':contentType})
        response.end(contentType==='application/json'?JSON.stringify(data):data) //end send res n\body and end connction
    }catch(err){
        console.log(err)
                myEmiiter
    .emit('log',`${err.name}\t${err.message}`,'errLog.txt');
        response.statusCode=500
        response.end()


    }




}

const server=http.createServer((req,res)=>{

    console.log(req.url,req.method)
        myEmiiter
    .emit('log',`${req.url}\t${req.method}`,'reqLog.txt');

    const extension=path.extname(req.url)//reads the ext like .html that comes from the req
    let contentType;

    switch(extension){
        case '.css':
            contentType='text/css'
            break;
        case '.js':
            contentType='text/javascript'
            break;
        case '.json':
            contentType='application/json'
            break;
        case '.jpg':
            contentType='image/jpeg'
            break;
        case '.png':
            contentType='image/png'
            break;
        case '.txt':
            contentType='text/plain'
            break;

        default:
            contentType='text/html'    

    


    }


    let filepath;
    if(contentType==='text/html'&&req.url==='/'){
        filepath=path.join(__dirname,'views',"index.html") //main dir index

    }else if(contentType==='text/html'&&req.url.slice(-1)==='/')  //try to access sub dir index
       {filepath=path.join(__dirname,'views',req.url,'index.html')}
       else if(contentType==='text/html'){ //means it is path for not sub dir and not index
        filepath=path.join(__dirname,'views',req.url)


       }else{//not html
        filepath=path.join(__dirname,req.url)




       }
//add ext automatically if not written
       if(!extension&&req.url.slice(-1)!=='/'){
        filepath+='.html'
       }


       const fileExists=fs.existsSync(filepath);

       if(fileExists){
        //serve fiel

        serveFile(filepath,contentType,res)


        //old pages
       }else{

        switch(path.parse(filepath).base){
            //redirect 301
            case 'old-page.html':
                res.writeHead(301,{
                    'location':'/new-page.html'
                })
                res.end()
                break;

            case 'www-page.html':
                res.writeHead(301,{
                    'location':'/'
                })
                res.end()
                break;
            default:
                serveFile(path.join(__dirname,'views','404.html'), 'text/html', res)

            
               

            






        }


        //404


        //301 redirect

        console.log(path.parse(filepath))
       }




})

server.listen(PORT,()=>{
    console.log(`server running on ${PORT}`)
})






//add listener for the log event




