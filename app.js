var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var compress = require('compression');
var expressValidation = require('express-validation');
var methodOverride = require('method-override');
var helmet = require('helmet');
var cors = require('cors');
var config = require('./config/config')
const httpStatus = require('http-status');
const APIError = require('./routes/helpers/APIError');
//var swaggerUi = require('swagger-ui-express'), swaggerDocument = require('./swagger.json');
//var swStats = require('swagger-stats');
//var redis = require('./redis-client');
var moment = require('moment')

const expressWinston = require('express-winston');
const winstonInstance = require('winston');

// make bluebird default Promise
Promise = require('bluebird');

//root of routes
var routes = require('./routes/index-route');

var app = express();

if (config.env === 'development') {
    app.use(logger('dev'));
}

//app.use(swStats.getMiddleware({swaggerSpec:swaggerDocument}));

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// enable detailed API logging in dev env
if (config.env === 'development') {
    expressWinston.requestWhitelist.push('body'); // Array of request body to log
    expressWinston.responseWhitelist.push('body');
    app.use(expressWinston.logger({
        transports: [
            /*
            new winstonInstance.transports.File({
                level: 'info',
                filename: __dirname + '/log/access.log',
                handleExceptions: true,
                json: true,
                //json: false,
                maxsize: 5242880, // 5MB
                maxFiles: 5,
                colorize: false,
            }),
            */
            new (winstonInstance.transports.Console)({
                json: true,
                colorize: true,
                //.tz('Asia/Bangkok')
                format: winstonInstance.format.printf(info => `${moment().format()} | ${info.label} | ${info.level} | ${info.message}`)
            })

        ],
        format: winstonInstance.format.combine(
            winstonInstance.format(function dynamicContent(info, opts) {
                info.message = '' + info.message;
                return info;
            })(),
            winstonInstance.format.simple()
        ),
        meta: true, // optional: log meta data about request (defaults to true)
        msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
        colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
    }));
}

// mount all routes on /api path
app.use(express.static(path.join(__dirname, 'public'))); //put favicon.ico on public
app.disable('etag'); //Cache and 304 not modified ,http header with same request
app.use('/api', routes);
    //app.get('/favicon.ico', (req, res) => res.status(204));

//swagger
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
    if (err instanceof expressValidation.ValidationError) {
        // validation error contains errors which is an array of error each containing message[]
        const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
        const error = new APIError(unifiedErrorMessage, err.status, true);
        return next(error);
    } else if (!(err instanceof APIError)) {
        const apiError = new APIError(err.message, err.status, err.isPublic);
        return next(apiError);
    }
    return next(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new APIError('API not found', httpStatus.NOT_FOUND ,true);
    return next(err);
});

// log error in winston transports except when executing test suite
if (config.env !== 'test') {
    app.use(expressWinston.errorLogger({
        transports: [
            new (winstonInstance.transports.Console)({
                json: true,
                colorize: true,
                //.tz('Asia/Bangkok')
                format: winstonInstance.format.printf(info => `${moment().format()} | ${info.label} | ${info.level} | ${info.message}`)
            })
        ],
        format: winstonInstance.format.combine(
            winstonInstance.format(function dynamicContent(info, opts) {
                info.message = '' + info.message;
                return info;
            })(),
            winstonInstance.format.simple()
        ),
        meta: true, // optional: log meta data about request (defaults to true)
        msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
        colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
    }));

}

// error handler, send stacktrace only during development
app.use((err, req, res, next) => {// eslint-disable-line no-unused-vars
    console.log(err)
    res.status(err.status).json({
        code: err.status,
        message: err.isPublic ? err.message : httpStatus[err.status],
        stack: config.env === 'development' ? err.stack : {}
    })
});

module.exports = app;
