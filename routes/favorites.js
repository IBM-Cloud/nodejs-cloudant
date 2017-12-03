const _ = require('lodash');
const log4js = require('log4js');
const logger = log4js.getLogger('favorites');

const util = require('./util.js');

module.exports.getFavorites = (db) => {
    logger.debug('START getFavorites');

    const docList = [];

    db.list().then((body) => {
        logger.debug('total # of docs -> %d', body.rows.length);
        const promises = [];
        _.forEach(body.rows, (document) => {
            promises.push(db.get(document.id, {
                revs_info: true
            }));
        });
        return Promise.all(promises);
    }).then((responses) => {
        _.forEach(responses, (doc) => {
            let responseData;

            if (doc._attachments) {
                const attachments = [];
                for (const attribute in doc._attachments) {

                    if (doc._attachments.attribute && doc._attachments.attribute.content_type) {
                        attachments.push({
                            'key': attribute,
                            'type': doc._attachments.attribute.content_type
                        });
                    }
                    logger.debug('%s: %j', attribute, doc._attachments.attribute);
                }
                responseData = util.createResponseData(
                    doc._id,
                    doc.name,
                    doc.value,
                    attachments);

            } else {
                responseData = util.createResponseData(
                    doc._id,
                    doc.name,
                    doc.value, []);
            }

            docList.push(responseData);
        });
        return docList;
    }).catch((err) => {
        logger.error(err);
    });
};

module.exports.putFavorite = (db, id, name, value) => {
    logger.debug('START putFavorite');

    const _name = util.sanitizeInput(name);
    const _value = util.sanitizeInput(value);

    db.get(id, {
        revs_info: true
    }).then((doc) => {
        logger.debug('Document with id %s: %j', id, doc);
        doc.name = _name;
        doc.value = _value;
        return db.insert(doc, doc.id);
    }).then((doc) => {
        logger.debug('Document updated: %j', doc);
        return 200;
    }).catch((err) => {
        logger.error(err);
        return 500;
    });

};

module.exports.createFavorite = (db, name, value) => {
    logger.debug('START createFavorite');
    const _name = util.sanitizeInput(name);
    const _value = util.sanitizeInput(value);

    db.insert({
        name: _name,
        value: _value
    }).then((doc) => {
        logger.debug('Document created: %j', doc);
        return 200;
    }).catch((err) => {
        logger.error(err);
        return 500;
    });
};

module.exports.deleteFavorite = (db, id) => {
    logger.debug('START deleteFavorite');
    db.get(id, {
        revs_info: true
    }).then((res) => {
        logger.debug('Delete response: %j', res);
        return 200;
    }).catch((err) => {
        logger.error(err);
        return 500;
    });
};
