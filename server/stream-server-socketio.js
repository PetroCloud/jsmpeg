if (process.argv.length < 2) {
  console.log(
    'Usage: \n' +
    'node stream-server-socketio.js [<stream-port> <websocket-port>]'
  );
  process.exit();
}

function sendMagicBytes(io, room) {
  // Send magic bytes and video size to the newly connected socket
  // struct { char magic[4]; unsigned short width, height;}
  var streamHeader = new Buffer(8);
  streamHeader.write(STREAM_MAGIC_BYTES);
  streamHeader.writeUInt16BE(width, 4);
  streamHeader.writeUInt16BE(height, 6);
  // sending magic bytes
  io.to(room).emit('video-data', streamHeader);
}

var
  STREAM_PORT = process.argv[2] || 8082,
  HTTP_PORT = process.argv[3] || 8080,
  STREAM_MAGIC_BYTES = 'jsmp'; // Must be 4 bytes

var width = 320,
  height = 240;

// Socket IO server
var
  express = require('express'),
  app = express(),
  server = app.listen(HTTP_PORT, function () {
    console.log('connected to', HTTP_PORT)
  }),
  io = require('socket.io').listen(server),
  path = require('path');


var staticPath = path.join(__dirname, '..', '/public');
console.log('serving files from', staticPath);
app.use(express.static(staticPath));

// Websocket Server
io.on('connection', function (connectionSocket) {
  console.log('New WebSocket Connection (' + Object.keys(io.sockets.sockets).length + ' total)', connectionSocket.id);
  connectionSocket.on('close', function (closeSocket) {
    console.log('Disconnected WebSocket (' + Object.keys(io.sockets.sockets).length + ' total)', closeSocket.id);
  });

  connectionSocket.on('message', function (data) {
    console.log(data);
  });
});

var sessions = {};

var ioLive = io.of('/live');

// Live namespace
ioLive.on('connection', function (connectionSocket) {
  console.log('New WebSocket Connection (' + Object.keys(io.sockets.sockets).length + ' total)', connectionSocket.id);
  connectionSocket.on('close', function (closeSocket) {
    if (sessions[closeSocket.id]) {
      sessions[closeSocket.id] = false;
    }
    console.log('Disconnected WebSocket (' + Object.keys(io.sockets.sockets).length + ' total)', closeSocket.id);
  });

  connectionSocket.on('message', function (data) {
    console.log(data);
  });
  // Join room
  connectionSocket.on('join', function (room) {
    console.log('join', room, connectionSocket.id);
    connectionSocket.join(room);
    sendMagicBytes(ioLive, room);
  });
  // leave room
  connectionSocket.on('leave', function (room) {
    console.log('leave', room, connectionSocket.id);
    connectionSocket.leave(room);
  })
});

// HTTP Server to accept incomming MPEG Stream
require('http').createServer(function (request, response) {
  var params = request.url.substr(1).split('/');

  response.connection.setTimeout(0);

  width = (params[0] || 320) | 0;
  height = (params[1] || 240) | 0;

  console.log(
    'Stream Connected: ' + request.socket.remoteAddress +
    ':' + request.socket.remotePort + ' size: ' + width + 'x' + height
  );
  request.on('data', function (data) {
    ioLive.to('1234').emit('video-data', data);
  });

}).listen(STREAM_PORT);

console.log('Listening for MPEG Stream on http://127.0.0.1:' + STREAM_PORT + '/<width>/<height>');
console.log('Awaiting Socket.io connections on http://127.0.0.1:' + HTTP_PORT + '/socket.io');
