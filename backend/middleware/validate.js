const passwordCheck = ( req , res , next ) => 
{
  try {

    const { userpassword } = req.body  ;

    const hasNumber = /\d/.test( userpassword )  ;
  
    const hasUpperCase = /[A-Z]/.test( userpassword )  ;

    const hasSpecialChar = /[!@#$%^&*()_+{}:"?/<>,.]/.test( userpassword )  ;

    if ( userpassword.length < 8 ) 
    {
          res.status(200).send( { "msg" : "password should be at least 8 characters long" } )  ;
    }
    else
    {
      if ( hasNumber ) 
      {
          if ( hasUpperCase ) 
          {
            if ( hasSpecialChar ) 
            {
                next()  ;
            }
            else
            {
                res.status(200).send( { "msg" : "password should contain at least one special character" } )  ;
            }  
          }
          else
          {
            res.status(200).send( { "msg" : "password should contain at least one uppercase character" } )  ;
          }  
      }
      else
      {
        res.status(200).send( { "msg" : "password should atleast contain one number" } )  ;
      }     
    }
    
  } catch (error) {
    res.status(400).send( { "error" : error } )  ;
  }
    
}  ;
  
module.exports = { passwordCheck }  ;
  