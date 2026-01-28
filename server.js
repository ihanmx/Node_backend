const path=require('path')

const PORT=process.env.PORT||3500
const app=express()




// app.get('/',(req,res)=>{

// // res.sendFile('./views/index.html',{root:__dirname})
// res.sendFile(path.join(__dirname,'views','index.html'))

// })

app.get('^/$|index(.html)?',(req,res)=>{ //^begin  $end | or()? obtional regex

// res.sendFile('./views/index.html',{root:__dirname})
res.sendFile(path.join(__dirname,'views','index.html'))

})




app.get('/new-page(.html)?',(req,res)=>{ 


res.sendFile(path.join(__dirname,'views','new-page.html'))

})


app.get('/old-page(.html)?',(req,res)=>{ 


res.redirect(301,'/new-page.html')//302 by default

})

//handeller chaining

app.get('/hello(.html)',(req,res,next)=>{
    console.log('attempted to call hello')
    next()



},(req,res)=>{

    res.send("hello world")
})

//better way for chaining 

const one=(req,res,next)=>{
    console.log('one')
    next()


}

const two=(req,res,next)=>{
    console.log('two')
    next()


}


const three=(req,res,next)=>{
    console.log('three')
    res.send('finished')


}

app.get('/chain(.html)?',[one,two,three])



app.get('/*',(req,res)=>{ //* mean any thing

    res.status(404).sendFile(path.join(__dirname,'views','404.html'))



})





app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`) 




})

