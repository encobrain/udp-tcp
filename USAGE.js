var udptcp = require('udp-tcp');

//  ************ Server ************

var options = {
    pauseOnConnect: true
}

var server = udptcp.createServer([options], [connectionListener]);

var server = new udptcp.Server([options]);

server.on('listening', function(){});
server.on('error', function(error){});
server.on('connection', function (socket){});
server.on('close', function(){});

server.maxConnections = 5;

server.ref();  // return server
server.unref(); // return server

server.address();  // {port:0, family: 'IPv4', address: '0.0.0.0'}

server.close([closeListener]);

server.getConnections(function (err, count){});

server.listen(port, [host], [listeningListener]);

var options = {
    port: 0,
    host: '0.0.0.0',
    exclusive: true|false
};

server.listen(options, [listeningListener]);

// ************ Socket ************

var socket = new udptcp.Socket();

socket.on('data', function(data){});
socket.on('error', function(error){});
socket.on('lookup', function(error, address, family){});
socket.on('connect', function(){});
socket.on('close', function(){});
socket.on('timeout', function(){});

socket.bufferSize; // in bytes
socket.bytesRead;
socket.bytesWritten;

socket.remoteAddress; // IP
socket.remotePort;   // port
socket.remoteFamily; // IPv4 | IPv6

socket.address(); // {port:0, family: 'IPv4', address: '0.0.0.0'}

socket.connect(port, [host], [connectListener])

var options = {
    port: 0,
    host: '0.0.0.0'
};

socket.connect(options, [connectListener]);

socket.destroy();

socket.end([data], [encoding]);

socket.pause();
socket.resume();

socket.ref();
socket.unref();

socket.setEncoding(encoding); // null removes encoding

socket.setTimeout(timeout_ms, [timeoutListener]);

socket.write(buffer, [encoding], [doneListener]);

// internal usage

socket._data(buffer); // to socket

socket.on('_write', function(bufer, doneListener){}); // from socket



