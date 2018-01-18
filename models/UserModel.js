/**
 * A model for our user
 */
'use strict';
let debug = require('debug')('sot:models:user');

const crypto = require(global.BASE_DIR + '/lib/crypto');

module.exports = {
    fields: {
        email: 'varchar',
        password: 'blob',
        created: {
            type: 'timestamp',
            default: {'$db_function': 'toTimestamp(now())'}
        }
    },
    key: [['email'], 'created'],
    methods: {
        setPassword: function (password, callback) {
            crypto.hashPassword(password, (err, hashed) => {
                if (err) {
                    debug(err);
                    return callback(err);
                }
                this.password = hashed;
                return callback();
            });
        },
        /**
         * Helper function that takes a plaintext password and compares it against the user's hashed password.
         * @param plainText
         * @param callback
         */
        passwordMatches: function (plainText, callback) {
            crypto.verifyPassword(plainText, this.password, callback);
        }
    }
};
