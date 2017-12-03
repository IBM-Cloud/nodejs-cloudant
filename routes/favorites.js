const _ = require('lodash');
const log4js = require('log4js');
const logger = log4js.getLogger('favorites');

const sanitizeInput = (str) => {
    return String(str).replace(/&(?!amp;|lt;|gt;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const createResponseData = (id, name, value, attachments) => {

    const responseData = {
        id: id,
        name: sanitizeInput(name),
        value: sanitizeInput(value),
        attachements: []
    };


    attachments.forEach((item) => {
        const attachmentData = {
            content_type: item.type,
            key: item.key,
            url: '/api/favorites/attach?id=' + id + '&key=' + item.key
        };
        responseData.attachements.push(attachmentData);

    });
    return responseData;
};

module.exports.getFavorites = (db) => {

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
                responseData = createResponseData(
                    doc._id,
                    doc.name,
                    doc.value,
                    attachments);

            } else {
                responseData = createResponseData(
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

