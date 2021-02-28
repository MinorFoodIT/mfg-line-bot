const winston = require('winston');
const path = require('path');
const moment = require('moment');

var logger = caller => {
    return winston.createLogger({
        level: 'info',
        //format: winston.format.json(),
        format: winston.format.combine(
            winston.format.label({ label: path.basename(caller) }),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format(function dynamicContent(info, opts) {
                info.message = '' + info.message;
                return info;
            })(),
            winston.format.simple()
        ),
        transports: [
            /*
            new winston.transports.File({
                level: 'info',
                filename: __dirname + '/../log/app.log',
                format: winston.format.printf(info => `${new Date().toISOString()} | ${info.label} | ${info.level} | ${info.message}`),
                handleExceptions: true,
                maxsize: 5242880, // 5MB
                maxFiles: 5,
                colorize: false,
            }),
            */
            new (winston.transports.Console)({
                json: true,
                //format: winston.format.printf(info => `${new Date().toISOString()} | ${info.label} | ${info.level} | ${info.message}`),
                format: winston.format.printf(info => `${moment().tz('Asia/Bangkok').format()} | ${info.label} | ${info.level} | ${info.message}`),
                colorize: true
            })
        ]
    });
}

/*
// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function(message, encoding) {
        // use the 'info' log level so the output will be picked up by both transports (file and console)
        logger.info(message);
    },
};
*/
module.exports = logger;