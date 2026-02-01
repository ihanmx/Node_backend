const path=require('path')
const express=require('express')
const cors=require('cors')
const {logEvents,logger}=require('./middleware/logEvents')
const errorHandler=require('./middleware/errorhandeler')
const rootRouter=require('./routers/root')
const employeesApi=require('./routers/api/employees')
const corOptions=require('./config/corsOptions')

const PORT=process.env.PORT||3500
const app=express()
//custome middleware logger
app.use(logger)
//limiting access to server





app.use(cors(corOptions)) //cross origin resource share




//middlewares any thing between req and res 

//1-built in middelwares
//this one to handle form data
app.use(express.urlencoded({extended:false}))

//this one for json 
app.use(express.json());

//static files like img and css
app.use(express.static(path.join(__dirname,'/public')))








//routes


app.use('/',rootRouter)
app.use('/employees',employeesApi)


app.use((req, res) => { //accepts all err +send the res pased on clien
res.status(404);


if (req.accepts('html')) {
res.sendFile(path.join(__dirname, 'views', '404.html'));
} else if (req.accepts('json')) {
res.json({ error: 'Not Found' });
} else {
res.type('txt').send('404 Not Found');
}
});


app.use(errorHandler)


app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`) 




})




//handeller chaining

// app.get(['/hello', '/hello.html'],(req,res,next)=>{
//     console.log('attempted to call hello')
//     next()



// },(req,res)=>{

//     res.send("hello world")
// })

// //better way for chaining 

// const one=(req,res,next)=>{
//     console.log('one')
//     next()


// }

// const two=(req,res,next)=>{
//     console.log('two')
//     next()


// }


// const three=(req,res,next)=>{
//     console.log('three')
//     res.send('finished')


// }

// app.get(['/chain', '/chain.html'],[one,two,three])



// app.get('/*',(req,res)=>{ //* mean any thing

//     res.status(404).sendFile(path.join(__dirname,'views','404.html'))



// })
// app.get('/',(req,res)=>{

// // res.sendFile('./views/index.html',{root:__dirname})
// res.sendFile(path.join(__dirname,'views','index.html'))

// })

// app.get('^/$|index(.html)?',(req,res)=>{ //^begin  $end | or()? obtional regex

// // res.sendFile('./views/index.html',{root:__dirname})
// res.sendFile(path.join(__dirname,'views','index.html'))

// })
