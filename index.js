var Socket = require('./lib/socket'),
    Server = require('./lib/server')
    ;

/**
 * Creates UDP server
 * @param {Object} [options]
 * <p>  @prop {Boolean} pauseOnConnect Pause all data events on connect?
 * @param {Function} [connectionListener]
 */
function createServer (options, connectionListener) {
    var server = new Server(options);

    if (connectionListener) server.on('connection', connectionListener);

    return server;
}

module.exports = {
    Server: Server,
    createServer: createServer,
    Socket: Socket
};
