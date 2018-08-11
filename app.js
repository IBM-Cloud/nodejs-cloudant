const path = require('path');
const nconf = require('nconf');

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    nconf.file(path.join(process.cwd(), 'config', 'configuration-local.json'));
} else {
    nconf.file(path.join(process.cwd(), 'config', 'configuration.json'));
}

require('./db/db.js').init(nconf);

const log4js = require('log4js');
log4js.configure(nconf.get('log4js'));
const express = require('express');
const app = express();
const http = require('http').Server(app);

const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const routes = require('./routes/routes');

const logger = log4js.getLogger('app');

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    logger.error('unhandledRejection: %j', error);
});

// all environments
const port = process.env.PORT || 3000;
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(log4js.connectLogger(logger, {level: 'auto'}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));

app.use(routes);

http.listen(port, function () {
    logger.info('Your server is listening on port %d', port);
});

module.exports = app;
