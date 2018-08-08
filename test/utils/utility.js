const path = require('path');
const nconf = require('nconf');
const Cloudant = require('@cloudant/cloudant');

nconf.file({
    file: path.join(process.cwd(), 'config', 'configuration-local.yaml'),
    format: require('nconf-yaml')
});

const dbURL = nconf.get('cloudant').credentials.url;
const dbName = nconf.get('cloudant').database_name;
const cloudant = Cloudant({url: dbURL, plugins: 'promises'});
const db = cloudant.db.use(dbName);

module.exports.putOnCloudant = function (doc) {
    if (!doc._id) {
        return Promise.reject('Can\'t insert a document without _id field');
    }
    return db.insert(doc);
};

module.exports.deleteFromCloudant = function (id) {
    return db.get(id).then((doc) => {
        return db.destroy(id, doc._rev);
    });
};

module.exports.getFromCloudant = function (id) {
    return db.get(id);
};

module.exports.deleteAllFromCloudant = function () {
    return db.list().then((body) => {
        const promises = [];
        body.rows.forEach((doc) => {
            promises.push(module.exports.deleteFromCloudant(doc.id));
        });
        return Promise.all(promises);
    })
};
