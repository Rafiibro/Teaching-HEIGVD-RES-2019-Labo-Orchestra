const dgram = require('dgram');
const s = dgram.createSocket('udp4');
const protocol = require("./protocol");
var net = require('net');
var moment = require('moment');

var musicians = [];

s.bind(protocol.PROTOCOL_PORT, function() {
    console.log("Joining multicast group");
    s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

s.on('message', function (msg, source) {
    console.log("Data has arrived: " + msg + ". Source IP: " + source.address + ". Source port: " + source.port);

    var jsonParser = JSON.parse(msg);

    for (var i = 0; i < musicians.length; i++) {
        if (jsonParser.uuid === musicians[i].uuid) {
            musicians[i].activeSince = jsonParser.activeSince;
            return;
        }
    }
    musicians.push(jsonParser);
});

var tcpServer = net.createServer();
tcpServer.listen(protocol.PROTOCOL_PORT);
console.log("TCP Server now running on port : " + protocol.PROTOCOL_PORT);

tcpServer.on('connection', function (socket) {
    checkInstruments();
    socket.write(JSON.stringify(musicians));
    socket.destroy();
});

function checkInstruments() {
    for (var i = 0; i < musicians.length; i++) {
        if (moment().diff(musicians[i].activeSince) > protocol.PROTOCOL_MAX_DELAY) {
            console.log('Mucisian removed : ' + JSON.stringify(musicians[i]));
            musicians.splice(i, 1);
        }
    }
}