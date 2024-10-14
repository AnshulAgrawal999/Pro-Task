const { NoteModel } = require( '../models/NoteModel' )  ;

const { UserModel } = require( '../models/UserModel' )  ;

// Create New Note

const addNote = async (req, res) => {
    try {
      const { title , description , useremail } = req.body  ;

      const user = await UserModel.findOne( { useremail } )  ;

      if( !user )
      {
          return res.status( 404 ).send( { "msg" : "No user account found with this email" } )  ;
      }

      const newnote = new NoteModel( { title , description , 'userObjectId' : user._id } )  ;

      await newnote.save()  ;

      const note = await NoteModel.findOne( { title , description , 'userObjectId' : user._id } )  ;

      if( !note )
      {
          return res.status( 500 ).send( { "msg" : "Note was not able to save, try again" } )  ;
      }

      user.noteObjectId.push( note._id )  ;

      await UserModel.findByIdAndUpdate( user._id , user )  ;
  
      res.status( 201 ).send( { "msg" : "Note saved successfully" , note } )  ;

    } catch (error) {
      console.error("Creating Project Error :", error);
      res.status(500).json({ msg: "Creating Projects Error" });
    }
  }


const getAllNotes = async ( req , res ) => {
    try {

        const { userID } = req.body  ;

        const notes = await NoteModel.find( { 'userID.useremail' : userID.useremail } )  ;

        res.status( 200 ).send( notes )  ;

    } catch (error) {
        res.status( 400 ).send( { error } )  ;
    } 
}

const getNote = async ( req , res ) => {
    try {

        const { useremail } = req.body  ;

        const notes = await NoteModel.find( { useremail } )  ;

        res.status( 200 ).send( notes )  ;

    } catch (error) {
        res.status( 400 ).send( { error } )  ;
    } 
}


module.exports = { addNote , getAllNotes }  ;