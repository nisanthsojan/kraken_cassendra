/**
 * Library to hold crypto specific properties
 */
'use strict';
let debug = require('debug')('sot:lib:crypto');

const crypto = require('crypto');
// https://security.stackexchange.com/questions/110084/parameters-for-pbkdf2-for-password-hashing


let PasswordCrypto = {};

PasswordCrypto.setConfig = function (configration) {
    this.config = configration;
};

/**
 * Hash a password using Node's asynchronous pbkdf2 (key derivation) function.
 *
 * Returns promise with a self-contained buffer encoded with config.encoding
 * that contains all the data needed to verify a password:
 -----------------------
 | SaltLen |     4     |
 -----------------------
 | Salt    | saltBytes |
 -----------------------
 | HashLen |     4     |
 -----------------------
 | Salt    | hashBytes |
 - ---------------------
 * @param {!String} password
 * @param {!function(?Error, ?Buffer=)} callback
 */
PasswordCrypto.hashPassword = function (password, callback) {
    let config = this.config;
    return crypto.randomBytes(config.saltBytes, (err, salt) => {
        if (err) {
            return callback(err);
        }
        return crypto.pbkdf2(password, salt, config.iterations, config.hashBytes, config.algo, (err, derivedKey) => {
            if (err) {
                return callback(err);
            }
            let array = new ArrayBuffer(derivedKey.length + salt.length + 8);
            let hashframe = Buffer.from(array);
            // extract parameters from buffer
            hashframe.writeUInt32BE(salt.length, 0, true);
            hashframe.writeUInt32BE(config.iterations, 4, true);
            salt.copy(hashframe, 8);
            derivedKey.copy(hashframe, salt.length + 8);

            return callback(null, hashframe);
        });
    });
};
/**
 * Verify a password using Node's asynchronous pbkdf2 (key derivation) function.
 *
 * Accepts a hash and salt generated by hashPassword, and returns whether the
 * hash matched the password
 *
 * @param {!String} password
 * @param {!Buffer} hashframe Buffer containing hash and salt as generated by
 *   hashPassword.
 * @param {!function(?Error, !boolean)} callback
 */
PasswordCrypto.verifyPassword = function (password, hashframe, callback) {
    let config = this.config;
    // debug(password, hashframe);
    let saltBytes = hashframe.readUInt32BE(0);
    let hashBytes = hashframe.length - saltBytes - 8;
    let iterations = hashframe.readUInt32BE(4);
    let salt = hashframe.slice(8, saltBytes + 8);
    let hash = hashframe.slice(8 + saltBytes, saltBytes + hashBytes + 8);

    // debug(saltBytes, hashBytes, iterations);

    return crypto.pbkdf2(password, salt, iterations, hashBytes, config.algo, (err, derivedKey) => {
        if (err) {
            debug(err);
            return callback(err);
        }
        // debug(password, hashframe);
        if (derivedKey.equals(hash)) {
            return callback(null, true);
        }

        return callback(null, false);
    });
};

module.exports = PasswordCrypto;
