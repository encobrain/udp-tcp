var udptcp = require('udp-tcp');

//  ************ Server ************

var server = udptcp.createServer({
    pauseOnConnect: true
}, connectionListener);

var server = new udptcp.Server({
    pauseOnConnect: true
});

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

server.listen({
    port: 0,
    host: '0.0.0.0',
    exclusive: true|false
}, [listeningListener]);

// ************ Socket ************


