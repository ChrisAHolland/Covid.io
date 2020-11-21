import { currentPlayers } from "./currentPlayer.js";
import { createTarget, bulletOverlap } from "./target.js";
import { updateBullet, createBullet } from "./bullet.js";
import { playerMovement, onPlayerMovement } from "./playerMovement.js";
import { createScore } from "./score.js";

const canvasWidth = 1600;
const canvasHeight = 900;
let lastFire = 0;

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: canvasWidth,
  height: canvasHeight,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("doctor", "assets/doctor.png");
  this.load.image("virus", "assets/virus.png");
  this.load.image("target", "assets/target.png");
  this.load.image("bullet", "assets/bullet.png");
}

function create() {
  this.socket = io();
  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
  this.lastFire = lastFire;

  currentPlayers(this);
  //recieve player moved data from server and render
  onPlayerMovement(this);

  createBullet(this);
  createScore(this);
  createTarget(this);
}

function update(time) {
  this.playerId = this.socket.id;

  if (this.ship) {
    updateBullet(this, time);
    bulletOverlap(this);
    //send player movement data to server
    playerMovement(this);
    this.physics.world.wrap(this.ship, 5);
  }
}
