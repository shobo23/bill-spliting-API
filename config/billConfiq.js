const mongoose = require("mongoose");
require("dotenv/config");

const { MONGODB_URL } = process.env;

async function connectDb() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to db");
  } catch (error) {
    console.log("error connecting", error);
  }
}

module.exports = connectDb;
