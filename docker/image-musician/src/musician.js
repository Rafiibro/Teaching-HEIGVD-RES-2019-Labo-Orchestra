var protocol = require('./protocol');
var moment = require('moment');
const dgram = require('dgram');
var uuid = require('uuid');
var s = dgram.createSocket('udp4');

const instruments = {
    piano: "ti-ta-ti",
    trumpet: "pouet",
    flute: "trulu",
    violin: "gzi-gzi",
    drum: "boum-boum"
};

var jsonSent = {
    uuid: uuid(),
    instrument: process.argv[2]
};

setInterval(emitSound, 1000);

function emitSound() {
    jsonSent.activeSince = moment();

    var message = JSON.stringify(jsonSent);

    s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function (err, bytes) {
        console.log(instruments[jsonSent.instrument] + ' message : ' + message);
    });
}