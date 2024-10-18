const express = require( 'express' )  ;

const { auth } = require( '../middleware/auth' )  ;

const { addNote , getAllNotes , getNote } = require( '../controllers/noteRoutesController' )  ;


const noteRouter = express.Router()  ;

noteRouter.post( '/addnote' , auth , addNote )  ;

noteRouter.get( '/getallnotes' , auth , getAllNotes )  ;

noteRouter.get( '/getnote' , auth , getNote )  ;


module.exports = { noteRouter }  ;