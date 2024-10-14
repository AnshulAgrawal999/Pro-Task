const bcrypt = require( 'bcrypt' )  ;

const jwt  = require( 'jsonwebtoken' )  ;

const dotenv = require( 'dotenv' )  ;


const { UserModel } = require( '../models/UserModel' )  ;

const { BlackListModel } = require( '../models/BlackListModel' )  ;


dotenv.config()  ;


// User SignUp

const registerUser = async ( req , res ) => {

    try {

        const { useremail , userpassword } = req.body  ;

        const user = await UserModel.findOne( { useremail } )  ;

        if( user )
        {   
            return res.status( 400 ).send( { "msg" : "Account with this email already exists!" } )  ;            
        }

        bcrypt.hash( userpassword , 3 , async function ( err , hash ) {

            if( err )
            {
                return res.status( 500 ).send( { "error" : err } )  ;
            }
            
            const newuser = new UserModel( req.body )  ;

            newuser.userpassword = hash  ;

            await newuser.save()  ;

            res.status( 201 ).send( { "msg" : "New account has been created!" , newuser } )  ;
            
        })  ;
        
    } catch ( error ) {
        res.status( 500 ).send( { "error" : error } )  ;
    }
}

// User LogIn

const loginUser = async ( req , res ) => {

    try {
        const { useremail , userpassword  } = req.body  ;

        const user = await UserModel.findOne( { useremail } )  ;

        if( !user )
        {
            return res.status( 404 ).send( { "msg" : "No user account found with this email" } )  ;
        }

        bcrypt.compare( userpassword , user.userpassword , function ( err , result ) {

            if( err )
            {
                return res.status( 500 ).send( { "error" : err } )  ;
            }

            if( result )
            {
                const accessToken = jwt.sign( { useremail } , process.env.accessSecretKey , { expiresIn: '100m' } )  ;

                const refreshToken = jwt.sign( { useremail } , process.env.refreshSecretKey , { expiresIn: '1d' } )  ;

                return res.status( 200 ).send( { "msg" :"Login successful!" , accessToken , refreshToken } )  ;
            }
           
            res.status( 401 ).send( { "msg" : "Incorrect password!" } )  ;
            
        });
       
    } catch ( error ) {
        res.status( 500 ).send( { "error" : error } )  ;
    }
} 

// User Logout

const logoutUser = async ( req , res ) => {
    try {
        const { accessToken , refreshToken } = req.body  ;

        await BlackListModel.insertMany( [ { "token" : accessToken } , { "token" : refreshToken } ] )  ;

        res.status( 200 ).send( { "msg" : "User has been logged out" }  )  ;
        
    } catch ( error ) {
        res.status( 500 ).send( { "error" : error } )  ;
    }
} 

// User Account Password Change

const changePassword = async ( req , res ) => {
    try {
        const { useremail , olduserpassword , newuserpassword , accessToken , refreshToken } = req.body  ;

        const user = await UserModel.findOne( { useremail } )  ;

        if( !user )
        {
            return  res.status( 404 ).send( { "msg" : "No user account found with this email" } )  ;  
        }
        
        bcrypt.compare( olduserpassword , user.userpassword , async function( err , result ) {
            if( err )
            {
                return res.status( 500 ).send( { "error" : err } )  ;
            }

            if( result )
            {
                bcrypt.hash( newuserpassword , 3 , async function ( err , hash ) {

                    if( err )
                    {
                        return res.status( 500 ).send( { "error" : err } )  ;
                    }
                    else
                    {
                        await UserModel.updateOne( { 'useremail' : useremail } , { 'userpassword' : hash } )  ;

                        await BlackListModel.insertMany( [ { "token" : accessToken } , { "token" : refreshToken } ] )  ;

                        return res.status( 200 ).send( { "msg" : "Password has been updated! User has been logged out" }  )  ;
                    }
                } )  ;
            }
            
            res.status( 401 ).send( { "msg" : "Incorrect password" } )  ;
            
        })  ;
 
    } catch ( error ) {
        res.status( 500 ).send( { "error" : error } )  ;
    }
} 


// User Account Deletion

const deleteAccount = async ( req , res ) => {
    
    try {
        const { useremail , userpassword , accessToken , refreshToken } = req.body  ;

        const user = await UserModel.findOne( { useremail } )  ;

        if( !user )
        {
            return  res.status( 404 ).send( { "msg" : "No user account found with this email" } )  ;  
        }
        
        bcrypt.compare( userpassword , user.userpassword , async function( err , result ) {
            if( err )
            {
                return res.status( 500 ).send( { "error" : err } )  ;
            }

            if( result )
            {
                await UserModel.deleteOne( { 'useremail' : useremail } )  ;
                
                await BlackListModel.insertMany( [ { "token" : accessToken } , { "token" : refreshToken } ] )  ;

                return res.status( 200 ).send( { "msg" : "Account has been deleted and user has been logged out" , user }  )  ;
            }
            
            res.status( 401 ).send( { "msg" : "Incorrect password" } )  ;
            
        })  ;

    } catch ( error ) {
        res.status( 500 ).send( { "error" : error } )  ;
    }
} 

// New Access Token Generation

const refreshToken = async ( req , res ) => {

    try {

        const { accessToken , refreshToken } = req.body  ;

        const item1 = await BlackListModel.findOne( { "token" : accessToken } )  ;

        const item2 = await BlackListModel.findOne( { "token" : refreshToken } )  ;

        if ( item1 || item2 )
        {
            return res.status( 401 ).send( { "msg" : "User is logged out" } )  ;   
        }
       
        jwt.verify( refreshToken , process.env.refreshSecretKey , function( error ) 
        {
            if ( error )
            {
                return res.status( 500 ).send( { "error" : error } )  ;
            }

            jwt.verify( accessToken , process.env.accessSecretKey , function( err , decoded ) 
            {
                if( err )
                {
                    if ( err.name === 'TokenExpiredError' )
                    {
                        const newaccessToken = jwt.sign( { 'useremail' : decoded.useremail } , process.env.accessSecretKey , { expiresIn: '100m' } )   ;
            
                        return res.status( 200 ).send( { "newaccessToken" : newaccessToken } )  ;
                    }
                        
                    return res.status( 500 ).send( { "error" : err } )  ;    
                }
                
                res.status( 400 ).send( { "msg" : "Previous accessToken still active" } )  ;
                
            });
        });

    } catch ( error ) {
        res.status( 500 ).send( { "error" : error } )  ;
    }
}


// Get All Users List - for Task Assigning Purpose - Authenticated Route

const getAllUsers = async ( req , res ) => {
    try {
      const users = await UserModel.find()  ;
  
      res.status( 200 ).send( users )  ;

    } catch ( error ) {
      
      res.status( 500 ).send( { "error" : error } )  ;
    }
}
  

// Get a Single User Data - Authenticated Route

const getUser = async ( req , res ) => {
    try {
      const { requestemail } = req.body  ;
  
      const user = await UserModel.findOne( { 'useremail' : requestemail } )  ;

      if( !user )
      {
         return res.status( 404 ).send( { "msg" : "No user account found with this email" } )  ;
      }
  
      res.status( 200 ).send( user )  ;

    } catch ( error ) {
      
      res.status( 500 ).send( { "error" : error } )  ;
    }
  }

module.exports = { registerUser , loginUser , logoutUser , changePassword , deleteAccount , refreshToken , getAllUsers , getUser }  ;