const Cloudant = require('@cloudant/cloudant');
const _ = require('lodash');
const log4js = require('log4js');
const logger = log4js.getLogger('db');


module.exports.initDBConnection = (nconf) => {

    return new Promise((resolve, reject) => {
        logger.info('Initialization of database...');
        const dbName = nconf.get('cloudant.database_name');
        const dbCredentials = {
            dbName: dbName,
            url: nconf.get('cloudant.credentials.url')
        };


        logger.info('Connecting to database %s...', dbName);
        const cloudant = Cloudant({url: dbCredentials.url, plugin: 'promises'});

        // check if DB exists if not create
        cloudant.db.list().then((allDbs) => {
            return _.find(allDbs, (db) => {
                return db === dbName;
            });
        }).then((dbExists) => {
            if (!dbExists) {
                cloudant.db.create(dbName).then(() => {
                    return;
                }).catch((err) => {
                    logger.error('Could not create new db %s.', dbName);
                    logger.error('Error: %s - %s', err.message, err.stack);
                    throw err;
                });
            }
            return;
        }).then(() => {
            const db = cloudant.db.use(dbName);
            logger.info('Connected to database %s', dbName);
            return resolve(db);
        }).catch((err) => {
            logger.error('Cannot list databases');
            logger.error('Error: %s - %j', err.message, err.stack);
            return reject(err);
        });
    });
};
