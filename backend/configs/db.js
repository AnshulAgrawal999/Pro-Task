const mongoose = require( 'mongoose' )  ;

const dotenv = require( 'dotenv' )  ;

dotenv.config() ;

const connection = mongoose.connect( process.env.mongodbUrl )  ;


module.exports = { connection }  ;