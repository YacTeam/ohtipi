const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');

const config = {
    http_port: '9098',
    socket_port: '9097'
};

// Http server
const app = express();
const server = require('http').Server(app);
let _wss;

const createWebServer = () => {
    server.listen(config.http_port);

    const wss = new WebSocket.Server({
        port: config.socket_port
    });

    app.use(bodyParser.urlencoded({
        extended: false
    }));

    wss.getUniqueID = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4() + '-' + s4();
    };

    wss.on('connection', function connection(ws, req) {
        ws.id = wss.getUniqueID();

        ws.on('close', function close() {
            // console.log('Client disconnected.');
        });

        ws.on('message', function incoming(recieveData) {
            sendAll(recieveData);
        });

        _wss = wss;

        function sendAll(data) {
            data = JSON.stringify(data);
            wss.clients.forEach(function each(client) {
                client.send(data);
            });
        }
    });
}

const emitToClients = (data) => {
    console.log("emitting to clients:", data)
    data = JSON.stringify(data);
    if (_wss) _wss.clients.forEach(function each(client) {
        client.send(data);
    });
}

module.exports = {
    createWebServer,
    emitToClients
}