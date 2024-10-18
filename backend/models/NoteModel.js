const mongoose = require( 'mongoose' )  ;

const noteSchema = mongoose.Schema(
{
    title: { type : String , required : true } ,
    description : { type : String , required: true } ,
    note : { type: String } ,
    userObjectId : { type : mongoose.Schema.Types.ObjectId , ref : 'user' , required : true }
}
)

const NoteModel = mongoose.model( "note" , noteSchema )  ;


module.exports = { NoteModel } ;