var udptcp = require('./index'),
    dgram = require('dgram')
;


var server = new udptcp.Server();

function error (error) {
    console.log('Server error:', error);
}

function close () {
    console.log('Server closed');
}

function listening () {
    console.log('Server listening on', server.address());

    var socket = new udptcp.Socket();

    function close () {
        console.log('Socket closed');
    }

    function error (error) {
        console.log('Socket error', error);
    }

    function connect() {
        socket.write('Hello world');
    }

    function data (data) {
        console.log('Socket received data', data.toString());
    }


    socket.once('close', close);
    socket.once('error', error);
    socket.once('connect', connect);

    socket.on('data', data);

    socket.connect(1234, 'localhost');
}

var id = 0;

function connection (socket) {

    socket.__id = id++;

    console.log('Client connected');

    function error (error) {
        console.log('Server socket error:', error);
    }

    function close () {
        console.log('Server socket closed');
    }

    function data (buf) {
        console.log('Client ' + socket.__id, 'data:', buf.toString());

        socket.write('Hello client! ' + buf.toString());
    }

    socket.on('data', data);
    socket.once('error', error);
    socket.once('close', close);
}

server.once('listening', listening);
server.on('connection', connection);
server.once('close', close);
server.once('error', error);

server.listen(1234, 'localhost');







