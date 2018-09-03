const express = require('express');
const hbs = require('hbs');
const firebase = require('firebase');
const socketIO = require('socket.io');
const path = require('path');
const http = require('http');
const spawn = require('child_process').spawn;
const fs = require('fs');

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
  htmlCV: "",
  currentUser: ""
}

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/club', (req, res) => {
  res.render('club', {
    clubName: club.clubName
  });
});

function makepdf(club, id, res){
  var ref = firebase.database().ref();
  var base_filename = path.join(__dirname, '/generated_pdfs', club+id)
  var pdf_filename = base_filename+'.pdf';
  ref.on("value", (snapshot, e)=>{
    var fs = require('fs');
    var json_obj = snapshot.val()[club][id];
    json_obj['rollno'] = id;
    fs.writeFile(base_filename+'.json', JSON.stringify(json_obj), function(err) {});
    var prc = spawn('python', ["makepdf.py", base_filename+'.json']);

    //noinspection JSUnresolvedFunction
    prc.stdout.setEncoding('utf8');
    prc.stdout.on('data', function (data) {
        var str = data.toString()
        var lines = str.split(/(\r?\n)/g);
        console.log(lines.join(""));
    });
    prc.stderr.setEncoding('utf8');
    prc.stderr.on('data', function (data) {
        var str = data.toString()
        var lines = str.split(/(\r?\n)/g);
        console.log(lines.join(""));
    });

    prc.on('close', function (code) {
        res.sendFile(pdf_filename);
        console.log('process exit code ' + code);
    });

  })
}

app.get('/api/getpdf/:club/:id', (req, res) => {
  var club = req.params.club;
  var id = req.params.id;
  var base_filename = path.join(__dirname, '/generated_pdfs', club+id)
  var pdf_filename = base_filename+'.pdf';
  fs.stat(pdf_filename, function(err, stat) {
    if(err == null) {
        console.log('File exists');
        res.sendFile(pdf_filename);
    } else if(err.code == 'ENOENT') {
        // file does not exist
        makepdf(club,id,res);
    } else {
        console.log('Some other error: ', err.code);
    }
  });
});

app.get('/cv/:club/:id', (req, res) => {
  club.currentUser = req.params.id;
  res.render('cv', {
    clubName: req.params.club,
    id: req.params.id
  })
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
    socket.emit('CVData', {
      cvs: club.cvList,
      name: club.clubName
    });
  });
  socket.on('rating', (data) => {
    var currentUserData;
    var ref = firebase.database().ref(`/${club.clubName}/${club.currentUser}`);
    ref.on("value", (snapshot, e) => {
      currentUserData = snapshot.val();
    });
    ref.set({
      Achievements : currentUserData.Achievements,
      Branch : currentUserData.Branch,
      Email : currentUserData.Email,
      Mobile : currentUserData.Mobile,
      Name : currentUserData.Name,
      Ques1 : currentUserData.Ques1,
      Ques2 : currentUserData.Ques2,
      Ques3 : currentUserData.Ques3,
      Ques4 : currentUserData.Ques4,
      Skills : currentUserData.Skills,
      "Area of Interest" : currentUserData["Area of Interest"],
      rating: data
    });
  });
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
