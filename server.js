const express = require('express');
const hbs = require('hbs');
const firebase = require('firebase');
const socketIO = require('socket.io');
const path = require('path');
const http = require('http');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

//TEMPLATE RENDERING CODE
var path1 = path.join(__dirname, 'views');
app.use(express.static(path1));
app.set('view engine', 'hbs');
//TEMPLATING COMPLETE

//FIREBASE linking Code
var config = {
  apiKey: "AIzaSyCVVTN_RpuWY8N1bmvlm3ioIM7hzLttwk0",
  authDomain: "getintoclub-1234.firebaseapp.com",
  databaseURL: "https://getintoclub-1234.firebaseio.com",
  projectId: "getintoclub-1234",
  storageBucket: "getintoclub-1234.appspot.com",
  messagingSenderId: "198631292821"
};
firebase.initializeApp(config);
//LINK COMPLETE

//TEMP
// var ref = firebase.database().ref();
// ref.on("value", (snapshot) => {
//    console.log(snapshot.val());
// }, (error) => {
//    console.log("Error: " + error.code);
// });
//TEMP CODE

//Club info in connected server
var club = {
  clubName: "",
  cvList: "",
  htmlCV: ""
}

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/club', (req, res) => {
  res.render('club', {
    clubName: club.clubName
  });
});

server.listen(3000, () => {
  console.log('Port up and running');
});

//SOCKET EVENTS
io.on('connection', (socket) => {
  socket.on('input', (clubData) => {
    clubData = clubData.toLowerCase().replace(" ", "");       //Formatting Club Name

    //Access Data of all the clubs
    var ref = firebase.database().ref();
    ref.on("value", (snapshot, e) => {
        if(e) {
          console.log(e);
        }

        //Check for existence of club in database
        if(snapshot.val()[clubData] === undefined){
          socket.emit('error1');
          return 0;   //EXIT CODE
        }

        club.clubName = clubData;
        club.cvList = snapshot.val()[clubData];
        socket.emit('redirect', {location: '/club'});
    });
  });
  socket.on('getData', (data) => {
    console.log(`Check`);
    socket.emit('CVData', club.cvList);
  })
});

/*
<script src="https://www.gstatic.com/firebasejs/5.4.2/firebase.js"></script>
<script>
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCVVTN_RpuWY8N1bmvlm3ioIM7hzLttwk0",
    authDomain: "getintoclub-1234.firebaseapp.com",
    databaseURL: "https://getintoclub-1234.firebaseio.com",
    projectId: "getintoclub-1234",
    storageBucket: "getintoclub-1234.appspot.com",
    messagingSenderId: "198631292821"
  };
  firebase.initializeApp(config);
</script>
*/
