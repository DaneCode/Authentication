const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
// Environmental Variables
PASSWORD = process.env.PASSWORD
URL = process.env.URL
PORT = process.env.PORT

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

// set up session
app.use(session({
  secret: 'our little secret.',
  resave: false,
  saveUninitialized: false
}));
// initialize passport
app.use(passport.initialize());
// use passport to manage session
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-dane:"+PASSWORD+"@"+URL);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
// setup userSchema to use passport-local-mongoose as a plugin
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
// use passport to setup local login strategy
passport.use(User.createStrategy());
// setup passport to serialize and deserialize our user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.post("/register", (req, res) => {

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", (req, res) => {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });

});

app.listen(PORT, () => {
  console.log("server started");
});
