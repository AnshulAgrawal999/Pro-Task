const express = require( 'express' )  ;

const { passwordCheck } = require( '../middleware/validate' )  ;

const { auth } = require( '../middleware/auth' )  ;


const { registerUser , loginUser , logoutUser , deleteAccount , refreshToken , getAllUsers , getUser } = require( '../controllers/userRoutesController' )  ;


const userRouter = express.Router()  ;

userRouter.post( '/register' , passwordCheck , registerUser )  ;

userRouter.post( '/login' , loginUser )  ;

userRouter.post( '/logout' , auth , logoutUser )   ;

// userRouter.patch( '/changepassword' , auth , passwordCheck , changePassword )   ;

userRouter.delete( '/deleteaccount' , auth , deleteAccount )  ;

userRouter.get( '/refreshtoken' , refreshToken )  ;

userRouter.get( '/getallusers' , auth , getAllUsers )  ;

userRouter.get( '/getuser' , auth , getUser )  ;

module.exports = { userRouter }  ;