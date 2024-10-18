const mongoose = require( 'mongoose' )  ;

const userSchema = mongoose.Schema(
{
    username : { type : String , required : true } ,
    useremail : { type : String , required : true } ,
    userpassword : { type : String , required : true } ,
    noteObjectId: [
        {
          type: mongoose.Schema.Types.ObjectId ,
          ref: "note" ,
        }
    ]
}, { versionKey: false }
)

const UserModel = mongoose.model( "user" , userSchema )  ;


module.exports = { UserModel } ;