const mongoose = require( 'mongoose' )  ;

const noteSchema = mongoose.Schema(
{
    title: { type : String , minlength : 3 , required : true } ,
    description : { type : String , minlength : 4 , required: true } ,
    note : { type: String , minlength : 4 } ,
    userObjectId : { type : mongoose.Schema.Types.ObjectId , ref : 'user' , required : true }
}
)

const NoteModel = mongoose.model( "note" , noteSchema )  ;


module.exports = { NoteModel } ;