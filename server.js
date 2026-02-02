const path=require('path')
const express=require('express')
const cors=require('cors')
const cookieParser=require('cookie-parser')
const {logEvents,logger}=require('./middleware/logEvents')
const errorHandler=require('./middleware/errorhandeler')
const rootRouter=require('./routers/root')
const employeesApi=require('./routers/api/employees')
const registerRouter=require('./routers/register')
const authRouter=require('./routers/auth')
const refreshRoute=require('./routers/refresh')
const logoutRoute=require('./routers/logout')
const verifyJWT=require('./middleware/verifyJWT')
const credentials=require('./middleware/credentials')

const corOptions=require('./config/corsOptions')

const PORT=process.env.PORT||3500
const app=express()
//custome middleware logger
app.use(logger)
//limiting access to server



app.use(credentials)

app.use(cors(corOptions)) //cross origin resource share




//middlewares any thing between req and res 

//1-built in middelwares
//this one to handle form data
app.use(express.urlencoded({extended:false}))

//this one for json 
app.use(express.json());

//middleware for cookies
app.use(cookieParser())

//static files like img and css
app.use(express.static(path.join(__dirname,'/public')))








//routes


app.use('/',rootRouter)

app.use('/register',registerRouter)

app.use('/auth',authRouter)
//should be before the verify because it issues the access tokens when it expires
app.use('/refresh',refreshRoute)
app.use('/logout',logoutRoute)

app.use(verifyJWT);//this will be applied to all routes under it
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




