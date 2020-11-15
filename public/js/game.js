const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 1600,
  height: 920,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 0 },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);
const MAX_SIZE = 200;

function preload() {
  this.load.image("doctor", "assets/doctor.png");
  this.load.image("virus", "assets/virus.png");
  this.load.image("target", "assets/target.png");
}

function create() {
  var self = this;
  this.player_width = 53;
  this.player_height = 53;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();

  this.socket.on("currentPlayers", function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });

  this.socket.on("newPlayer", function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });

  this.socket.on("disconnect", function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });

  //keystroke W,S,A,D
  this.buttonW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  this.buttonS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  this.buttonA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  this.buttonD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  this.socket.on("playerMoved", function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        otherPlayer.setDisplaySize(playerInfo.player_height, playerInfo.player_width);
      }
    });
  });

  this.cursors = this.input.keyboard.createCursorKeys();

  this.doctorScoreText = this.add.text(800, 15, "", {
    fontSize: "32px",
    fill: "#1CDCFE",
  });
  this.virusScoreText = this.add.text(550, 15, "", {
    fontSize: "32px",
    fill: "#06EE45",
  });

  this.timerText = this.add.text(1430, 15, "", {
    fontSize: "32px",
    fill: "#FFFFFF",
  });

  this.roundsWonHeaderText = this.add.text(5, 15, "Rounds won:", {
    fontSize: "32px",
    fill: "#FFFFFF",
  });

  this.roundsWonDoctorText = this.add.text(5, 75, "", {
    fontSize: "32px",
    fill: "#1CDCFE",
  });

  this.roundsWonVirusText = this.add.text(5, 45, "", {
    fontSize: "32px",
    fill: "#06EE45",
  });

  this.socket.on("roundUpdate", function(rounds){
    self.roundsWonDoctorText.setText("Doctors: " + rounds.doctor);
    self.roundsWonVirusText.setText("Virus: " + rounds.virus);
  });

  this.socket.on("clockUpdate", function(countdown){
    self.timerText.setText("Time: " + countdown);
  });

  this.socket.on("scoreUpdate", function (scores) {
    self.doctorScoreText.setText("Immunized: " + scores.doctor);
    self.virusScoreText.setText("Infected: " + scores.virus);
  });

  this.socket.on("targetLocation", function (targetLocation) {
    if (self.target) self.target.destroy();

    self.target = self.physics.add
      .image(targetLocation.x, targetLocation.y, "target")
      .setDisplaySize(53, 53);

    self.physics.add.overlap(
      self.ship,
      self.target,
      function () {
        this.socket.emit("targetCollected");
        if (this.player_width < MAX_SIZE && this.player_height < MAX_SIZE) {
          self.player_width = self.player_width + 10;
          self.player_height = self.player_height + 10;
          self.ship.setDisplaySize(this.player_height, this.player_width);
        }
      },
      null,
      self
    );
  });
}

function addPlayer(self, playerInfo) {
  if (playerInfo.team === "doctor") {
    self.ship = self.physics.add
      .image(playerInfo.x, playerInfo.y, "doctor")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(playerInfo.player_height, playerInfo.player_width);
  } else {
    self.ship = self.physics.add
      .image(playerInfo.x, playerInfo.y, "virus")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(playerInfo.player_height, playerInfo.player_width);
  }
  self.ship.setDrag(1800);
  self.ship.setAngularDrag(800);
  self.ship.setMaxVelocity(800);
}

function addOtherPlayers(self, playerInfo) {
  let otherPlayer;
  if (playerInfo.team === "doctor") {
    otherPlayer = self.add
      .sprite(playerInfo.x, playerInfo.y, "doctor")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(playerInfo.player_height, playerInfo.player_width);
  } else {
    otherPlayer = self.add
      .sprite(playerInfo.x, playerInfo.y, "virus")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(playerInfo.player_height, playerInfo.player_width);
  }
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function update() {
  if (this.ship) {
    // emit player movement
    var x = this.ship.x;
    var y = this.ship.y;
    var r = this.ship.rotation;
    if (
      this.ship.oldPosition &&
      (x !== this.ship.oldPosition.x ||
        y !== this.ship.oldPosition.y ||
        r !== this.ship.oldPosition.rotation)
    ) {
      this.socket.emit("playerMovement", {
        x: this.ship.x,
        y: this.ship.y,
        player_height: this.player_height,
        player_width: this.player_width,
        rotation: this.ship.rotation,
      });
    }

    // save old position data
    this.ship.oldPosition = {
      x: this.ship.x,
      y: this.ship.y,
      rotation: this.ship.rotation,
    };
    
    // Control left and right movement
    if (this.buttonA.isDown) {
      this.ship.setVelocityX(-300);
    } else if (this.buttonD.isDown) {
      this.ship.setVelocityX(300);
    } else {
      this.ship.setVelocityX(0);
    }

    // Control up and down movement
    if (this.buttonW.isDown) {
      this.ship.setVelocityY(-300);
    } else if (this.buttonS.isDown) {
      this.ship.setVelocityY(300);
    } else {
      this.ship.setVelocityY(0);
    }
    
    this.physics.world.wrap(this.ship, 5);
  }
}
