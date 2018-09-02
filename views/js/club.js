var socket = io();

socket.emit('getData');

socket.on('CVData', function (data) {
  console.log(data);
});
