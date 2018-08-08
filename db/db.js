const Cloudant = require('@cloudant/cloudant');
const log4js = require('log4js');
const logger = log4js.getLogger('db');

class DatabaseHelper {
    constructor(nconf) {
        const dbName = nconf.get('cloudant').database_name;
        const dbURL = nconf.get('cloudant').credentials.url;
        logger.info('Connecting to database %s...', dbName);
        const cloudant = Cloudant({url: dbURL, plugins: 'promises'});
        this._db = cloudant.db.use(dbName);
        logger.info('Connected to database %s', dbName);
    }

    getAllDocs() {
        return this._db.list();
    }

    createDoc(doc) {
        return this._db.insert(doc);
    }

    getDoc(id, options) {
        return this._db.get(id, options);
    }

    updateDoc(doc, id) {
        return this._db.insert(doc, id);
    }

}

let databaseHelper = null;

module.exports.getInstance = (nconf) => {
    if (!databaseHelper) {
        databaseHelper = new DatabaseHelper(nconf);
    }
    return databaseHelper;
};
