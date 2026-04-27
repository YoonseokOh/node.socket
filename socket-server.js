'use strict';

module.exports = function attachSocketServer(server) {
  const io = require('socket.io')(server);

  io.sockets.on('connection', function(socket) {
    socket.emit('toclient', {
      msg: 'Welcome !'
    });

    socket.on('fromclient', function(data) {
      socket.broadcast.emit('toclient', data);
      socket.emit('toclient', data);
      console.log('Message from client :' + data.msg);
    });
  });

  return io;
};
