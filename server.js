const express = require('express');
const hbs = require('hbs');
const firebase = require('firebase');
const socketIO = require('socket.io');
const path = require('path');
const http = require('http');
const spawn = require('child_process').spawn;
const fs = require('fs');
const crypto = require('crypto');;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
app.io = io;

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

//Club info in connected server
var club = {
  clubName: "",
  cvList: "",
  htmlCV: "",
  currentUser: ""
}

//HASHED PASSWORDS OF ALL CLUBS
var password = {
  englishclub: "40d6d32f29d78b185443b75544e5cff9bae81e2dbfd7c9c9799e94333d36063d",
  appteam: "c7a099afc459faf474bebbacd7b55b1a6506ef83aa7bd629223b820bb5eac643"
}


//SOCKET EVENTS
io.on('connection', (socket) => {
  socket.on('input', (clubData) => {                          // When Club Member logs in through the home form
    [clubData, pass]   = clubData.split(';')                  // Extracting club name and club password
    var hashedPassword = crypto.createHmac('sha256', 'dontmesswithusbitch')
                                .update(pass)                 // Hashing Entered Password
                                .digest('hex');
    clubData = clubData.toLowerCase().replace(" ", "");       //Formatting Club Name

    //Access Data of all the clubs
    var ref = firebase.database().ref();
    ref.on("value", (snapshot, e) => {
        if(e) {                                                 //ERROR DETECTION
          console.log(e);
        }

        if(snapshot.val()[clubData] === undefined){             //Check for existence of club in database
          socket.emit('error1');
          return 0;                                             //EXIT CODE
        }

        club.clubName = clubData;                               //club: {clubName: "{clubData}", cvList: /*Data of that club*/}
        club.cvList = snapshot.val()[clubData];
        if(hashedPassword === password[club.clubName]){         // Verifying password
          socket.emit('redirect', {location: '/club'});         //window.location being changed with 'club' object being modified
        } else {
          socket.emit('wrongPassword')
        }
    });
  });

  socket.on('getData', (data) => {                              // Respond to getData request from club.hbs
    socket.emit('CVData', {                                     // Provides all data inside club object made in server.js
      cvs: club.cvList,
      name: club.clubName
    });
  });

  socket.on('rating', (data) => {                               // Socket data coming from cv.js after user has been rated
    var currentUserData;                                        // Object to collect data of the 'currently-interviewing' candidate
    var ref = firebase.database().ref(`/${club.clubName}/${club.currentUser}`);
    ref.on("value", (snapshot, e) => {                          // Read firebase data of the candidate being interviewed
      currentUserData = snapshot.val();
    });

    // DEFINING UNDEFINED PROPERTIES IN FIREBASE CANDIDATE DATA
    var keys = ["Name", "Mobile", "Email", "Branch", "Skills", "Achievements", "Area of Interest", "Ques1", "Ques2", "Ques3", "Ques4"];
    for(var key in keys){
      if(!currentUserData.hasOwnProperty(keys[key])) {
        currentUserData[keys[key]] = "";
      }
    }
    //Adding rating and comments from User's input in cv.hbs to firebase
    currentUserData["rating"] = data.rating;
    currentUserData["comments"] = data.comments;

    //Updating the data
    //TODO: We can shorten the update code.
      ref.set({
      Achievements: currentUserData.Achievements,
      Name: currentUserData.Name,
      Mobile: currentUserData.Mobile,
      Email: currentUserData.Email,
      Branch: currentUserData.Branch,
      Skills: currentUserData.Skills,
      Ques1: currentUserData.Ques1,
      Ques2: currentUserData.Ques2,
      Ques3: currentUserData.Ques3,
      Ques4: currentUserData.Ques4,
      rating: currentUserData.rating,
      comments: currentUserData.comments,
      "Area of Interest": currentUserData["Area of Interest"]
    });
    // DO NOT ATTEMPT TO DEFINE AN OBJECT IN ref.set(). It will modify the firebase data, but instead of the rollno id,
    // currentUserData will be placed
  });
});

//GET ROUTES DEFINED
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/club', (req, res) => {
  res.render('club', {
    clubName: club.clubName
  });
});

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
  candidate={};
  var ref = firebase.database().ref(`/${club.clubName}/${club.currentUser}`);
  ref.on("value", (snapshot, e) => {
    candidate = snapshot.val();
    // console.log('Candidate: ',candidate);
  });
  if(!candidate.hasOwnProperty('comments')){
    console.log('Comment Property not there');
  }
  app.io.emit('loadRatings', candidate);
  res.render('cv', {
    clubName: req.params.club,
    id: req.params.id,
    comments: candidate.comments,
    rating: candidate.rating
  })
});


server.listen(3000, () => {
  console.log('Port up and running');
});

//LaTex TEMPLATING
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
  });
}
