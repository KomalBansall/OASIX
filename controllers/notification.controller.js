const notificationModel = require ('../models/notification.model')
const OneSignal = require('onesignal-node');
var https = require ('https')

var sendNotification = async (notificatioinType ,deviceId) => {
    var headers = {
        "Content-Type": "application/json; charset=utf-8"
    };
    var options ={
        host: "onesignal.com",
        port: 123,
        path: "/",
        method: "POST",
        headers: headers
    };
    var message = {
        app_id: appId,
        contents: { en:  notificatioinType},
        include_player_ids: deviceId,
        data: { orders:notificatioinType   },
        headings: { en:  "Oasix" },
        body: { en:  notificatioinType }

    } 
    var req = await https.request(options, function (res) {
        res.on('data', function (message) {
            console.log("Response:");
            console.log(JSON.parse(message));
        });
    });
    req.on('error', function (e) {
        console.log("ERROR:");
        console.log(e);
    });

    req.write(JSON.stringify(message));
    req.end();

 }


 


 
module.exports={sendNotification};



// const client = new OneSignal.Client({
//     userAuthKey: "YOUR_USER_AUTH_KEY",
//     app: { appAuthKey: "YOUR_APP_AUTH_KEY", 
//     appId: "ONESIGNAL_APP_ID "}
// });