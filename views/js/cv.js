var socket = io();
var step = 10;
var finalVal = 1


$(".slider").each(function() {
    var self = $(this);
    var slider = self.slider({
        create: function() {
            self.find('.text strong').text(self.slider('value'));
            setPathData(self.find('.smiley').find('svg path'), self.slider('value'));
        },
        slide: function(event, ui) {
            self.find('.text strong').text(ui.value);
            setPathData(self.find('.smiley').find('svg path'), ui.value);
        },
        range: 'min',
        min: 1,
        max: step,
        value: 1,
        step: 1
    });
});

function setPathData(path, value) {
    var firstStep = 6 / step * value;
    var secondStep = 2 / step * value;
    finalVal = value;
    path.attr('d', 'M1,' + (7 - firstStep) + ' C6.33333333,' + (2 + secondStep) + ' 11.6666667,' + (1 + firstStep) + ' 17,' + (1 + firstStep) + ' C22.3333333,' + (1 + firstStep) + ' 27.6666667,' + (2 + secondStep) + ' 33,' + (7 - firstStep));
}


$('#submit').on('click', function () {
  var comments = jQuery('#comments').val();
  var rating = finalVal;
  socket.emit('rating', {rating, comments});

  window.location.href="/club"
});
