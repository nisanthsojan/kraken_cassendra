'use strict';
let debug = require('debug')('sot:lib:user');

const models = require('express-cassandra');

let UserLibrary = function () {
    return {
        serialize: function (user, done) {
            done(null, user.email);
        },
        deserialize: function (id, done) {
            //debug(id);
            models.instance.User.findOne({
                email: id
            }, function (err, user) {
                done(null, user);
            });
        }
    };
};

module.exports = UserLibrary;
