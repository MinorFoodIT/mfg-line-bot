var os = require('os');
var logger = require('./config/winston')(__filename)
var tag = require('./config/tag')
var mongoose = require('mongoose');
const Store = require('./routes/line/bot.store.model');
const Order = require('./routes/line/bot.order.model');
const Admin = require('./routes/admin/admin.model');

var MongoMemoryServer = require('mongodb-memory-server');

const storeFolder = './stores/';
const orderFolder = './orders/';
const futureFolder = './future/';
const fs = require('fs');

const fileHandler = require('./routes/helpers/FileHandler')

var moment = require('moment');
var dateNow = moment().format('YYYY-MM-DD');

var agenda = require('./agendaDB');
var mysqldb = require('./mysql-client');
var client = require('./redis-client');

console.log('[Deploy] build '+moment());
/**
 * In memory database
 */

/*
const mongod = new MongoMemoryServer.MongoMemoryServer({
    instance: {
        port: 10050, // by default choose any free port
        ip: '127.0.0.1', // by default '127.0.0.1', for binding to all IP addresses set it to `::,0.0.0.0`,
        dbName: 'IMDB', // by default generate random dbName
        dbPath: 'temp', // by default create in temp directory
        //storageEngine: 'ephemeralForTest', // by default `ephemeralForTest`, available engines: [ 'devnull', 'ephemeralForTest', 'mmapv1', 'wiredTiger' ]
        //debug: false, // by default false
        //replSet: string, // by default no replica set, replica set name
        //auth: false, // by default `mongod` is started with '--noauth', start `mongod` with '--auth'
        //args: string[], // by default no additional arguments, any additional command line arguments for `mongod` `mongod` (ex. ['--notablescan'])
    }

    binary: {
        version: 'lastest', // by default 'latest'
        downloadDir: 'node_modules/.cache/mongodb-memory-server/mongodb-binaries', // by default node_modules/.cache/mongodb-memory-server/mongodb-binaries
        platform: os.platform(), // by default os.platform()
        arch: os.arch(), // by default os.arch()
        debug: false, // by default false
        checkMD5: false, // by default false OR process.env.MONGOMS_MD5_CHECK
        systemBinary: 'process.env.MONGOMS_SYSTEM_BINARY', // by default undefined or process.env.MONGOMS_SYSTEM_BINARY
    },

    debug: false, // by default false
    autoStart: true, // by default true

});
*/
/*
{
    instance: {
        port: 10050,
        ip: '127.0.0.1',
        dbName: 'IMDB',
        dbPath: 'temp',
        storageEngine: `devnull`, // by default `ephemeralForTest`, available engines: [ 'devnull', 'ephemeralForTest', 'mmapv1', 'wiredTiger' ]
        debug: false, // by default false
        //replSet: 'no', // by default no replica set, replica set name
        auth: false // by default `mongod` is started with '--noauth', start `mongod` with '--auth'
        //args: string[], // by default no additional arguments, any additional command line arguments for `mongod` `mongod` (ex. ['--notablescan'])
    },
    debug: true,
    autoStart: true

}
*/
mongoose.Promise = Promise;

const mongod = new MongoMemoryServer.MongoMemoryServer();

const mongooseOpts = { // options for mongoose 4.11.3 and above
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    useNewUrlParser: true,
};

function defindStore(){
    return new Promise(
        (resolve, reject) => {
            const StoreSchema = new mongoose.Schema({
                site: {
                    type: String,
                    required: true
                },
                groupId: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            });

            StoreSchema.method({
            });

            try{
                resolve(StoreSchema);
            }catch(err){
                reject(err)
            }
        }
    );
}

