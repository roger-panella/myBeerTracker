var express = require('express');
var path = require('path');
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
require('dotenv').config();
var request = require('request');
var favicon = require('serve-favicon');
var logger = require('morgan');
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');



hbs.registerHelper("getForTrade", function(forTrade){
  if (forTrade == true) {
    return 'Yes';
  } else if (forTrade == false) {
    return 'No';
  }
});

hbs.registerHelper("showUsers", function(users){
  // var usersList = [];
  var ul = "<ul id='cellars-list'>";
  for (var inc = 0; inc < users.length; inc++) {
    var name = Object.keys(users[inc])[0];
    var nameVal = users[inc][name];
    var li = "<li id='user-public'><a href=/public_cellar?id="+nameVal+">" + name + "</a></li>";
    ul = ul + li;
  }
  ul = ul + "</ul>";
  return new hbs.SafeString(ul);
});

var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
require('./app_api/models/db');

var routes = require('./app_server/routes/index');
var routesApi = require('./app_api/routes/index');
var users = require('./app_api/routes/users');



var app = express();

app.use(require('express-session')({
  secret: 'Cantillon makes delicous beer',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

var User = require('./app_api/models/User');
// passport.use(new LocalStrategy(User.authenticate()));

passport.use(new LocalStrategy(function(username, password, done){
  User.findOne({ username: username }, function(err, user){
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Incorrect username' });
    user.comparePassword(password, function(err, isMatch){
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password'});
      }
    });
  });
}));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});

// view engine setup
app.set('views', path.join(__dirname,'app_server', 'views'));
app.set('view engine', 'hbs');



// hsb.registerHelper("testy", function(data) {
//
//   var html = '<div>';
//   // loop through data
//   // only append stuff to div as needed
//   // when done w/logic return the fully formed html
//   html = html = '</div>';
//
//   return html;
//
//
// });

// commented out for angular!!!

hbs.registerHelper("getStylesForSort", function(beers){
  var stylesForSort = [];
  for (var i = 0; i < beers.length;i++){
    if (stylesForSort.indexOf(beers[i].style) == -1) {
      stylesForSort.push(beers[i].style);
    };
  }
  console.log(stylesForSort);
  return stylesForSort;
});


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api', routesApi);
app.use('/users', users)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
