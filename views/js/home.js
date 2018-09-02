var socket = io();

jQuery('#submit').on('click', function () {
  var club = jQuery('#clubName').val();
  socket.emit('input', club);
  socket.on('redirect', function (data) {
    window.location.href = data.location;
  });
  socket.on('error1', function () {
    alert('Sorry, we don\'t seem to have any club with that name. \nCheck the spelling, maybe');
  });
});
