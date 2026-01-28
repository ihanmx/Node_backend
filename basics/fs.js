const fs=require('fs');
const path=require('path');
const fsPromises=require('fs').promises;

//read
fs.readFile('./files/starter.txt',(err,data)=>{
    if(err) throw err;
    console.log(data);
    // <Buffer 48 69 20 74 68 65 72 65>
    console.log(data.toString());
    //Hi there

})

fs.readFile('./files/starter.txt','utf-8',(err,data)=>{
    if(err) throw err;
    console.log(data);
     //Hi there

 

})


fs.readFile(path.join(__dirname,'files','starter.txt'),'utf-8',(err,data)=>{
    if(err) throw err;
    console.log(data);
     //Hi there

 

})

//write
fs.writeFile(path.join(__dirname,'files','reply.txt'),'Vice to meet you',(err)=>{
    if(err) throw err;
    console.log('write complete');
     //Hi there

 

})


//append
fs.appendFile(path.join(__dirname,'files','reply.txt'),'\nYes it is.',(err)=>{
    if(err) throw err;
    console.log('append complete on existed file');
     
})


fs.appendFile(path.join(__dirname,'files','test.txt'),'test.',(err)=>{
    if(err) throw err;
    console.log('append complete on not existed file');
  
})


//better approach to append

fs.writeFile(path.join(__dirname,'files','reply.txt'),'Vice to meet you',(err)=>{
    if(err) throw err;
    console.log('write complete');


    fs.appendFile(path.join(__dirname,'files','reply.txt'),'\nYes it is.',(err)=>{
    if(err) throw err;
    console.log('append complete on existed file');
    //rename
fs.rename(path.join(__dirname,'files','test.txt'),path.join(__dirname,'files','renamedTest.txt'),(err)=>{
    if(err) throw err;
    console.log('rename complete'); 
})


     
})

 

})



////async await approach

const fileOps=async()=>{
try{
    const data=await fsPromises.readFile(path.join(__dirname,'files','starter.txt'),'utf-8');
    console.log(data);
    await fsPromises.writeFile(path.join(__dirname,'files','promiseWrite.txt'),data);
    await fsPromises.appendFile(path.join(__dirname,'files','promiseWrite.txt'),'\n\nNice to meet you.');
    await fsPromises.rename(path.join(__dirname,'files','promiseWrite.txt'),path.join(__dirname,'files','promiseComplete.txt'));
    const newData=await fsPromises.readFile(path.join(__dirname,'files','promiseComplete.txt'),'utf-8');
console.log(newData);




}catch(err){
    console.error
    (`There was an error: ${err}`);
}





}


//exit when error

process.on('uncaughtException',(err)=>{
    console.error(`There was an uncaught error: ${err}`);
    process.exit(1)
})