require("dotenv").config();
const express = require("express");
// const auth = require("./routes/user/auth/auth")
const user = require("./routes/user/index")
const mongoose = require("mongoose");

const app = express();
const cors = require("cors");
// const { connection } = require("./database/sql");

// connection.connect((err) => {
//   if (err) throw err;
//   console.log("MySQL: " + connection.state);
// });

mongoose.connect('mongodb://localhost/blog')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());
app.use("/user",user)

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}...`));