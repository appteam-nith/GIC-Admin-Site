var socket = io();

socket.emit('getData');
var rg = /(^\w{1}|\.\s*\w{1})/gi;
var fullData;

socket.on('CVData', function (club) {
  var data = club.cvs;
  var name = club.name;
  fullData = data;
  //process data
  var htmlData = `<div class="row row-margin">`, counter = 0;
  for(var i in data){
    counter++;
    htmlData += `<div class="col-md-4">
                    <a href=\"/cv/${name}/${i.toLowerCase().replace(" ", "")}\"><div class="card ind-card">
                      <h4>${data[i]["Name"].replace(rg, function(toReplace) {
    return toReplace.toUpperCase();})}</h4>
                      <h5>${i.toUpperCase().replace(" ", "")}</h5>
                      <h5>${data[i]["Branch"]}</h5>
                    </div></a>
                  </div>`;
    if(counter === 3) {
      counter = 0;
      htmlData += `</div>
                  <div class="row row-margin">`;
    }
  }
  jQuery('#container').append(htmlData);
});

// $(document).keypress(function (event) {
//   var keycode = (event.keycode ? event.keycode : event.which);
//   console.log(keycode);
//   if(keycode == '13') {
//     var roll = jQuery('#search').val();
//     console.log(roll);
//   }
// });

jQuery('#initSearch').on('click', function() {
  var roll = jQuery('#search').val();
  var htmlData = `<div class="row row-margin">`;
  var data = fullData;
  for(var i in fullData) {
    if(roll == i){

      htmlData += `<div class="col-md-4">
                      <a href=\"/cv/${name}/${i.toLowerCase().replace(" ", "")}\"><div class="card ind-card">
                        <h4>${data[i]["Name"].replace(rg, function(toReplace) {
      return toReplace.toUpperCase();})}</h4>
                        <h5>${i.toUpperCase().replace(" ", "")}</h5>
                        <h5>${data[i]["Branch"]}</h5>
                      </div></a>
                    </div>`;


    //return 0;
    }
  }
  console.log(htmlData)
  htmlData += `</div>`;
  console.log(htmlData)
  jQuery('#container').empty().append(htmlData);
  // htmlData = `<h3>Sorry, no candidate with that Roll Number</h3>`
  // jQuery('#container').empty().append(htmlData);
});
