const jwt = require( 'jsonwebtoken' )  ;

const dotenv = require( 'dotenv' )  ;


const { BlackListModel } = require( '../models/BlackListModel' )  ;


dotenv.config()  ;


const auth = async ( req , res , next ) => {

    try {

        const accessToken = req.headers.authorization  ;

        if ( !accessToken ) 
        {
            return res.status( 401 ).send( { msg: "No Token Provided" } )  ;
        }

        const item = await BlackListModel.findOne( { "token" : accessToken } )  ;

        if ( item )
        {
            return  res.status( 401 ).send( { "msg" : "User is logged out" } )  ;
        }

        jwt.verify( accessToken , process.env.accessSecretKey , function( err , decoded ) 
        {
            if ( err )
            {
                return res.status( 500 ).send( { "error" : err } )  ;
            }

            req.body.useremail = decoded.useremail  ;

            next()  ;
           
        });
           
        
    } catch ( error ) {
        res.status( 500 ).send( { "error" : error } )  ;
    }
} 


module.exports = { auth }  ;