var events = require('events'),
    util = require('util'),
    dgram = require('dgram'),
    net = require('net'),
    dns = require('dns')
    ;

function Socket () {
    events.EventEmitter.call(this);

    this.bufferSize = 0;
    this.bytesRead = 0;
    this.bytesWritten = 0;

    this._writeBuffers = [];
    this._writeBuffers.i = 0;
}

util.inherits(Socket, events.EventEmitter);

Socket.prototype._ended = false;
Socket.prototype._udpSocket = null;
Socket.prototype._encoding = null;
Socket.prototype._timeout_ms = null;
Socket.prototype._timeoutId = null;

Socket.prototype.bufferSize = null;
Socket.prototype._dataBuffers = null;

Socket.prototype._writeBuffers = null;

Socket.prototype.bytesRead = null;
Socket.prototype.bytesWritten = null;

Socket.prototype.localAddress = null;
Socket.prototype.localPort = null;

Socket.prototype.remoteAddress = null;
Socket.prototype.remoteFamily = null;
Socket.prototype.remotePort = null;

Socket.prototype.address = function(){
    return this._udpSocket.address();
};

Socket.prototype.connect = function(port, host, connectListener){
    var options = port;

    if (typeof options !== 'object') {
        options = {port: port};

        if (typeof host === 'function') connectListener = host;
        else options.host = host;

        return this.connect(options, connectListener);
    }

    connectListener = host;

    var family = net.isIP(options.host),
        self = this;

    function looked(err, ip, family) {
        self.emit('lookup', err, ip, family);

        var udpSocket = self._udpSocket = dgram.createSocket('udp' + family);

        function write (buf, doneListener) {
            udpSocket.send(buf, 0, buf.length, options.port, ip, doneListener);
        }

        function error (err){
            self.emit('error', err);

            self._udpSocket.close();
        }

        function close () {
            self._udpSocket = null;

            self.removeListener('_write', write);

            self.emit('close');
        }

        self.on('_write', write);

        udpSocket.once('error', error);
        udpSocket.on('message', self._data.bind(self));
        udpSocket.once('close', close);

        if (connectListener) connectListener();

        self.emit('connect');
    }

    if (!family) dns.lookup(options.host, looked);
    else looked(null, options.host, family);
};

Socket.prototype._data = function(buf){
    var self = this;

    if (this._timeout_ms) {
        clearTimeout(this._timeoutId);
        this._timeoutId = setTimeout(function () { self.emit('timeout') }, this._timeout_ms);
    }

    this.bytesRead += buf.length;

    if (this._dataBuffers) this._dataBuffers.push(buf);
    else this.emit('data', this._encoding ? buf.toString(this._encoding) : buf);
};

Socket.prototype.pause = function(){
    if (!this._dataBuffers) {
        this._dataBuffers = [];
        this._dataBuffers.i = 0;
    } else {
        clearImmediate(this._dataBuffers.resumeId);
        this._dataBuffers.resumeId = null;
    }
};

Socket.prototype.resume = function(){
    if (this._dataBuffers) {
        var self = this;

        function emit() {
            if (self._dataBuffers.i < self._dataBuffers.length) {
                var buf = self._dataBuffers[self._dataBuffers.i];

                self._dataBuffers[self._dataBuffers.i++] = null;

                self.emit('data', self._encoding ? buf.toString(self._encoding) : buf);

                self.bufferSize -= buf.length;

                self._resumeId = setImmediate(emit);
            } else self._dataBuffers = null;
        }

        this._dataBuffers.resumeId = setImmediate(emit);
    }
};

Socket.prototype.ref = function(){
    this._udpSocket.ref();

    return this;
};

Socket.prototype.unref = function(){
    this._udpSocket.unref();

    return this;
};

Socket.prototype.setEncoding = function(encoding) {
    this._encoding = encoding;
};

Socket.prototype.setTimeout = function(timeout_ms, timeoutListener) {
    clearTimeout(this._timeoutId);

    if (timeout_ms) {
        this._timeout_ms = timeout_ms;
        this._timeoutId = setTimeout(function(){ self.emit('timeout') }, timeout_ms);

        if (timeoutListener) this.once('timeout', timeoutListener);
    }
};

Socket.prototype.write = function(data, encoding, doneListener){
    if (this._ended) throw new Error('Socket is ended');

    if (typeof encoding === 'function') {
        doneListener = encoding;
        encoding = null;
    }

    if (typeof data === 'string') data = new Buffer(data, encoding);

    this._writeBuffers.push([data, doneListener]);
    this.bufferSize += data.length;

    if (this._writeBuffers.length > 1) return;

    var self = this, listener;

    data = [];

    function write (err) {
        if (err) {
            self._writeBuffers = [];
            self._writeBuffers.i=0;

            if (listener) listener(err);
            else self.emit('error', err);

            return;
        }

        self.bytesWritten += data.length;

        if (listener) setImmediate(listener);

        data = self._writeBuffers[ self._writeBuffers.i ];

        if (!data) {
            self._writeBuffers = [];
            self._writeBuffers.i = 0;
            return;
        }

        self._writeBuffers[ self._writeBuffers.i++ ] = null;

        listener = data[1];

        data = data[0]

        self.emit('_write', data, write);
    }

    write();
};

Socket.prototype.end = function(data, encoding) {
    if (data != null) this.write(data, encoding);

    this._ended = true;
};

Socket.prototype.destroy = function(){
    if (this._udpSocket) this._udpSocket.close();
    else this.emit('close');
};

module.exports = Socket;
