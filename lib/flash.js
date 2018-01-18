'use strict';
let debug = require('debug')('sot:lib:flash');
const _D = require('lodash');

module.exports.outputFlash = function () {
    return function (req, res, next) {
        let flashMessages = req.flash();
        if (!_D.isEmpty(flashMessages)) {
            res.locals.flashMessages = flashMessages;
        }
        // debug(res.locals.flashMessages);
        next();
    };
};
