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
  
      return res.status( 201 ).send( { "msg" : "Note saved successfully" , note } )  ;

    } catch ( error ) {

      return res.status( 500 ).send( { "error" : error } )  ;
    }
  }


// Get All Notes

const getAllNotes = async ( req , res ) => {
    try {

        const { useremail } = req.body  ;

        const user = await UserModel.findOne( { useremail } )  ;

        if( !user )
        {
            return res.status( 404 ).send( { "msg" : "No user account found with this email" } )  ;
        }

        const notes = await UserModel.findById( user._id ).populate( 'noteObjectId' )  ;

        if( !notes )
        {
            return res.status( 404 ).send( { "msg" : "No notes found" } )  ;
        }

        return res.status( 200 ).send( notes.noteObjectId  )  ;

    } catch ( error ) {

        return res.status( 500 ).send( { error } )  ;
    } 
}

// Get Note

const getNote = async ( req , res ) => {
    try {

        const { noteId , useremail } = req.body  ;

        const note = await NoteModel.findById( noteId )  ;

        const user = await UserModel.findOne( { useremail } )  ;

        if( !user )
        {
            return res.status( 404 ).send( { "msg" : "No user account found with this email" } )  ;
        }

        if( !note )
        {
            return res.status( 404 ).send( { "msg" : "No note found" } )  ;
        }

        return res.status( 200 ).send( note )  ;

    } catch (error) {

        return res.status( 500 ).send( { error } )  ;
    } 
}

const updateNote = async ( req , res ) => {
    try {

        const { noteId , useremail } = req.body  ;

        const user = await UserModel.findOne( { useremail } )  ;

        if( !user )
        {
            return res.status( 404 ).send( { "msg" : "No user account found with this email" } )  ;
        }

        const note = await NoteModel.findById( noteId )  ;

        if( !note )
        {
            return res.status( 404 ).send( { "msg" : "No note found" } )  ;
        }

        const updatednote = await NoteModel.findByIdAndUpdate( noteId , req.body , { new: true } )  ;

        if( !updatednote )
        {
            return res.status( 500 ).send( { "msg" : "Note was not able to update" } )  ;
        }

        return res.status( 200 ).send( { "msg" : "Note Updated" , updatednote } )  ;

    } catch (error) {

        return res.status( 500 ).send( { error } )  ;
    } 
}

const deleteNote = async ( req , res ) => {
    try {

        const { noteId , useremail } = req.body  ;

        const user = await UserModel.findOne( { useremail } )  ;

        if( !user )
        {
            return res.status( 404 ).send( { "msg" : "No user account found with this email" } )  ;
        }

        const note = await NoteModel.findById( noteId )  ;

        if( !note )
        {
            return res.status( 404 ).send( { "msg" : "No note found" } )  ;
        }

        await NoteModel.deleteOne( { '_id' : noteId } )  ;

        const index = user.noteObjectId.indexOf( note._id )  ;

        if ( index > -1 ) { 
            user.noteObjectId.splice( index , 1 )  ; 
        }

        await UserModel.findByIdAndUpdate( user._id , user )  ;

        return res.status( 200 ).send( { "msg" : "Note deleted" } )  ;

    } catch (error) {

        return res.status( 500 ).send( { error } )  ;
    } 
}


module.exports = { addNote , getAllNotes , getNote , updateNote , deleteNote }  ;