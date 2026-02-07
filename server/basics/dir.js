//creating dir using fs

const fs=require('fs');
const path=require('path');

if(!fs.existsSync(path.join(__dirname,'newDir'))){
    fs.mkdir(path.join(__dirname,'newDir'),(err)=>{
        if(err) throw err;
        console.log('folder created');
    }
    )



}

//remove existed dir using fs

if(fs.existsSync(path.join(__dirname,'newDir'))){
    fs.rmdir(path.join(__dirname,'newDir'),(err)=>{
        if(err) throw err;
        console.log('folder removed');
    }
    )



}
