const mongoose = require("mongoose");

async function connectMongoose() {
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    autoIndex: false, 
  });
}

module.exports = { connectMongoose };
