const _ = require('lodash');
const promisify = require('promisify-node');
const fs = promisify('fs');
const log4js = require('log4js');
const logger = log4js.getLogger('attachments');

const util = require('./util.js');

module.exports.getAttachment = (db, id, key) => {
    return new Promise((resolve, reject) => {
        logger.debug('START getFavorites');

        db.attachment.get(id, key).then((body) => {
            logger.debug('Response: %j', body);
            return resolve(body);
        }).catch((err) => {
            logger.error(err);
            return reject(err);
        });
    });
};

module.exports.addAttachment = (db, id, name, value, file) => {

    return new Promise((resolve, reject) => {
        logger.debug('START addAttachment');


        const _name = util.sanitizeInput(name);
        const _value = util.sanitizeInput(value);


        fs.readFile(file.path).then((data) => {
            return Promise.all([data, (id === -1) ? db.get(id) : null]);
        }).then(([data, doc]) => {
            if (!doc) {
                return Promise.all([data, db.insert({
                    name: _name,
                    value: _value
                }).then((doc) => {
                    return doc;
                })]);
            }
            return [data, doc];
        }).then(([data, doc]) => {
            logger.debug('file name: %s, file type: %s', file.name, file.type);
            logger.debug('DOC: %j', doc);
            return db.attachment.insert(doc.id, file.name, data, file.type, {
                rev: doc.rev
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

            return resolve(util.createResponseData(id, name, value, attachements));
        }).catch((err) => {
            logger.error('Error: ', err);
            return reject(err);
        });
    });
};
