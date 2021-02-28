var logger = require('./config/winston')(__filename)
var config = require('./config/config')
var tag = require('./config/tag')
const Agenda = require('agenda');
const MongoClient = require('mongodb').MongoClient;
const Store = require('./routes/line/bot.store.model');
const Order = require('./routes/line/bot.order.model');
const Admin = require('./routes/admin/admin.model');
var mysqldb = require('./mysql-client');

const orderCtrl = require('./routes/line/bot.order.controller');
var {Timestamp} = require('mongodb');

var moment = require('moment');
var _ = require('lodash');

const agenda = new Agenda()

/* DATE-TIMESTAMP
var begin = moment().add(-5,'minutes')
var end = moment().add(5,'minutes')
logger.info(typeof begin)
logger.info(new Date(begin))
logger.info(new Timestamp(new Date(begin),0))
logger.info(new Timestamp((new Date(begin)).getTime()/1000,0))
logger.info(typeof end)
logger.info(new Date(end))
logger.info(new Timestamp(new Date(end),0))
logger.info(new Timestamp((new Date(end)).getTime(),0))
logger.info(new Timestamp((new Date(end)).getTime()/1000,0))
var endtime = (new Date(end)).getTime()
logger.info(new Date(endtime))
*/

function futureOrder(url){
    agenda.database( url ,'agendaJob');
        //agenda.processEvery('1 minute'); //agenda.maxConcurrency(2); //agenda.defaultConcurrency(2);
    agenda.define('futureOrderBeforeDuetime', async function(job, done) {
        //logger.info(tag.trigger_futureOrder+'job is running')
        Order.getUnAlertedBetweenMinutesTime(config.alert_future_min)
            .then( async (future) => {
                logger.info(tag.trigger_futureOrder+future.length+' docket(s) found')
                if(future.length > 0) {
                    await Promise.all(future.map( async (docket) => {
                        await orderCtrl.pushOnLineFutureOrder(docket.site, docket, 1)
                        Order.find({_id:docket._id})
                            .deleteMany().exec().then(()=>{})
                     }))
                }
                done()
            })
            .catch( (err) =>{
                logger.info(tag.trigger_futureOrder+err)
                done()
            })

    });

    agenda.define('clearorder', async function(job, done) {
        //logger.info(tag.trigger_housekeeping+'job is running')
        Order.find({createdAt: {'$lte':moment().add(-1,'days').format('YYYY-MM-DDTHH:mm:ss.SSS') } ,alerted: true })
            .deleteMany().exec()
            .then((doc) =>{
                logger.info(tag.trigger_housekeeping+doc.deletedCount+' docket(s) removed')
            })

        //Order.find({createdAt: {'$lte':moment().add(-2,'hours').format('YYYY-MM-DDTHH:mm:ss.SSS') }})
        done()
    });


    agenda.define('clearorderunalert', async function(job, done) {
        //logger.info(tag.trigger_housekeeping+'job is running')
        Order.find({createdAt: {'$lte':moment().add(-1,'days').format('YYYY-MM-DDTHH:mm:ss.SSS') } ,alerted: false })
            .deleteMany().exec()
            .then((doc) =>{
                logger.info(tag.trigger_housekeeping+'past 1 days '+doc.deletedCount+' docket(s) removed')
            })
        done()
    });

    agenda.define('futuremorning', async function(job, done) {
        //logger.info(tag.cached_future_morning+'job is running')
        Order.find({alertDate: {'$lte':moment().add(5,'minutes').format('YYYY-MM-DDTHH:mm:ss.SSS')} ,alerted:false ,future:true} )
            .exec()
            .then( async (future) => {
                logger.info(tag.cached_future_morning+future.length+' docket(s) found')
                if(future.length > 0) {
                    await Promise.all(future.map( async (docket) => {
                        var now = moment()
                        var due = moment(docket.alertDate)
                        var duration = moment.duration(now.diff(due));
                        if(duration.asMinutes() <= 15){
                            await orderCtrl.pushOnLineFutureOrder(docket.site, docket, 1)
                            Order.find({_id:docket._id})
                                .deleteMany().exec().then(()=>{})
                        }else{
                            Order.find({_id:docket._id})
                                .deleteMany().exec().then(()=>{})
                        }
                    }))
                }
                done()
            })
            .catch( (err) =>{
                logger.info(tag.cached_future_morning+err)
                done()
            })
    });

    agenda.define('ordermonitoring',async function (job, done) {
         Admin.getMonitor()
            .then(admin =>{
                console.log(JSON.stringify(admin))
                if(admin.feature === 'monitor' && admin.enable){
                     orderCtrl.refreshOrderStatus()
                }
                done()
            })
            .catch(err => done())
    });

    /* Use sent mail instead
    agenda.define('ordercouldnotsent',async function (job, done) {
        await orderCtrl.refreshOrderNotSent()
        done()
    });
    */

    agenda.define('cleardb',async function (job, done) {
        mysqldb((err, connection) => {
            connection.query('DELETE FROM orders where DATE(created_date) < ?', [moment().format('YYYY-MM-DD')], function (error, results, fields) {
                if (error) {
                    logger.info('[Delete orders error] ' + error)
                }
                connection.release();
            })
        })
    });

    agenda.define('clearQR',async function (job, done) {
        logger.info('[JOB] clearQR started');
        const path = require('path');
        const fs = require('fs');
        fs.readdir(__dirname+'/public', (err, files) => {
            files.forEach(file => {
                logger.info('[File] '+file + ' | '+ path.extname(file).toLowerCase()) ;
                if(path.extname(file).toLowerCase() === '*.png'){
                    logger.info('[clearQR] '+file);

                    let imageFileCreated = './public/'+file;
                    fs.unlink(imageFileCreated, (err) => {
                        if (err) {
                          logger.info('[Error] remove qr image file =>');
                          console.error(err)
                          return
                        }else{
                          //file removed
                          logger.info('[Success] file '+imageFileCreated+' removed');
                        }
                      })
                }
            });
        });

    });

    agenda.on('ready', async function() {
        await agenda.start();
        await agenda.every('5 minutes', ['futureOrderBeforeDuetime','clearorder']);
        var interval = config.monitoring_time_thershold.toString()+' minutes';
        await agenda.every(interval,['ordermonitoring'])
        //await agenda.every( '2 hours', ['ordercouldnotsent'])
        await agenda.every('15 0 30 * *',['cleardb']);
        await agenda.every('15 0 * * *',['clearorderunalert']);
        await agenda.every('30 0 * * *',['futuremorning']); //Since host use utc will start 00:30 that mean 07:00 +7:00
        await agenda.every('10 0 * * *',['clearQR']);
        await agenda.every('10 8 * * *',['clearQR']);
        //await agenda.every('0 6 * * *','futuremorning');//agenda.schedule(new Date(Date.now() + 10000), 'clearorder');
    });
}

function viewJob(req, res, next){
    logger.info('To view processor job running')
    //agenda.on('ready', function() {
        //logger.info('agenda is started')
        agenda.jobs()
            .then( jobs =>{
                //logger.info('found jobs')
                var Jobs = [];
                jobs.map(job => {
                    Jobs.push(job.agenda.attrs)
                })
                res.json(jobs)
            })
            .catch(err => {
                //const apiErr = new APIError(err)
                logger.error(err.message)
                next(err)
            })
    //})

}

module.exports = {futureOrder,viewJob}