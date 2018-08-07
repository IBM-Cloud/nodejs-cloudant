const nconf = require('nconf');
const Cloudant = require('@cloudant/cloudant');
const _ = require('lodash');
const log4js = require('log4js');
const logger = log4js.getLogger('db');


module.exports.initDBConnection = () => {

    return new Promise((resolve, reject) => {
        logger.info('Initialization of database...');

        const dbCredentials = {
            dbName: nconf.get('cloudant.database_name'),
            url: nconf.get('cloudant.credentials.url')
        };


        logger.info('Connecting to database...');
        const cloudant = Cloudant({url: dbCredentials.url, plugin: 'promises'});

        // check if DB exists if not create
        cloudant.db.list().then((allDbs) => {
            return _.find(allDbs, (db) => {
                return db === dbCredentials.dbName;
            });
        }).then((dbExists) => {
            if (!dbExists) {
                cloudant.db.create(dbCredentials.dbName).then(() => {
                    return;
                }).catch((err) => {
                    logger.error('Could not create new db %s.', dbCredentials.dbName);
                    logger.error('Error: %s - %s', err.message, err.stack);
                    throw err;
                });
            }
            return;
        }).then(() => {
            const db = cloudant.db.use(dbCredentials.dbName);
            logger.info('Connected to %s database', dbCredentials.dbName);
            return resolve(db);
        }).catch((err) => {
            logger.error('Cannot list databases');
            logger.error('Error: %s - %j', err.message, err.stack);
            return reject(err);
        });
    });
};
