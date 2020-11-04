var config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 1600,
  height: 1200,
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

var game = new Phaser.Game(config);

function preload() {
  this.load.image("doctor", "assets/doctor.png");
  this.load.image("virus", "assets/virus.png");
  this.load.image("target", "assets/target.png");
}

function create() {
  var self = this;
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
      }
    });
  });

  this.cursors = this.input.keyboard.createCursorKeys();

  this.doctorScoreText = this.add.text(16, 16, "", {
    fontSize: "32px",
    fill: "#1CDCFE",
  });
  this.virusScoreText = this.add.text(584, 16, "", {
    fontSize: "32px",
    fill: "#06EE45",
  });

  this.socket.on("scoreUpdate", function (scores) {
    self.doctorScoreText.setText("Doctors: " + scores.blue);
    self.virusScoreText.setText("The Virus: " + scores.red);
  });

  this.socket.on("starLocation", function (starLocation) {
    if (self.target) self.target.destroy();

    self.target = self.physics.add
      .image(starLocation.x, starLocation.y, "target")
      .setDisplaySize(53, 53);

    self.physics.add.overlap(
      self.ship,
      self.target,
      function () {
        this.socket.emit("starCollected");
      },
      null,
      self
    );
  });
}

function addPlayer(self, playerInfo) {
  if (playerInfo.team === "blue") {
    self.ship = self.physics.add
      .image(playerInfo.x, playerInfo.y, "doctor")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(53, 53);
  } else {
    self.ship = self.physics.add
      .image(playerInfo.x, playerInfo.y, "virus")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(53, 53);
  }
  self.ship.setDrag(1800);
  self.ship.setAngularDrag(800);
  self.ship.setMaxVelocity(800);
}

function addOtherPlayers(self, playerInfo) {
  let otherPlayer;
  if (playerInfo.team === "blue") {
    otherPlayer = self.add
      .sprite(playerInfo.x, playerInfo.y, "doctor")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(53, 53);
  } else {
    otherPlayer = self.add
      .sprite(playerInfo.x, playerInfo.y, "virus")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(53, 53);
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
        rotation: this.ship.rotation,
      });
    }

    // save old position data
    this.ship.oldPosition = {
      x: this.ship.x,
      y: this.ship.y,
      rotation: this.ship.rotation,
    };

    if (this.buttonA.isDown) {
      this.ship.setAngularVelocity(-500);
    } else if (this.buttonD.isDown) {
      this.ship.setAngularVelocity(500);
    } else {
      this.ship.setAngularVelocity(0);
    }

    if (this.buttonW.isDown) {
      this.physics.velocityFromRotation(
        this.ship.rotation + 1.5,
        1000,
        this.ship.body.acceleration
      );
    } else if (this.buttonS.isDown) {
      this.physics.velocityFromRotation(
        this.ship.rotation - 1.5,
        500,
        this.ship.body.acceleration
      );
    } else {
      this.ship.setAcceleration(0);
    }

    this.physics.world.wrap(this.ship, 5);
  }
}
