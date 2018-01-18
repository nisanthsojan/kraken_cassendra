/**
 */
'use strict';
let debug = require('debug')('sot:lib:set_active_nav');
/**
 * A helper method
 * @param req
 * @param res
 * @param next
 */
module.exports.setActiveRoute = function () {

    let activeRouteList = {
        '/profile/delete': '/profile'
    };

    return function (req, res, next) {
        let route = req.url;
        // debug(route);
        res.locals.activeRoute = route;

        if (activeRouteList[route]) {
            res.locals.activeRoute = activeRouteList[route];
        }

        return next();
    };
};
