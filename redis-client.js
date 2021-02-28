var tag = require('./config/tag')
var logger = require('./config/winston')(__filename)
var baseconfig = require('./config/config')
var redis = require('redis');
//const redisUrl = 'redis://127.0.0.1:6379';
const redisUrl = 'redis://'+baseconfig.redis_host+':'+baseconfig.redis_port;
console.log('[redis_url] ' + redisUrl);
var client = redis.createClient({
    url: redisUrl,
    retry_strategy: function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands
            // with a individual error
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    }
});
const util = require('util');
client.get = util.promisify(client.get);
client.keys = util.promisify(client.keys);

console.log(tag.redis + ' creating instance and connection');
client.on('connect', function() {
    logger.info(tag.redis+'client connected');
});
client.on('error', function(err){
    logger.info(tag.redis+'client error '+err);
});
client.on('ready', function(err) {
    logger.info(tag.redis+'client ready established '+err);
});
client.on('reconnecting', function(err) {
    logger.info(tag.redis+'client timeout and reconnecting with '+ JSON.stringify(err));
});
client.on('end', function() {
    logger.info(tag.redis+'client '+ 'established Redis server connection has closed');
});
client.on('warning', function() {
    logger.info(tag.redis+'client warning');
});


module.exports = client