const _ = require('lodash');
const promisify = require('promisify-node');
const fs = promisify('fs');
const log4js = require('log4js');
const logger = log4js.getLogger('attachments');

const util = require('./util.js');

module.exports.getAttachment = (db, id, key) => {
    logger.debug('START getFavorites');

    db.attachment.get(id, key).then((body) => {
        logger.debug('Response: %j', body);
        return body;
    }).catch((err) => {
        logger.error(err);
        return err;
    });
};

module.exports.addAttachment = (db, id, name, value, file) => {
    logger.debug('START addAttachment');

    const _name = util.sanitizeInput(name);
    const _value = util.sanitizeInput(value);


    fs.readFile(file.path).then((data) => {
        return Promise.all([data, db.get(id)]);
    }).then(([data, doc]) => {
        if (!doc) {
            return Promise.all([data, db.create({
                name: _name,
                value: _value
            }).then((doc) => {
                return doc;
            })]);
        }
        return [data, doc];
    }).then(([data, doc]) => {
        return db.attachment.insert(doc._id, file.name, data, file.type, {
            rev: doc._rev
        });
    }).then((document) => {
        logger.info('Attachment saved successfully.');
        const attachements = [];
        let attachData;
        _.forEach(document._attachments, (attachment) => {
            if (attachment === value) {
                attachData = {
                    'key': attachment,
                    'type': file.type
                };
            } else {
                attachData = {
                    'key': attachment,
                    'type': attachment.content_type
                };
            }
            attachements.push(attachData);
        });

        return util.createResponseData(id, name, value, attachements);
    }).catch((err) => {
        logger.error(err);
    });
};
