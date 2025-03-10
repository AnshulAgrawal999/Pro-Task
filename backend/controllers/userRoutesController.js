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

        if ( !useremail ) 
        {
            return res.status( 401 ).send( { msg: "No email provided" } )  ;
        }

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

            const { userpassword , ...userdata  } = { ...newuser._doc }  ;

            return res.status( 201 ).send( { "msg" : "New account has been created!" , userdata } )  ;
            
        })  ;
        
    } catch ( error ) {

        return res.status( 500 ).send( { "error" : error } )  ;
    }
}

// User LogIn

const loginUser = async ( req , res ) => {

    try {

        const { useremail , userpassword  } = req.body  ;

        if ( !useremail ) 
        {
            return res.status( 401 ).send( { msg: "No email provided" } )  ;
        }

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
           
            return res.status( 401 ).send( { "msg" : "Incorrect password!" } )  ;
            
        });
       
    } catch ( error ) {

        return res.status( 500 ).send( { "error" : error } )  ;
    }
} 

// User Logout

const logoutUser = async ( req , res ) => {
    
    try {
        const { accessToken , refreshToken } = req.body  ;

        if ( !accessToken || !refreshToken ) 
        {
            return res.status( 401 ).send( { msg: "Tokens not provided" } )  ;
        }

        await BlackListModel.insertMany( [ { "token" : accessToken } , { "token" : refreshToken } ] )  ;

        return res.status( 200 ).send( { "msg" : "User has been logged out" }  )  ;
        
    } catch ( error ) {

        return res.status( 500 ).send( { "error" : error } )  ;
    }
} 

// // User Account Password Change

// const changePassword = async ( req , res ) => {

//     try {
//         const { useremail , olduserpassword , userpassword , accessToken , refreshToken } = req.body  ;

//         if ( !accessToken || !refreshToken ) 
//         {
//             return res.status( 401 ).send( { msg: "Tokens not provided" } )  ;
//         }

//         const user = await UserModel.findOne( { useremail } )  ;

//         if( !user )
//         {
//             return res.status( 404 ).send( { "msg" : "No user account found with this email" } )  ;  
//         }
        
//         bcrypt.compare( olduserpassword , user.userpassword , async function( err , result ) {
//             if( err )
//             {
//                 return res.status( 500 ).send( { "error" : err } )  ;
//             }

//             if( result )
//             {
//                 bcrypt.hash( userpassword , 3 , async function ( err2 , hash ) {

//                     if( err2 )
//                     {
//                         return res.status( 500 ).send( { "error" : err2 } )  ;
//                     }
                    
//                     const updateduser = await UserModel.findByIdAndUpdate( user._id , { 'userpassword' : hash } , { new: true } )  ;

//                     const { userpassword , ...updateduserdata  } = { ...updateduser._doc }  ;

//                     await BlackListModel.insertMany( [ { "token" : accessToken } , { "token" : refreshToken } ] )  ;

//                     return res.status( 200 ).send( { "msg" : "Password has been updated! User has been logged out" , updateduserdata }  )  ;
                    
//                 } )  ;
//             }
            
//             return res.status( 401 ).send( { "msg" : "Incorrect password" } )  ;
            
//         })  ;
 
//     } catch ( error ) {

//         return res.status( 500 ).send( { "error" : error } )  ;
//     }
// } 


// User Account Deletion

const deleteAccount = async ( req , res ) => {
    
    try {
        const { useremail , userpassword , accessToken , refreshToken } = req.body  ;

        if ( !accessToken || !refreshToken ) 
        {
            return res.status( 401 ).send( { msg: "Tokens not provided" } )  ;
        }

        const user = await UserModel.findOne( { useremail } )  ;

        if( !user )
        {
            return res.status( 404 ).send( { "msg" : "No user account found with this email" } )  ;  
        }
        
        bcrypt.compare( userpassword , user.userpassword , async function( err , result ) {
            if( err )
            {
                return res.status( 500 ).send( { "error" : err } )  ;
            }

            if( result )
            {
                await UserModel.deleteOne( { '_id' : user._id } )  ;
                
                await BlackListModel.insertMany( [ { "token" : accessToken } , { "token" : refreshToken } ] )  ;

                const { userpassword , ...userdata  } = { ...user._doc }  ;

                return res.status( 200 ).send( { "msg" : "Account has been deleted and user has been logged out" , userdata }  )  ;
            }
            
            return res.status( 401 ).send( { "msg" : "Incorrect password" } )  ;
            
        })  ;

    } catch ( error ) {

        return res.status( 500 ).send( { "error" : error } )  ;
    }
} 

// New Access Token Generation

const refreshToken = async ( req , res ) => {

    try {

        const { accessToken , refreshToken } = req.body  ;

        if ( !accessToken || !refreshToken ) 
        {
            return res.status( 401 ).send( { msg: "Tokens not provided" } )  ;
        }

        const item1 = await BlackListModel.findOne( { "token" : accessToken } )  ;

        const item2 = await BlackListModel.findOne( { "token" : refreshToken } )  ;

        if ( item1 || item2 )
        {
            return res.status( 401 ).send( { "msg" : "User is logged out" } )  ;   
        }
       
        jwt.verify( refreshToken , process.env.refreshSecretKey , function( err ) 
        {
            if ( err )
            {
                return res.status( 500 ).send( { "error" : err } )  ;
            }

            jwt.verify( accessToken , process.env.accessSecretKey , function( err2 , decoded ) 
            {
                if( err2 )
                {
                    if ( err2.name === 'TokenExpiredError' )
                    {
                        const newaccessToken = jwt.sign( { 'useremail' : decoded.useremail } , process.env.accessSecretKey , { expiresIn: '100m' } )   ;
            
                        return res.status( 200 ).send( { "newaccessToken" : newaccessToken } )  ;
                    }
                        
                    return res.status( 500 ).send( { "error" : err2 } )  ;    
                }
                
                return res.status( 400 ).send( { "msg" : "Previous accessToken still active" } )  ;
                
            });
        });

    } catch ( error ) {
        
        return res.status( 500 ).send( { "error" : error } )  ;
    }
}


// Get All Users List  ( for Task Assigning Purpose ) 

const getAllUsers = async ( req , res ) => {

    try {
      const users = await UserModel.find()  ;

      if( !users )
      {
          return res.status( 404 ).send( { "msg" : "No users account found" } )  ;
      }

      const userslist = []  ;
  
      for( let i = 0 ; i < users.length ; i++ )
      {
        const { userpassword , ...userdata  } = { ...users[i]._doc }  ;

        userslist.push( userdata )  ;
      }

      return res.status( 200 ).send( userslist )  ;

    } catch ( error ) {
      
        return res.status( 500 ).send( { "error" : error } )  ;
    }
}
  

// Get a Single User Data 

const getUser = async ( req , res ) => {

    try {
      const { requestemail } = req.body  ;
  
      const user = await UserModel.findOne( { 'useremail' : requestemail } )  ;

      if( !user )
      {
         return res.status( 404 ).send( { "msg" : "No user account found with this email" } )  ;
      }
  
      const { userpassword , ...userdata  } = { ...user._doc }  ;

      return res.status( 200 ).send( userdata )  ;

    } catch ( error ) {
      
        return res.status( 500 ).send( { "error" : error } )  ;
    }
  }

module.exports = { registerUser , loginUser , logoutUser , deleteAccount , refreshToken , getAllUsers , getUser }  ;