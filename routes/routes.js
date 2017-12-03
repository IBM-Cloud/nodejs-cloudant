const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const log4js = require('log4js');
const logger = log4js.getLogger('routes');

const db = require('../db/db.js').initDBConnection();
const favorites = require('./favorites.js');
const attachments = require('./attachments.js');

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


router.get('/api/favorites/attach', (req, res) => {
    const id = req.query.id;
    const key = req.query.key;

    const attached = attachments.getAttachment(db, id, key);
    if (attached instanceof Error) {
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send('Error: ' + attached).end();
    } else {
        res.setHeader('Content-Disposition', 'inline; filename=\'' + key + '\'');
        res.status(200).send(attached).end();
    }
});

router.post('/api/favorites/attach', multipartMiddleware, (req, res) => {

    const id = req.query.id;
    const name = req.query.name;
    const value = req.query.value;
    const file = req.files.file;

    const responseData = attachments.addAttachment(db, id, name, value, file);
    res.status(200).send(responseData).end();
});


module.exports = router;

