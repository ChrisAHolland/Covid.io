const { time } = require("console");
var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io").listen(server);

var players = {};

var target = {
  x: Math.floor(Math.random() * 1500) + 50,
  y: Math.floor(Math.random() * 700) + 150
};

// current round scores
var scores = {
  doctor: 0,
  virus: 0
};
// rounds won
var rounds = {
  doctor: 0,
  virus: 0
};

// game round time in seconds
var countdown = 20;

// timer object for round timer
function Timer(fn, time) {
  var timerObject = setInterval(fn, time);

  // stop the timer
  this.stop = function() {
    if (timerObject) {
      clearInterval(timerObject);
      timerObject = null;
    }
    return this;
  };

  // start timer
  this.start = function() {
    if (!timerObject) {
      this.stop();
      timerObject = setInterval(fn, time);
    }
    return this;
  };

  // reset round timer
  this.reset = function() {
    countdown = 20;
  };
}

var timer = new Timer(function() {
  countdown--;

  if (countdown < 0) {
    timer.stop();

    if (scores.doctor > scores.virus) {
      rounds.doctor += 1;
    } else if (scores.virus > scores.doctor) {
      rounds.virus += 1;
    }

    // reset scores and player sizes for new round
    scores.doctor = 0;
    scores.virus = 0;

    // update players
    io.emit("scoreUpdate", scores);
    io.emit("roundUpdate", rounds);

    timer.reset();
    timer.start();
  }
  io.emit("clockUpdate", countdown);
}, 1000);

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
  console.log("a user connected");
  // create a new player and add it to our players object
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 1500) + 50,
    y: Math.floor(Math.random() * 700) + 150,
    player_height: 53,
    player_width: 53,
    playerId: socket.id,
    team: Math.floor(Math.random() * 2) == 0 ? "virus" : "doctor"
  };
  // send the players object to the new player
  socket.emit("currentPlayers", players);

  // send the target object to the new player
  socket.emit("targetLocation", target);

  // send the current
  socket.emit("scoreUpdate", scores);

  // send the current rounds
  socket.emit("roundUpdate", rounds);

  // update all other players of the new player
  socket.broadcast.emit("newPlayer", players[socket.id]);

  // when a player disconnects, remove them from our players object
  socket.on("disconnect", function() {
    console.log("user disconnected");
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit("disconnect", socket.id);
  });

  // when a player moves, update the player data
  socket.on("playerMovement", function(movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].player_width = movementData.player_width;
    players[socket.id].player_height = movementData.player_height;
    players[socket.id].rotation = movementData.rotation;
    // emit a message to all players about the player that moved
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });

  socket.on("bulletShooting", bulletInfo => {
    //store bullet shooting data
    socket.broadcast.emit("bulletShot", bulletInfo);
  });

  socket.on("targetCollected", () => {
    if (players[socket.id].team === "virus") {
      scores.virus += 1;
    } else {
      scores.doctor += 1;
    }
    target.x = Math.floor(Math.random() * 1500) + 50;
    target.y = Math.floor(Math.random() * 700) + 150;
    io.emit("targetLocation", target);
    io.emit("scoreUpdate", scores);
  });
});

server.listen(8081, function() {
  console.log(`Listening on ${server.address().port}`);
});
