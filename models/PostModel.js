const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title:{
    type:String,
  },
  description:{
    type:String,
  },
  file:{
    type:String,
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users',
    require:true,
  },

}, {timestamps:true});

postSchema.add({
  comments:[
    {
      user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
      },
      text:{
        type:String,
      }
    }
  ],
  likes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users'
  }]
})


module.exports = mongoose.model("posts", postSchema);
