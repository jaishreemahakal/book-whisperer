const mongoose = require("mongoose");

const connectDB = async () => {

  mongoose.connection.on("connected", () => {
    console.log("Mongoose event: connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("Mongoose event: error", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose event: disconnected");
  });

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connect() call resolved");
    console.log("Mongoose readyState:", mongoose.connection.readyState); 

    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB is not connected (readyState != 1)");
    }
  } catch (err) {
    console.error("MongoDB connection failed :", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
