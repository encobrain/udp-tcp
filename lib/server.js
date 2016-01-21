var events = require('events'),
    util = require('util'),
    net = require('net'),
    dns = require('dns'),
    dgram = require('dgram'),

    Socket = require('./socket')
    ;

function Server (options) {
    events.EventEmitter.call(this);

    options = options || {};

    this._options = options;

    this._connections = 0;
    this._inSockets = {};
}

util.inherits(Server, events.EventEmitter);

Server.prototype._connections = null;
Server.prototype._inSockets = null;
Server.prototype._options = null;
Server.prototype._udpSocket = null;
Server.prototype.maxConnections = null;


Server.prototype.address = function(){
    return this._udpSocket.address();
};

Server.prototype.close = function(closeListener) {
    if (this._udpSocket) this._udpSocket.close(closeListener);
};

Server.prototype.getConnections = function(callback){
    setImmediate(callback, this._connections);
};

Server.prototype.listen = function(port, host, listeningListener){
    var options = port;

    if (typeof options != 'object') {
        options = {port: port};

        if (typeof host === 'function') listeningListener = host;
        else options.host = host;

        return this.listen(options, listeningListener);
    }

    listeningListener = host;

    options.host = options.host || '0.0.0.0';

    var family = net.isIP(options.host),
        self = this
    ;

    function looked(err, ip, family) {
        if (err) return self.emit('error', err);

        var socket =  self._udpSocket = dgram.createSocket('udp' + family);

        function error (err){
            self.emit('error', err);

            self._udpSocket.close();
        }

        function close () {
            self._udpSocket = null;

            self.emit('close');
        }

        socket.once('listening', function(){ self.emit('listening') });

        socket.once('error', error);
        socket.on('message', self._udpSocketMessage.bind(self));
        socket.once('close', close);

        socket.bind({
            port: options.port,
            address: ip,
            exclusive: options.exclusive || false
        }, listeningListener);
    }

    if (!family) dns.lookup(options.host, looked);
    else looked(null, options.host, family);
};

Server.prototype._udpSocketMessage = function(buf, peerInfo) {
    var id = peerInfo.address + ':'+ peerInfo.port,
        socket = this._inSockets[id],
        self = this;

    if (!socket) {
        if (this.maxConnections && this._connections >= this.maxConnections) return;

        socket = this._inSockets[id] = new Socket();

        socket.remoteAddress = peerInfo.address;
        socket.remoteFamily = peerInfo.family;
        socket.remotePort = peerInfo.port;

        function close () {
            self._inSockets[id] = null;

            self._connections--;
        }

        function write (buf, doneListener) {
            self._udpSocket.send(buf, 0, buf.length, peerInfo.port, peerInfo.address,
                doneListener || function(err) { if (err) socket.emit('error', err); });
        }

        socket.once('close', close);

        socket.on('_write', write);

        this._connections++;

        if (this._options.pauseOnConnect) socket.pause();

        this.emit('connection', socket);
    }

    socket._data(buf);
};

Server.prototype.ref = function(){
    this._udpSocket.ref();

    return this;
};

Server.prototype.unref = function(){
    this._udpSocket.unref();

    return this;
};



module.exports = Server;
