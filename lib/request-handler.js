var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var User = require('../app/models/user');
var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  console.log('loginUserForm');
  console.log('pushing makes this update');
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}, function(err, links) {
    if (err) {
      throw err;
    } else {
      res.status(200).send(links);
    }
  });

  // Links.reset().fetch().then(function(links) {
  //   res.status(200).send(links.models);
  // });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }
  Link.findOne( { url: uri }, function(err, link) {
    if (!link) { // user not found
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        });

        Link.prototype.save = Promise.promisify(Link.prototype.save);
        newLink.save().then(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    } else if (!err) { // user found
      res.status(200).send(link);
    } else if (err) {
      console.log('WE ARE HERE!!!!');
      console.log('ERROR', err);
    }
  });
};

exports.loginUser = function(req, res) {
  console.log('are we in here?');
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }) 
    .then(function(user) {
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
            res.redirect('/');
          } else {
            res.redirect('/');
          }
        });
      }
    });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
    .then(function(user) {
      if (!user) {
        var newUser = new User({
          username: username,
          password: password
        });

        newUser.save()
          .then(function(newUser) {
            util.createSession(req, res, newUser);
          });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    });
};

exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] }).then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.visits++;
      return res.redirect(link.url);
    }
  });
};