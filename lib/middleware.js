/**
 * Common middleware
 */
'use strict';
let debug = require('debug')('sot:lib:middleware');


/**
 * A helper set title
 * @param req
 * @param res
 * @param next
 */
module.exports.setTitle = function () {

    return function setTitle(req, res, next) {

        res.locals.title = 'SOT';

        next();
    };
};
