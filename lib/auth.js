/**
 * Module that will handle our authentication tasks
 */
'use strict';
let debug = require('debug')('sot:lib:auth');

const models = require('express-cassandra'),
    LocalStrategy = require('passport-local').Strategy;

/**
 * A helper method to retrieve a user from a local DB and ensure that the provided password matches.
 * @param req
 * @param res
 * @param next
 */
module.exports.localStrategy = function () {

    return new LocalStrategy({usernameField: 'email'}, function (email, password, done) {

        //Retrieve the user from the database by login
        return models.instance.User.findOne({
            email: email
        }, function (err, user) {
            //If something weird happens, abort.
            if (err) {
                return done(err);
            }

            //debug('user', user.email);

            //If we couldn't find a matching user, flash a message explaining what happened
            if (!user) {
                return done(null, false, {
                    message: 'Login not found'
                });
            }

            //Make sure that the provided password matches what's in the DB.
            return user.passwordMatches(password, function (err, isMatch) {
                // debug('isMatch', isMatch);
                if (err || !isMatch) {
                    return done(null, false, {
                        message: 'Incorrect Password'
                    });
                }

                //If everything passes, return the retrieved user object.
                return done(null, user);
            });


        });
    });
};

/**
 * A helper method to determine if a user has been authenticated, and if they have the right role.
 * If the user is not known, redirect to the login page. If the role doesn't match, show a 403 page.
 * @param role The role that a user should have to pass authentication.
 */
module.exports.isAuthenticated = function () {

    return function (req, res, next) {
        //access map
        let auth = {
                '/': true,
                '/signup': true,
                '/login': true,
                '/logout': true
            },
            route = req.url;

        if (auth[route]) {
            return next();
        }

        if (!req.isAuthenticated()) {
            // If the user is not authorized, save the location that was being accessed so we can redirect afterwards.
            req.session.goingTo = req.url;
            req.flash('error', 'Please log in to view this page');
            return res.redirect('/');
        } else {
            return next();
        }

    };
};

/**
 * A helper method to add the user to the response context so we don't have to manually do it.
 * @param req
 * @param res
 * @param next
 */
module.exports.injectUser = function () {
    return function injectUser(req, res, next) {
        if (req.isAuthenticated()) {
            res.locals.user = req.user;
        }
        next();
    };
};
