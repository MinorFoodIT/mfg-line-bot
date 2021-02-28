const express   = require('express');
const lineBKCtrl  = require('./botBK.line.controller');

const bk_config = {
    /** LINE **/
    channelAccessToken: 'u49wjznc3MSuYVUmVm/rJCZ1+Pw8wXB3wYCOx6WRG8u/4y07PQo7EV/iLZZjcmyNOgcI9nVH93IWb6mko4XUmpivrujzYYq4AGksna31vnttF+CJta9ca8vNLV/12k0WLTT+ePDyJTWxpnH0TzQNRgdB04t89/1O/w1cDnyilFU=',
    channelSecret: '34300572b2e42246caf84d439b2bc6aa'
}

const jsonfile = require('jsonfile')
var path = require('path');

const router = express.Router();

/** absolute url is /api/bot/<route path> */
router.route('/webhook')
    .post(
        lineBKCtrl.middleware(bk_config),
        lineBKCtrl.handlePreErr,
        lineBKCtrl.webhook
        );

module.exports = router;