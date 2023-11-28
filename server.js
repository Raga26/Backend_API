const express = require('express') 
const dotenv = require('dotenv')
const morgan = require('morgan')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')
const cookieParser = require('cookie-parser')

/*

Express is set up in server.js to listen for incoming requests.
app.use('/api/v1/bootcamps' , bootcamps) 
tells Express to use the routes defined in the bootcamps module for requests starting with /api/v1/bootcamps.

require()     ->   js concept used in nodejs
app.use()     ->   express.js method
morgan        ->   middleware for logging
dotenv        ->   nodejs module for loading env files
process.on()  ->   js concept for adding EL to handle unhandle promise rejection , part of nodejs runtime

 */

//load env variables
dotenv.config({ path: './config/config.env'})

connectDB()

//route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/users')
const reviews = require('./routes/reviews')

const app = express()

//body parser
app.use(express.json())

//cookie parser
app.use(cookieParser())

//dev logging middleware
if(process.env.NODE_ENV === 'development')
{
    app.use(morgan('dev'))
}


//testing 
/* 
app.get('/api/v1/dataset' , (req , res) => {
    res.status(200).json({success : true , msg :"show"})
}) */

//for any request starts with this , then go to ., 
app.use('/api/v1/bootcamps' , bootcamps)
app.use('/api/v1/courses' , courses)
app.use('/api/v1/auth' , auth)
app.use('/api/v1/users' , users)
app.use('/api/v1/reviews', reviews)

const PORT = process.env.PORT || 8080

const server = app.listen(
    PORT , 
    console.log('server running ')

)

process.on('unhandledRejection' , (err ,Promise) => {

    console.log(`Error: ${err.message}`)
    server.close(() => process.exit(1))
})