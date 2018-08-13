const _ = require('lodash');
const promisify = require('promisify-node');
const fs = promisify('fs');
const log4js = require('log4js');
const logger = log4js.getLogger('attachments');

const util = require('./util.js');

const db = require('../db/db.js').getInstance();

module.exports.getAttachment = (id, key) => {
    return new Promise((resolve, reject) => {
        logger.debug('START getAttachment');

        db.getAttachment(id, key).then((body) => {
            return resolve(body);
        }).catch((err) => {
            logger.error(err);
            return reject(err);
        });
    });
};

module.exports.addAttachment = (id, name, value, file) => {

    return new Promise((resolve, reject) => {
        logger.debug('START addAttachment');

        const _name = util.sanitizeInput(name);
        const _value = util.sanitizeInput(value);


        db.getDoc(id).catch((error) => {
            if (error.message === '404 Object Not Found') {
                logger.warn('Document with ID %s not existent, creating.');
                return db.createDoc({
                    _id: (id !== -1 || id !== '') ? id : null,
                    name: _name,
                    value: _value
                });
            } else {
                return reject(error);
            }
        }).then((doc) => {
            return Promise.all([fs.readFile(file.path), doc]);
        }).then(([data, doc]) => {
            logger.debug('file name: %s, file type: %s', file.name, file.type);
            logger.trace('doc: %j', doc);

            let revision = null;
            if (doc.rev) {
                revision = doc.rev;
            } else if (doc._rev) {
                revision = doc._rev;
            } else {
                logger.error('Wrong doc format, exit!');
                return reject(new Error('Wrong doc format'));
            }


            return db.addAttachment(id, file.name, data, file.type, {
                rev: revision
            });
        }).then((document) => {
            logger.info('Attachment saved successfully.');
            return db.getDoc(document.id);
        }).then((document) => {
            const attachments = [];
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
                attachments.push(attachData);
            });

            return resolve(util.createResponseData(id, name, value, attachments));
        }).catch((err) => {
            logger.error('Error: ', err);
            return reject(err);
        });
    });
};
