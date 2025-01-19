const jwt = require("jsonwebtoken");
const userCollection = require("../models/UserCollection");
var bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10); // Generate salt for hashing
let JWT_SECRET = "HarHarMahadev";
var randomstring = require("randomstring");
const nodemailer = require("nodemailer");
const UserCollection = require("../models/UserCollection");

const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    //check if the email is Already exists
    const existingUser = await userCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        msg: "Email already exists! please Login!",
        success: false,
      });
    }

    let hashedPassword = bcrypt.hashSync(password, salt);
    console.log(password);
    console.log(hashedPassword);
    let data = await userCollection.create({
      name,
      email,
      password: hashedPassword,
    });
    res
      .status(201)
      .json({ msg: "User Created Successfully", success: true, data });
  } catch (error) {
    res.status(500).json({
      msg: "error in creating User!",
      success: false,
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ msg: "email is required", success: false });
  }
  if (!password) {
    return res
      .status(400)
      .json({ msg: "password is required", success: false });
  }

  try {
    let findUser = await userCollection.findOne({ email: email });
    if (findUser) {
      let comparePassword = bcrypt.compareSync(password, findUser.password); // true
      if (comparePassword) {
        let token = jwt.sign({ _id: findUser._id }, JWT_SECRET);
        res.status(200).json({
          msg: "User Login Successfully",
          success: true,
          user: findUser,
          token,
        });
      } else {
        res.status(401).json({ msg: "invalid password", success: false });
      }
    } else {
      return res
        .status(404)
        .json({ msg: "user not found please sign up", success: false });
    }
  } catch (error) {
    res.status(500).json({
      msg: "error in login user",
      success: false,
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  const _id = req.user;
  console.log(_id);

  if (_id !== req.params._id) {
    return res.json({
      msg: "not authorized to update this account",
      success: false,
    });
  }

  let { name, password, profilePic, coverPic, bio, city} = req.body;

  try {
    if (password) {
      var hashedPassword = bcrypt.hashSync(password, salt);
    }
    // let data = await userCollection.updateOne(  find , update )
    // let data = await userCollection.updateOne(  {name:"abc"} , {$set:{name:"bdc"}} )
    let data = await userCollection.findByIdAndUpdate(_id, {
      name: name,
      password: hashedPassword,
      profilePic, coverPic, bio, city
    });
    res.json({ msg: "user updated successfull", success: true });
  } catch (error) {
    res.json({
      msg: "error in updating user",
      success: false,
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  let id = req.params._id;

  try {
    await userCollection.findByIdAndDelete(req.user);
    res.json({ msg: "user deleted successfully", success: true });
  } catch (error) {
    res.json({
      msg: "error in deleting user",
      success: false,
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  const { email } = req.body;
  try {
    // If email is provided, filter by email; otherwise, fetch all users
    const query = email ? { email: email } : {};
    const allUsers = await userCollection.find(query);

    // Check if users were found
    if (allUsers.length === 0) {
      return res.status(404).json({
        msg: "No users found",
        success: false,
      });
    }

    // Return the list of users
    return res.status(200).json({
      msg: "Users retrieved successfully",
      success: true,
      users: allUsers,
    });
  } catch (error) {
    // Handle errors
    return res.status(500).json({
      msg: "Error in retrieving users",
      success: false,
      error: error.message,
    });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await userCollection.findOne({ email });
    // console.log(user);

    if (user) {
      let resetToken = randomstring.generate(30);
      // res.send(resetToken);
      user.resetPasswordToken = resetToken;
      await user.save();

      const main = await sendEmail(email, resetToken);
      res.json({
        msg: "please check your email for password reset",
        success: true,
      });

      // let updateUser = await userCollection.findByIdAndUpdate(user._id,{resetPasswordToken:resetToken});
      // console.log(resetToken);
    } else {
      res.status().json({ msg: "email does not exists", success: false });
    }
  } catch (error) {
    res
      .status(404)
      .json({
        msg: "error in forget password",
        success: false,
        error: error.message,
      });
  }
};

function sendEmail(email, resetToken) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "udgeetbhatt271@gmail.com",
      pass: "yhhh tnoz yxet geem",
    },
    tls: {
      rejectUnauthorized: false, // Ignore self-signed certificate errors
    },
  });

  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: "udgeetbhatt271@gmail.com", // sender address
      to: email, // list of receivers
      subject: "Password reset Request", // Subject line
      text: `Please click the link below to choose a new password: \n "http://localhost:8990/api/users/resetToken/${resetToken}"`, // plain text body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  }

  main().catch(console.error);
}

const resetPassword = async (req, res) => {
  let token = req.params.token;
  let user = await userCollection.findOne({ resetPasswordToken: token });
  if (user) {
    res.render("resetPassword", { token });
  } else {
    res.send("token expired");
  }
};

const passwordReset = async (req, res) => {
  let token = req.params.token;
  let newPassword = req.body.newPassword;

  try {
    let user = await userCollection.findOne({ resetPasswordToken: token });

    if (user) {
      let hashedPassword = bcrypt.hashSync(newPassword, salt);
      user.password = hashedPassword;
      user.resetPasswordToken = null; // Invalidate the token after password reset
      await user.save();
      res
        .status(200)
        .json({ msg: "Password updated successfully", success: true });
    } else {
      res
        .status(400)
        .json({ msg: "Token has expired or is invalid", success: false });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        msg: "Internal server error",
        success: false,
        error: error.message,
      });
  }
};

const getUserDetails = async (req,res)=>{
  let userId = req.user;

 try {
  let data = await UserCollection.findById(userId);
  res.json({msg:"user found successfully", success:true, data})
 } catch (error) {
  res.json({msg:"error in getting user", success:false, error:error.message});
 }
}

const getUserByName = async(req,res)=>{
  let name = req.query.q;
  let query = new RegExp(name);

  if(req.query.q){
    let data = await userCollection.find({name:query})
    res.json(data);
  }else{
    res.json([])
  }
}

const getUserbyId = async(req,res)=>{
  let id = req.params._id;
  try {
    let friend = await userCollection.findById(id).select('-password -email');
    res.json({msg:"user get successfully", success:true, friend});
  } catch (error) {
    res.json({msg:"error in getting user by id", success:false, error:error.message});
  } 
}

const followUser = async(req,res)=>{
    let userId = req.user;
    let friendId = req.params._id;
    let userDetail = await userCollection.findById(userId);
    let friendDetails = await userCollection.findById(friendId);

    // console.log(userDetail);
   
    if(!userDetail.followings.includes(friendId)){
      userDetail.followings.push(friendId);
      friendDetails.followers.push(userId);
      await userDetail.save();
      await friendDetails.save(); 
      return res.json({msg:"user followed successfully", success:true})
    }else{
      userDetail.followings.pull(friendId);
      friendDetails.followers.pull(userId);
      await userDetail.save();
      await friendDetails.save();
      return res.json({msg:"user unfollowed successfully", success:true})
    }
}

module.exports = {
  createUser,
  deleteUser,
  loginUser,
  updateUser,
  getAllUsers,
  forgetPassword,
  resetPassword,
  passwordReset,
  getUserDetails,
  getUserByName,
  getUserbyId,
  followUser
};
