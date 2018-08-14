const path = require('path');
const promisify = require('promisify-node');
const fs = promisify('fs');
const nconf = require('nconf');
const Cloudant = require('@cloudant/cloudant');

nconf.add('user', {type: 'file', file: path.join(process.cwd(), 'config', 'configuration-local.json')});

const dbURL = nconf.get('cloudant').credentials.url;
const dbName = nconf.get('cloudant').database_name;
const cloudant = Cloudant({url: dbURL, plugins: 'promises'});
const db = cloudant.db.use(dbName);

module.exports.putOnCloudant = (doc) => {
    if (!doc._id) {
        return Promise.reject('Can\'t insert a document without _id field');
    }
    return db.insert(doc);
};

module.exports.addAttachmentToCloudant = (id, filePath, fileName, fileType) => {
    return Promise.all([fs.readFile(filePath), db.get(id)]).then(([data, doc]) => {
        return db.attachment.insert(id, fileName, data, fileType, {
            rev: doc._rev
        });
    });
};

module.exports.deleteFromCloudant = (id) => {
    return db.get(id).then((doc) => {
        return db.destroy(id, doc._rev);
    });
};

module.exports.getFromCloudant = (id) => {
    return db.get(id);
};

module.exports.deleteAllFromCloudant = () => {
    return db.list().then((body) => {
        const promises = [];
        body.rows.forEach((doc) => {
            promises.push(module.exports.deleteFromCloudant(doc.id));
        });
        return Promise.all(promises);
    })
};
