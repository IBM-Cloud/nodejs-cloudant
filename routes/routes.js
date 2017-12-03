const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const fs = require('fs');
const log4js = require('log4js');
const logger = log4js.getLogger('routes');

const db = require('../db/db.js').initDBConnection();
const favorites = require('./favorites.js');

const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('index.html', {title: 'Cloudant Boiler Plate'});
});

router.get('/api/favorites', (req, res) => {
    const docList = favorites.getFavorites(db);
    res.status(200).json(docList).end();
});

router.post('/api/favorites', (req, res) => {
    const name = req.body.name;
    const value = req.body.value;
    logger.info('Create a document with name %s and value %s', name, value);

    const statusCode = favorites.createFavorite(db, name, value);
    res.status(statusCode).end();
});

router.put('/api/favorites', (req, res) => {
    const id = req.body.id;
    const name = req.body.name;
    const value = req.body.value;
    logger.info('Update document %s', id);

    const statusCode = favorites.putFavorite(db, id, name, value);
    res.status(statusCode).end();
});

router.delete('/api/favorites', (req, res) => {

    const id = req.query.id;
    // var rev = request.query.rev; // Rev can be fetched from request. if
    // needed, send the rev from client
    logger.debug('Removing document of ID: %s', id);

    const statusCode = favorites.deleteFavorite(db, id);
    res.status(statusCode).end();
});


module.exports = router;


app.get('/api/favorites/attach', (request, response) => {
    const doc = request.query.id;
    const key = request.query.key;

    db.attachment.get(doc, key, (err, body) => {
        if (err) {
            response.status(500);
            response.setHeader('Content-Type', 'text/plain');
            response.write('Error: ' + err);
            response.end();
            return;
        }

        response.status(200);
        response.setHeader('Content-Disposition', 'inline; filename=\'' + key + '\'');
        response.write(body);
        response.end();
        return;
    });
});

app.post('/api/favorites/attach', multipartMiddleware, (request, response) => {

    console.log('Upload File Invoked..');
    console.log('Request: ' + JSON.stringify(request.headers));

    let id;

    db.get(request.query.id, (err, existingdoc) => {

        let isExistingDoc = false;
        if (!existingdoc) {
            id = '-1';
        } else {
            id = existingdoc.id;
            isExistingDoc = true;
        }

        const name = sanitizeInput(request.query.name);
        const value = sanitizeInput(request.query.value);

        const file = request.files.file;
        const newPath = './public/uploads/' + file.name;

        const insertAttachment = (file, id, rev, name, value, response) => {

            fs.readFile(file.path, (err, data) => {
                if (!err) {

                    if (file) {

                        db.attachment.insert(id, file.name, data, file.type, {
                            rev: rev
                        }, (err, document) => {
                            if (!err) {
                                console.log('Attachment saved successfully.. ');

                                db.get(document.id, (err, doc) => {
                                    console.log('Attachements from server --> ' + JSON.stringify(doc._attachments));

                                    const attachements = [];
                                    let attachData;
                                    for (const attachment in doc._attachments) {
                                        if (attachment === value) {
                                            attachData = {
                                                'key': attachment,
                                                'type': file.type
                                            };
                                        } else {
                                            attachData = {
                                                'key': attachment,
                                                'type': doc._attachments[attachment].content_type
                                            };
                                        }
                                        attachements.push(attachData);
                                    }
                                    const responseData = createResponseData(
                                        id,
                                        name,
                                        value,
                                        attachements);
                                    console.log('Response after attachment: \n' + JSON.stringify(responseData));
                                    response.write(JSON.stringify(responseData));
                                    response.end();
                                    return;
                                });
                            } else {
                                console.log(err);
                            }
                        });
                    }
                }
            });
        }

        if (!isExistingDoc) {
            existingdoc = {
                name: name,
                value: value,
                create_date: new Date()
            };

            // save doc
            db.insert({
                name: name,
                value: value
            }, '', (err, doc) => {
                if (err) {
                    console.log(err);
                } else {

                    existingdoc = doc;
                    console.log('New doc created ..');
                    console.log(existingdoc);
                    insertAttachment(file, existingdoc.id, existingdoc.rev, name, value, response);

                }
            });

        } else {
            console.log('Adding attachment to existing doc.');
            console.log(existingdoc);
            insertAttachment(file, existingdoc._id, existingdoc._rev, name, value, response);
        }

    });

});

