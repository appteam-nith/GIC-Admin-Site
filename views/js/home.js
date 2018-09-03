var socket = io();

jQuery('#submit').on('click', function () {
  var club = jQuery('#clubName').val();
  var pass = jQuery('#pass').val();
  socket.emit('input', club+";"+pass);
  socket.on('redirect', function (data) {
    window.location.href = data.location;
  });
});

socket.on('error1', function () {
  alert('Sorry, we don\'t seem to have any club with that name. \nCheck the spelling, maybe');
});

socket.on('wrongPassword', function () {
  return alert(`Sorry, it's the wrong password!`)
});
