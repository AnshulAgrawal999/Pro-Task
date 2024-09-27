const passwordCheck = ( req , res , next ) => 
{
  try {

    const { userpassword } = req.body  ;

    const hasNumber = /\d/.test( userpassword )  ;
  
    const hasUpperCase = /[A-Z]/.test( userpassword )  ;

    const hasSpecialChar = /[!@#$%^&*()_+{}:"?/<>,.]/.test( userpassword )  ;

    if ( userpassword.length < 8 ) 
    {
        return res.status( 400 ).send( { "msg" : "password should contain atleast 8 characters" } )  ;
    }

    if ( !hasNumber ) 
    {
        return res.status( 400 ).send( { "msg" : "password should contain atleast one number" } )  ;
    }
    
    if ( !hasUpperCase ) 
    {
        return res.status( 400 ).send( { "msg" : "password should contain at least one uppercase character" } )  ;
    }

    if ( !hasSpecialChar ) 
    {
        return res.status( 400 ).send( { "msg" : "password should contain at least one special character" } )  ;
    }
      
    next()  ;
  } 
  catch ( error ) {
    res.status( 500 ).send( { "error" : error } )  ;
  }
    
}  ;
  
module.exports = { passwordCheck }  ;
  