const express = require( 'express' )  ;

const dotenv = require( 'dotenv' )  ;

dotenv.config()  ;

const cors = require( 'cors' )  ;

const PORT = process.env.PORT || 6000  ;

const { connection } = require( './configs/db' )  ;

const { userRouter } = require( './routes/userRoutes' )  ;



const app = express()  ;


app.use( express.json() )  ;

app.use( cors() )  ;


app.get( '/' , ( req , res ) => {

    res.status(200).send( { 'msg' : 'this is Pro Task App base url' } )  ;
    
} )  ;


app.use( '/user' , userRouter )  ;


app.listen( PORT , async ()=>{
    try {
        console.log( `server is running on http://localhost:${PORT}` )  ;
        
        await connection  ;

        console.log( 'server is connected to DB' )  ;

    } catch (error) {
        
        console.log( { error } )  ;
    }
} )  ;