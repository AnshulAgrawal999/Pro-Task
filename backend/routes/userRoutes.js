const express = require( 'express' )  ;

const { passwordCheck } = require( '../middleware/validate' )  ;

const { auth } = require( '../middleware/auth' )  ;


const { registerUser , loginUser , logoutUser , changePassword , deleteAccount , refreshToken  } = require( '../controllers/userRoutesController' )  ;


const userRouter = express.Router()  ;

userRouter.post( '/register' , passwordCheck , registerUser )  ;

userRouter.post( '/login' , loginUser )  ;

userRouter.post( '/logout' , auth , logoutUser )   ;

userRouter.patch( '/changepassword' , auth , changePassword )   ;

userRouter.delete( '/deleteaccount' , auth , deleteAccount )  ;

userRouter.post( '/refreshtoken' , refreshToken )  ;



module.exports = { userRouter }  ;