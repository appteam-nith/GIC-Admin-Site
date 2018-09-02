var socket = io();

jQuery('#submit').on('click', function () {
  var club = jQuery('#clubName').val();
  socket.emit('input', club);
  socket.on('redirect', function (data) {
    window.location.href = data.location;
  });
});
