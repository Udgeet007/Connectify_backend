const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "already registered with this email"],
    },
    password: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    profilePic: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.add({
  resetPasswordToken: {
    type: String,
    default: null,
  },
  profilePic:{
    type:String,
    default:"https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
  },
  coverPic:{
    type:String,
    default:"https://img.freepik.com/free-photo/woman-holding-leafy-white-pillow-mockup_53876-128613.jpg?semt=ais_hybrid"
  },
  bio:{
    type:String,
  },
  city:{
    type:String
  },
  followers:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users'
  }],
  followings:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users'
  }]
});

module.exports = mongoose.model("users", userSchema);
