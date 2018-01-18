/**
 * A custom library to establish a database connection
 */
'use strict';
let debug = require('debug')('sot:lib:database');

const models = require('express-cassandra');
const _D = require('lodash');

/*let udts = {
    courses: {
        title: 'text',
        description: 'text',
        link: 'varchar',
        level: 'varchar',
        fees_eu: 'float',
        fees_non_eu: 'float',
        duration_in_months: 'int'
    },
    address: {
        formatted_address: 'text',
        latitude: 'float',
        longitude: 'float'
    }
};*/

let db = function (conf) {
    return models.setDirectory(global.BASE_DIR + '/models').bind(
        {
            clientOptions: {
                contactPoints: [conf.host],
                protocolOptions: {port: conf.port},
                keyspace: conf.database,
                queryOptions: {consistency: models.consistencies.one}
            },
            ormOptions: {
                defaultReplicationStrategy: {
                    class: 'SimpleStrategy',
                    replication_factor: 1
                },
                migration: 'safe'
            }
        },
        function (err) {
            if (err) throw err;

            // You'll now have a `person` table in cassandra created against the model
            // schema you've defined earlier and you can now access the model instance
            // in `models.instance.Person` object containing supported orm operations.
            debug('Models instance', _D.keys(models.instance));
        }
    );
};

module.exports = db;
