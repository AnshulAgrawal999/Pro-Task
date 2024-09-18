const jwt = require( 'jsonwebtoken' )  ;

const dotenv = require( 'dotenv' )  ;


const { BlackListModel } = require( '../models/BlackListModel' )  ;


dotenv.config()  ;


const auth = async ( req , res , next ) => {

    try {

        const accessToken = req.headers.authorization  ;

        const item = await BlackListModel.findOne( { "token" : accessToken } )  ;

        if ( !item )
        {
            jwt.verify( accessToken , process.env.accessSecretKey , function( err , decoded ) 
            {
                if ( !err )
                {
                    req.body.useremail = decoded.useremail  ;

                    next()  ;
                }
                else
                {
                    res.status(200).send( { "error" : err } )  ;
                }
            });
        }
        else
        {
            res.status(200).send( { "msg" : "You are not logged in" } )  ;
        }      
        
    } catch (error) {
        res.status(400).send( { "error" : error } )  ;
    }
} 


module.exports = { auth }  ;