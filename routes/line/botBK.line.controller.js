//const Order = require('./bot.order.model');
const helper = require('./../helpers/text.handler')
var logger = require('./../../config/winston')(__filename)
var tag = require('./../../config/tag');
var _ = require('lodash')
//var redis = require('redis')
//var client = require('./../../redis-client')
const https = require('https');
const axios = require('axios');
const agent = new https.Agent({  
    rejectUnauthorized: false
  });;

const YouDoNotHaveAutorized_onCoupon = 'คุณได้รับสิทธิ์แล้ว กรุณาโชว์โค้ดที่ได้รับก่อนหน้านี้';  

//Mysql
//var mysqldb = require('./../../mysql-client');

//QR code
const fs = require('fs');
const qrcode = require('qrcode');
const replyQR = require('./../../qrCode');
const Client = require('@line/bot-sdk').Client;
const line_client = new Client({
    /** LINE **/
    channelAccessToken: 'bxb4uM+nNHC/fV/3ngqTExH73gKI8OneMHqWOoEQ4/FxsAD1/N1mhv4Y8CXU55ZA8M9GKjGcxmiwJG29qvfb2h7BFIhbpEqEHuxIuioFTu547lcII1SoNyyh9erdhz4yPkhFhgCjQD5VVO1DTrsGlQdB04t89/1O/w1cDnyilFU=',
    channelSecret: 'f0deed0c969dd45ebbf5d3b8a679bd81'
});

var {middleware ,handlePreErr ,line_replyMessage ,line_pushMessage} = require('./../helpers/bkline.handler')
var joinmessage = require('../../config/flex/joinmessage');
var settingmessage = require('../../config/flex/reply_site_setting');

function setGroupObj(req){
    groupObj = req.body.events[0].source
    groupObj.storeId = ''
    groupObj.storeName = ''
    return groupObj;

}

function checkPrefix(prefix){
    var found = msgText.match(prefix)
    return found;
}

/**
 * Line webhook ,action from line account
 * @param err
 * @param req
 * @param res
 * @param next
 */

async function webhook(req,res){
    console.log('[BOT_LINE_B] webhook received');
    console.log(req.body.events);
    res.status(200).json(req.body.events)

    if(req.body.events[0].type == 'message'){
    //     logger.info('[BOT_LINE_B] event.type = message');
    //     // if( req.body.events[0].message.type == 'text') {
    //     //     if(checkPrefix('^(@store=|@site=)')){
    //     //     }else if(checkPrefix('^(@name=)')){
    //     //     }else if(checkPrefix('^(@report=)')){
    //     //     }
    //     // }
    // }else if(req.body.events[0].type == 'postback'){
       //logger.info('[BOT_LINE_B] event.type = postback');
       //let postback = req.body.events[0].postback;
       //let data = postback.data;  //postback.params.datetime
       //logger.info('[BOT_LINE_B] '+data)
       //if(data === 'promotion=FREE_FRENCHFIRES_1' || data.length > 0){
    }else if(req.body.events[0].type == 'follow'){
       //console.log('[Action] follow'); 
       let replyToken = req.body.events[0].replyToken;
       let userId = req.body.events[0].source.userId;
       let followTimestamp = req.body.events[0].timestamp;

      //  let greetingTxt = {
      //     "type":"text",
      //     "text": 'ขอบคุณที่เป็นเพื่อนกับเรา \nเตรียมพบกับโปรโมชั่นพิเศษ เฉพาะ Line Friend เร็วๆนี้'
      //  }  
       //line_client.replyMessage(replyToken, greetingTxt);

       if(true){
        let postData = {
            //"promotion": "BKLINE1",
            //"promotion": "BKLINE2",
            //"promotion": "BKLINE3",
            "promotion": "BKLINE4",
            "userToken": userId
        };   
        axios.post('https://bkline.minorfoodit.com/api/v1/promotion/acquired',postData,{ httpsAgent: agent ,timeout: 25000})
        .then( (resp) => {
          let respData = resp.data;
          console.log('[PROMOTION_ACQUIRED] '+JSON.stringify(respData)); 
          if(respData.code === ''){
            axios.post('https://bkline.minorfoodit.com/api/v1/promotion/request',postData,{ httpsAgent: agent ,timeout: 25000})
            .then( (resp2) => {
              let resp2Data = resp2.data;
              if(!helper.isNullEmptry(resp2Data.code)){
                let voucherCode = resp2Data.code;
                replyQR(voucherCode,replyToken)
                .catch(error => {
                    logger.info('[QR] Reply error');
                    logger.info(error.stack)
                });
              }
            }).catch((err2) => {
                console.log('[PROMOTION_REQUEST_ERROR] '+err2.message);
            })
          }else{
            let msgText = {
                "type":"text",
                "text": String(YouDoNotHaveAutorized_onCoupon)
            }  
            line_client.replyMessage(replyToken,msgText);
          }
        })
        .catch((err) => {
            console.log('[PROMOTION_ACQUIRED_ERROR] '+err.message);
        })
       }
    }
    //next(req,res)
    // req.body will be webhook event object
}

module.exports = { webhook ,middleware ,handlePreErr};