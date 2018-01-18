'use strict';
let debug = require('debug')('sot:controller:profile');

const models = require('express-cassandra');
const _D = require('lodash');
const validator = require('validator');

module.exports = function (router) {

    router.get('/', function (req, res) {
        res.locals.user = req.user;
        return res.render('profile/index');
    });
    router.post('/password/reset', function (req, res) {
        let redirectRoute = '/profile';
        let email = _D.isEmpty(req.body.email) ? '' : _D.toString(req.body.email);
        let password_original = _D.isEmpty(req.body.password_original) ? '' : _D.toString(req.body.password_original);
        let password_new = _D.isEmpty(req.body.password_new) ? '' : _D.toString(req.body.password_new);
        let password_new2 = _D.isEmpty(req.body.password_new2) ? '' : _D.toString(req.body.password_new2);

        if (!validator.isEmail(email)) {
            req.flash('error', 'Not valid email');
            return res.redirect(redirectRoute);
        }
        email = validator.normalizeEmail(email, {gmail_remove_dots: false});
        if (!validator.equals(email, req.user.email)) {
            req.flash('error', 'Not valid email user');
            return res.redirect(redirectRoute);
        }
        if (!validator.equals(password_new, password_new2)) {
            req.flash('error', 'Password not match');
            return res.redirect(redirectRoute);
        }

        return models.instance.User.findOne({
            email: email
        }, function (err, user) {
            if (err) {
                debug('User.findOne err', err);
                req.flash('error', 'Not valid user');
                return res.redirect(redirectRoute);
            }
            if (!user) {
                req.flash('error', 'Not valid user');
                return res.redirect(redirectRoute);
            }
            //Make sure that the provided password matches what's in the DB.
            return user.passwordMatches(password_original, function (err, isMatch) {
                // debug('isMatch', isMatch);
                if (err || !isMatch) {
                    req.flash('error', 'Incorrect Password');
                    return res.redirect(redirectRoute);
                }

                return user.setPassword(password_new, function () {
                    return user.save(function (err) {
                        if (err) {
                            debug('user.save err', err);
                            req.flash('error', 'Unable to save. Try again');
                            return res.redirect(redirectRoute);
                        }

                        req.flash('success', 'Password Updated');
                        return res.redirect(redirectRoute);
                    });
                });
            });
        });
    });

    router.get('/delete', function (req, res) {
        return res.render('profile/delete');
    });
    router.post('/delete', function (req, res) {
        let password = _D.isEmpty(req.body.password) ? '' : _D.toString(req.body.password);
        let redirectRoute = '/profile/delete';

        return models.instance.User.findOne({
            email: req.user.email
        }, function (err, user) {
            if (err) {
                debug('User.findOne err', err);
                req.flash('error', 'Not valid user');
                return res.redirect(redirectRoute);
            }
            if (!user) {
                req.flash('error', 'Not valid user');
                return res.redirect(redirectRoute);
            }
            //Make sure that the provided password matches what's in the DB.
            return user.passwordMatches(password, function (err, isMatch) {
                // debug('isMatch', isMatch);
                if (err || !isMatch) {
                    req.flash('error', 'Incorrect Password');
                    return res.redirect(redirectRoute);
                }

                req.logout();
                return req.session.destroy(function () {
                    return user.delete(function (err) {
                        if (err) {
                            debug('user.remove err', err);
                            //req.flash('error', 'Unable to delete. Try again');
                            return res.redirect(redirectRoute);
                        }

                        //req.flash('success', 'User deleted');
                        return res.redirect('/');
                    });

                });
            });

        });
    });
};
