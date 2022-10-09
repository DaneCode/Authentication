const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const app = express();
const encrypt = require("mongoose-encryption");
// Environmental Variables
PASSWORD = process.env.PASSWORD
URL = process.env.URL
PORT = process.env.PORT
SECRETKEY = process.env.SECRET

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
mongoose.connect("mongodb+srv://admin-dane:"+PASSWORD+"@"+URL);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
// adding encryption to password of schema
userSchema.plugin(encrypt, { secret: SECRETKEY, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);


app.get("/", (req, res) => {
  res.render("home")
});
app.get("/register", (req, res) => {
  res.render("register")
});
app.get("/login", (req, res) => {
  res.render("login")
});

app.post("/register", (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
})
app.post("/login", (req, res) =>{
  const username = req.body.username
  const password = req.body.password
  User.findOne({email: username}, (err, foundUser) =>{
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets")
        }
      }
    }
  });
});


app.listen(PORT, function() {
  console.log("server started");
});
