'use strict';

let debug = require('debug')('sot:lib:options');
const db = require(global.BASE_DIR + '/lib/database'),
    passwordCrypto = require(global.BASE_DIR + '/lib/crypto');

module.exports = function spec(app) {
    app.on('middleware:after:session', function configPassport() {
        //debug(afterSessionApp.app.kraken.get('userSerialization'));
        const passport = require('passport'),
            auth = require(global.BASE_DIR + '/lib/auth'),
            userLib = require(global.BASE_DIR + '/lib/user')();
        //Tell passport to use our newly created local strategy for authentication
        passport.use(auth.localStrategy());
        //Give passport a way to serialize and deserialize a user. In this case, by the user's id.
        passport.serializeUser(userLib.serialize);
        passport.deserializeUser(userLib.deserialize);
        app.use(passport.initialize());
        app.use(passport.session());
    });
    return {
        onconfig: function (config, next) {

            let dbConfig = config.get('databaseConfig'),
                cryptConfig = config.get('bcrypt');

            passwordCrypto.setConfig(cryptConfig);

            db(dbConfig);
            next(null, config);
        }
    };

};
