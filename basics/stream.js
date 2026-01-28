const fs=require('fs');
const path=require('path');


//for large data we use streams

const readS=fs.createReadStream(path.join(__dirname,'files','large.txt'),'utf-8');
const writeS=fs.createWriteStream(path.join(__dirname,'files','largeW.txt'))

readS.on('data',(chunk)=>{
    writeS.write(chunk)


})

//pipe method is faster and easier
readS.pipe(writeS)