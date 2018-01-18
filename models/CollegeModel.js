/**
 * A model for our college
 */
'use strict';
let debug = require('debug')('sot:models:college');

module.exports = {
    fields: {
        name: 'varchar',
        /*address: 'frozen<address>',
        courses_here: {
            type: 'list',
            typeDef: 'frozen<courses>'
        },*/
        website: 'varchar',
        description: 'text',
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
