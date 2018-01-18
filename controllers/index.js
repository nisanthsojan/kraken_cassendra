'use strict';
let debug = require('debug')('sot:controller:index');

const validator = require('validator');
const _D = require('lodash');
const models = require('express-cassandra');
const passport = require('passport');

module.exports = function (router) {
    let afterLoginRoute = '/app';

    router.get('/', function (req, res) {
        if (req.isAuthenticated()) {
            return res.redirect(afterLoginRoute);
        }
        res.render('index');
    });

    router.post('/', function (req, res, next) {
        // debug('login');
        if (req.isAuthenticated()) {
            return res.redirect(afterLoginRoute);
        }

        let email = _D.isEmpty(req.body.email) ? '' : _D.toString(req.body.email);
        let password = _D.isEmpty(req.body.password) ? '' : _D.toString(req.body.password);

        if (!validator.isEmail(email)) {
            req.flash('error', 'Not valid email');
            return res.redirect('/');
        }
        if (validator.isEmpty(password)) {
            req.flash('error', 'Password cannot be blank');
            return res.redirect('/');
        }

        passport.authenticate('local', (err, user) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.flash('error', 'Login not found');
                return res.redirect('/');
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                let goingTo = afterLoginRoute;
                if (req.session.goingTo) {
                    goingTo = req.session.goingTo;
                    delete req.session.goingTo;
                }
                res.redirect(goingTo);
            });
        })(req, res, next);
    });

    router.get('/signup', function (req, res) {
        if (req.isAuthenticated()) {
            return res.redirect(afterLoginRoute);
        }
        debug('signup', res.locals);
        res.render('signup');
    });
    router.post('/signup', function (req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect(afterLoginRoute);
        }
        let email = _D.isEmpty(req.body.email) ? '' : _D.toString(req.body.email);
        let password = _D.isEmpty(req.body.password) ? '' : _D.toString(req.body.password);
        let password2 = _D.isEmpty(req.body.password2) ? '' : _D.toString(req.body.password2);

        if (!validator.equals(password, password2)) {
            req.flash('error', 'Password dont match');
            return res.redirect('/signup');
        }

        if (!validator.isEmail(email)) {
            req.flash('error', 'Not valid email');
            return res.redirect('/signup');
        }

        email = validator.normalizeEmail(email, {gmail_remove_dots: false});

        return models.instance.User.findOne({
            email: email
        }, function (err, existingUser) {
            if (err) {
                return next(err);
            }
            if (existingUser) {
                req.flash('errors', 'Account with that email address already exists.');
                return res.redirect('/signup');
            }

            const user = new models.instance.User({
                email: email
            });

            return user.setPassword(password, function () {
                return user.save(function (err) {
                    if (err) {
                        return next(err);
                    }

                    req.flash('success', 'Account created');

                    return res.redirect('/');
                });
            });

        });
    });

    router.get('/logout', function (req, res) {
        req.logout();

        return req.session.destroy(function () {
            return res.redirect('/');
        });
    });

};
