require("dotenv").config();
require("./config/mongodb"); // database initial setup
require("./utils/helpers-hbs"); // utils for hbs templates
const path = require("path");
const flash = require("connect-flash");

// base dependencies
const express = require("express");
const hbs = require("hbs");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);
const cookieParser = require("cookie-parser");

// initial config
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
hbs.registerPartials(path.join(__dirname, "views/partials"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// SESSION SETUP
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 600000000 }, // in millisec
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60 // 1 day
    }),
    saveUninitialized: true,
    resave: true
  })
);

app.locals.site_url = process.env.SITE_URL;
// used in front end to perform ajax request (var instead of hardcoded)

// CUSTOM MIDDLEWARE
app.use(flash());
app.use(function exposeFlashMessage(req, res, next) {
  res.locals.success_msg = req.flash("success");
  res.locals.error_msg = req.flash("error");
  next();
});

function checkloginStatus(req, res, next) {
  res.locals.user = req.session.currentUser ? req.session.currentUser : null;

  res.locals.isLoggedIn = Boolean(req.session.currentUser);
  //   // access this value @ {{isLoggedIn}} in .hbs
  next(); // continue to the requested route
}

function eraseSessionMessage() {
  var count = 0; // initialize counter in parent scope and use it in inner function
  return function(req, res, next) {
    if (req.session.msg) {
      // only increment if session contains msg
      if (count) {
        // if count greater than 0
        count = 0; // reset counter
        req.session.msg = null; // reset message
      }
      ++count; // increment counter
    }
    next(); // continue to the requested route
  };
}

app.use(checkloginStatus);
app.use(eraseSessionMessage());

app.get("/", (req, res) => {
  res.render("home");
});

// Getting/Using router(s)
// const basePageRouter = require("./routes/index");
// app.use("/", basePageRouter);

const authRouter = require("./routes/auth.js");
const yogaRouter = require("./routes/yoga.js");
const meditationRouter = require("./routes/meditation.js");
const aboutRouter = require("./routes/about.js");

app.use(authRouter);
app.use(yogaRouter);
app.use(meditationRouter);
app.use(aboutRouter);

const listener = app.listen(process.env.PORT || 5000, () => {
  console.log(`app started at ${process.env.SITE_URL}:${process.env.PORT}`);
});