mongod.getConnectionString().then((mongoUri) => {
    logger.info('[Mongo] connection string '+mongoUri);
    
    mongoose.connect(mongoUri, mongooseOpts);
    mongoose.connection.on('error', () => {
        throw new Error(`Mongoose: unable to connect to database: ${mongoUri}`);
    });
    mongoose.connection.on('connected', () => {
        logger.info(tag.mongoose+'cached connection created')
            if (!fs.existsSync(storeFolder)){
                fs.mkdirSync(storeFolder);
            }
            if (!fs.existsSync(futureFolder)){
                fs.mkdirSync(futureFolder);
            }
                //console.info(mongoose.connection.readyState)
             mysqldb((err,connection) => {
                connection.query('SELECT group_id , store_id ,store_name FROM sites' , function (error, results, fields){
                    if (error) {
                        logger.info('[Query all site error] '+error)
                    };

                    if(results.length == 0){
                        //load file
                        /*
                        * Deprecated not used store from file
                        *
                        * */
                        fs.readdir(storeFolder, (err, files) => {
                            Promise.all(
                                files.map(file => {
                                    //console.log(file);
                                    fileHandler.jsonReadFile(storeFolder+file)
                                        .then(storeGroup => {
                                            //instance model
                                            var store = new Store(
                                                {
                                                    site: storeGroup.storeId,
                                                    siteName: storeGroup.storeName,
                                                    groupId: storeGroup.groupId
                                                })

                                            var redisStore = {
                                                userId: "",
                                                groupId: storeGroup.groupId,
                                                type: "group",
                                                storeId: storeGroup.storeId,
                                                storeName: storeGroup.storeName
                                            }

                                            client.set(storeGroup.groupId,JSON.stringify(redisStore))

                                            store.save()
                                                .then(savedStore => {
                                                    logger.info(tag.mongoose+'load store '+storeGroup.storeId+',groupId '+storeGroup.groupId)
                                                    return null;
                                                })
                                                .catch(err => {
                                                    logger.error(tag.mongoose+'store inserted error '+err)
                                                    return null;
                                                })
                                                .finally(function(){return null;})
                                        })
                                        .catch(err => {
                                            logger.error(tag.mongoose+'store inserted error '+err)
                                        })
                                })
                            )
                        })

                    }else{
                        results.map(row =>{
                            var store = new Store(
                                {
                                    site: row.store_id,
                                    siteName: row.store_name,
                                    groupId: row.group_id
                                })
                            var redisStore = {
                                userId: "",
                                groupId: row.group_id,
                                type: "group",
                                storeId: row.store_id,
                                storeName: row.store_name
                            }
                            client.set(row.group_id,JSON.stringify(redisStore))

                            store.save()
                                .then(savedStore => {
                                    logger.info(tag.mongoose+'load store '+row.store_id+',groupId '+row.group_id)
                                    return null;
                                })
                                .catch(err => {
                                    logger.error(tag.mongoose+'store inserted error '+err)
                                    return null;
                                })
                                .finally(function(){return null;})
                        })

                        //logger.info(results[0].group_id)
                    }
                connection.release()
                });
            })

            var monitor = new Admin(
            {
                feature: 'monitor',
                enable: false
            })
            Admin.create(monitor)
                .then(logger.info(tag.mongoose+'monitor=false'))
                .catch(err => logger.log(tag.mongoose+'monitor=error'))

            /*
             * Deprecated not store order to file
             *//*
            fs.readdir(orderFolder, (err, folders) => {
                Promise.all(
                    folders.map(folder => {
                        fs.readdir(orderFolder+folder , (err, files) => {
                            Promise.all(
                            files.map(file => {
                                if(file.indexOf(dateNow) > -1){
                                    //load only current date
                                    fileHandler.jsonReadFile(orderFolder+folder+'/'+file)
                                        .then( listorder =>{
                                            listorder.map(order => {
                                                Order.create(order)
                                                    .then(logger.info(tag.mongoose+'insert order '+order.orderNumber))
                                                    .catch(err => logger.log(tag.mongoose+'order inserted error '+err))
                                            })
                                        })
                                        .catch(err => {
                                            logger.log(tag.mongoose+'order inserted error '+err)
                                        })
                                }
                            })
                            )
                        })
                    })
                ).then(
                    //assign job
                    agenda.clearHistoryOrder(mongoUri)
                )
            })
            */

        /*
            fs.readdir(futureFolder, (err, files) => {
                Promise.all(
                    files.map(file => {
                        fileHandler.jsonReadFile(futureFolder+file)
                            .then(future =>{
                                if(moment.duration(moment(future.alertDate).diff(moment())).asHours() > 24) {
                                    Order.create(future)
                                        .then(logger.info(tag.mongoose + 'load future order ' + future.orderNumber + ' alert date ' + future.alertDate))
                                        .catch(err => logger.log(tag.mongoose + 'load future order error ' + err))
                                }
                            })
                            .catch(err => {
                                logger.log(tag.mongoose+'load future order error '+err)
                            })
                    })
                ).then( () => {}
                )
            })
        */

        //JOB
        agenda.futureOrder(mongoUri);
    });
    mongoose.connection.on('disconnected', () => {
        logger.info(tag.mongoose+'connection disconnected')
    });

});


/**
 *
 * @returns {Promise<{port: number, dbName: string, dbPath: string, uri: string}>}
 */
/*
exports.url = async function () {
    const uri = await mongod.getConnectionString();
    const port = await mongod.getPort();
    const dbPath = await mongod.getDbPath();
    const dbName = await mongod.getDbName();

    return {uri,port,dbPath,dbName};
}
*/


exports.stop = function() {
    // you may stop mongod manually
    mongod.stop();
    return 'Mongoose: mongod cache stoped';
}


