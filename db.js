const mongoose = require("mongoose");
require("dotenv").config();

const connectToDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error in connecting to MongoDB:", error.message);
    process.exit(1); // Exit process if connection fails
  }
};

module.exports = connectToDB;
