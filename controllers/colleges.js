'use strict';
let debug = require('debug')('sot:controller:colleges');

module.exports = function (router) {

    router.get('/', function (req, res) {
        return res.render('colleges/index');
    });

    router.get('/add', function (req, res) {
        return res.render('colleges/add');
    });
};
