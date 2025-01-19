//middleware --> middleware are functions that have the access of requesting to an object , responding to an object, (or that have the access of requuest and response and can go to the next middleware function). they can modify the request and response.
// it takes three arguments req,res,next

const jwt = require("jsonwebtoken");
let JWT_SECRET = "HarHarMahadev";

const checkToken = (req, res, next) => {
  let token = req.headers.authorization;
  // console.log(token);
  try {
    if (!token) {
      return res.json({ msg: "token not found", success: false });
    }
    let decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded._id);
    req.user = decoded._id; //add key in the object
    next();
  } catch (error) {
    return res.json({
      msg: "invalid token",
      success: false,
      error: error.message,
    });
  }
};

module.exports = checkToken;



// let obj = {
//     name:'abc',
//     age:45
// }

// obj.course = "fullstack"