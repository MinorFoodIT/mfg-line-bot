var logger = require('./config/winston')(__filename);
//QR code


const Client = require('@line/bot-sdk').Client;
const line_client = new Client({
    /** LINE **/
    channelAccessToken: 'bxb4uM+nNHC/fV/3ngqTExH73gKI8OneMHqWOoEQ4/FxsAD1/N1mhv4Y8CXU55ZA8M9GKjGcxmiwJG29qvfb2h7BFIhbpEqEHuxIuioFTu547lcII1SoNyyh9erdhz4yPkhFhgCjQD5VVO1DTrsGlQdB04t89/1O/w1cDnyilFU=',
    channelSecret: 'f0deed0c969dd45ebbf5d3b8a679bd81'
});

async function replyQR(textToGen, replyToken) {
    const fs = require('fs');
    const qrcode = require('qrcode');

    logger.info('replyQR(' + textToGen + ')');
    logger.info('replyToken ' + replyToken);
    //const res = await qrcode.toDataURL(String(textToGen));
    //const res = await qrcode.toFile(process.cwd()+ '/public/images/qr/'+textToGen+'.png',String(textToGen));
    // console.log(process.cwd());
    // console.log(__dirname);
    // console.log(__filename);
    let imageFileCreated = './public/' + textToGen + '.png';
    const res = await qrcode.toFile(imageFileCreated, String(textToGen));

    // fs.readdir(__dirname+'/public', (err, files) => {
    //   files.forEach(file => {
    //     console.log(file);

    //   });
    // });

    //logger.info(res);
    //fs.writeFileSync('./'+textToGen+'.png', `<img src="${res}">`);
    logger.info('Wrote file  ./public/' + textToGen + '.png');

    let content1 = {
        "type": "image",
        "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/linecorp_code_withborder.png",
        "aspectRatio": "1:1",
        //"aspectMode": "cover",
        "size": "5xl",
        "offsetTop": "-25px"
    }
    content1.url = 'https://line-bot.dolfinminor.net/' + textToGen + '.png';

    let content2 =  {
        "type": "text",
        "text": textToGen,
        "weight": "bold",
        "align": "center",
        "offsetTop": "-30px"
    };

    let content3 =  {
        "type": "text",
        //"text": "1.โปรโมชั่นนี้สำหรับลูกค้าที่เป็นสมาชิก Line Friend ของเบอร์เกอร์คิงเท่านั้น \n2.ขอสงวนสิทธิ์ 1 เบอร์ ต่อ 1 สิทธิ์เท่านั้น \n3.โปรโมชั่นนี้ใช้ได้ทุกสาขายกเว้นสาขาท่าอากาศยานและบริการ Delivery \n4.กรุณาแสดงคูปองส่วนลดแก่พนักงานทุกครั้งเพื่อรับสิทธิพิเศษนี้ \n5.โปรโมชั่นนี้ตั้งแต่วันที่ 1 ก.ค 63 – 15 ก.ย 63 \n6.บริษัทฯขอสงวนสิทธิ์ในการเปลี่ยนแปลงโดยมิต้องแจ้งให้ทราบล่วงหน้า",
        //"text": "1.โปรโมชั่นนี้สำหรับลูกค้าที่เป็นสมาชิก Line Friend ของเบอร์เกอร์คิงเท่านั้น \n2.ขอสงวนสิทธิ์ 1 เบอร์ ต่อ 1 สิทธิ์เท่านั้น \n3.โปรโมชั่นนี้สามารถแลกซื้อได้เฉพาะ ไอกรีมซันเดย์ ช็อกโกแลต เท่านั้น \n4.โปรโมชั่นนี้ใช้ได้ทุกสาขายกเว้นสาขาท่าอากาศยานและบริการ Delivery \n5.กรุณาแสดงคูปองส่วนลดแก่พนักงานทุกครั้งเพื่อรับสิทธิพิเศษนี้ \n6.โปรโมชั่นนี้ตั้งแต่วันที่ 15 ก.ย 63 – 15 พ.ย 63 \n7.บริษัทฯขอสงวนสิทธิ์ในการเปลี่ยนแปลงโดยมิต้องแจ้งให้ทราบล่วงหน้า",
        //"text": "1.โปรโมชั่นนี้สำหรับลูกค้าที่เป็นสมาชิก Line Friend ของเบอร์เกอร์คิงเท่านั้น \n2.ขอสงวนสิทธิ์ 1 เบอร์ ต่อ 1 สิทธิ์เท่านั้น \n3.โปรโมชั่นนี้สามารถแลกซื้อได้เฉพาะ น้ำองุ่น เท่านั้น \n4.โปรโมชั่นนี้ใช้ได้ทุกสาขายกเว้นสาขาท่าอากาศยานและบริการ Delivery \n5.กรุณาแสดงคูปองส่วนลดแก่พนักงานทุกครั้งเพื่อรับสิทธิพิเศษนี้ \n6.โปรโมชั่นนี้ตั้งแต่วันที่ 16 ธ.ค 63 – 31 ม.ค 64 \n7.บริษัทฯขอสงวนสิทธิ์ในการเปลี่ยนแปลงโดยมิต้องแจ้งให้ทราบล่วงหน้า",
        "text": "1.โปรโมชั่นนี้สำหรับลูกค้าที่เป็นสมาชิก Line Friend ของเบอร์เกอร์คิงเท่านั้น \n2.ขอสงวนสิทธิ์ 1 เบอร์ ต่อ 1 สิทธิ์เท่านั้น \n3.โปรโมชั่นนี้สามารถแลกซื้ออกไก่ไร้กระดูก 3 ชิ้น ฟรี 3 ชิ้น \n4.โปรโมชั่นนี้ใช้ได้ทุกสาขายกเว้นสาขาท่าอากาศยานและบริการ Delivery \n5.กรุณาแสดงคูปองส่วนลดแก่พนักงานทุกครั้งเพื่อรับสิทธิพิเศษนี้ \n6.โปรโมชั่นนี้ตั้งแต่วันที่ 1 มี.ค 64 – 30 ม.ย 64 \n7.บริษัทฯขอสงวนสิทธิ์ในการเปลี่ยนแปลงโดยมิต้องแจ้งให้ทราบล่วงหน้า",
        "size": "sm",
        "color": "#666f86",
        "wrap": true,
        "offsetTop": "-25px"
    };

    let contentMessage =
    {
        "type": "bubble",
        "styles": {
            "header": {
              "backgroundColor": "#aaaaff"
            }
        },
        "header": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "text",
                    //"text": "แลกซื้อ เฟรนช์ฟรายส์ขนาดเล็ก 1 บาท",
                    //"text": "แลกซื้อ ไอกรีมซันเดย์ ช็อกโกแลต 9 บาท",
                    //"text": "แลกซื้อ น้ำองุ่นเพียง 19 บาท",
                    "text": "แลกซื้อ อกไก่ไร้กระดูก 3 ชิ้น ฟรี 3 ชิ้น",
                    "size": "lg",
                    "color": "#ffffff",
                    "wrap": true,
                    "weight": "bold"
                }
            ]
        },
        "hero": {
            "type": "image",
            //"url": "https://ndev.1112delivery.com/promo/FF2-02-01.png",
            //"url": "https://ndev.1112delivery.com/promo/chocsundae-01.png",
            //"url": "https://ndev.1112delivery.com/promo/CD_Grape-01.png",
            "url": "https://line-bot.dolfinminor.net/promo/Chick3free3_01.png",
            "size": "full",
            "aspectRatio": "3:2"
        },
        "body": {
            "type": "box",
            "layout": "vertical",
            "spacing": "md",
            "contents": [
                
            ],
            "paddingTop": "0px"
        }
    }
    contentMessage.body.contents.push(content1);
    contentMessage.body.contents.push(content2);
    contentMessage.body.contents.push(content3);

    console.log('[bubble] body =>');
    console.log(contentMessage.body);

    let flexMessage = {
        "type": "flex",
        "altText": 'BurgerKingTH',
        "contents": {
            "type": "carousel",
            "contents": []
        }
    };
    flexMessage.contents.contents.push(contentMessage);

    line_client.replyMessage(replyToken, flexMessage)
        .then(() => {
            //status 200 ok
            logger.info('[REPLY] QR CODE SUCCESS ');
            // fs.unlink(imageFileCreated, (err) => {
            //     if (err) {
            //       logger.info('[Error] remove qr image file =>');
            //       console.error(err)
            //       return
            //     }
            //     //file removed
            //     logger.info('[Success] file removed');
            //   })
        })
        .catch((err) => {
            logger.info('[REPLY_ERROR] QR error =>');
            console.log(err);
        });

}

module.exports = replyQR;