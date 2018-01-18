'use strict';
//var debug = require('debug')('sot:controller:app');

module.exports = function (router) {

    router.get('/', function (req, res) {
        return res.render('app/index');
    });
};
