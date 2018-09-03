var socket = io();

socket.emit('getData');
var rg = /(^\w{1}|\.\s*\w{1})/gi;
var fullData;

function renderHTML (data) {
  var htmlData = `<div class="row row-margin">`, counter = 0;
  for(var i in data){
    if(!data[i].hasOwnProperty('rating')) {
      data[i]['rating'] = ""
    }
    counter++;
    htmlData += `<div class="col-md-4">
                    <a href=\"/cv/${name}/${i.toLowerCase().replace(" ", "")}\"><div class="card ind-card" id="${i}">
                      <h4>${data[i]["Name"].replace(rg, function(toReplace) {
    return toReplace.toUpperCase();})}</h4>
                      <h5>${i.toUpperCase().replace(" ", "")}</h5>
                      <h5>${data[i]["Branch"]}</h5>
                      <h4>Rating: ${data[i]["rating"]}</h4>
                    </div></a>
                  </div>`;
    if(counter === 3) {
      counter = 0;
      htmlData += `</div>
                  <div class="row row-margin">`;
    }
  }
  return htmlData;
}

function interviewDifferentiator() {
  for(var i in fullData) {
    if(fullData[i].rating <=10 && fullData[i].rating) {
      jQuery(`#${i}`).css("background", "linear-gradient(to bottom right, #2dfae5, #05d8c2)");
    }
  }
}

socket.on('CVData', function clubFetch(club) {
  data = club.cvs;
  name = club.name;
  fullData = data;
  //process data
  var htmlData = renderHTML(data);
  jQuery('#container').append(htmlData);
  interviewDifferentiator();
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
  // if(roll === "") {
  //   return clubFetch(fullData);
  // }
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
    }
  }
  if(roll === ""){
    console.log(`In`);
    htmlData = "";
    htmlData += renderHTML(fullData);
    console.log(htmlData);
  }
  console.log(htmlData)
  jQuery('#container').empty().append(htmlData);
  interviewDifferentiator();
});
