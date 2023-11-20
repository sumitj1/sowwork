const mongoose = require("mongoose");
const { DATABASE_URL } = require("./constants");

mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const database = mongoose.connection;

database.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

database.once("open", () => {
  console.log("Connected to MongoDB : ", process.pid);
});

module.exports = {
  database,
};
