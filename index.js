'use strict';
global.BASE_DIR = __dirname;

let app = require('express')();
let kraken = require('kraken-js');
let debug = require('debug')('sot:index');
let options = require(global.BASE_DIR + '/lib/options')(app);

module.exports = app;
app.use(kraken(options));
app.on('start', function () {
    debug('Application ready to serve requests.');
    debug('Environment: %s', app.kraken.get('env:env'));
});
