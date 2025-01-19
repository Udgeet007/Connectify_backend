const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users'
  },
  friendId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users'
  },
  text:{
    type:String,
  }
}, {timestamps:true});

module.exports = mongoose.model('message', messageSchema);