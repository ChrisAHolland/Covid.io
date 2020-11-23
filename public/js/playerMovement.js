export function playerMovement(game) {
  game.buttonW = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  game.buttonS = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  game.buttonA = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  game.buttonD = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  // emit player movement
  var x = game.ship.x;
  var y = game.ship.y;
  var r = game.ship.rotation;
  if (
    game.ship.oldPosition &&
    (x !== game.ship.oldPosition.x ||
      y !== game.ship.oldPosition.y ||
      r !== game.ship.oldPosition.rotation)
  ) {
    game.socket.emit("playerMovement", {
      x: game.ship.x,
      y: game.ship.y,
      player_height: game.player_height,
      player_width: game.player_width,
      rotation: game.ship.rotation
    });
  }

  // save old position data
  game.ship.oldPosition = {
    x: game.ship.x,
    y: game.ship.y,
    rotation: game.ship.rotation
  };

  // Control left and right movement
  if (game.buttonA.isDown) {
    game.ship.setVelocityX(-300);
  } else if (game.buttonD.isDown) {
    game.ship.setVelocityX(300);
  } else {
    game.ship.setVelocityX(0);
  }

  // Control up and down movement
  if (game.buttonW.isDown) {
    game.ship.setVelocityY(-300);
  } else if (game.buttonS.isDown) {
    game.ship.setVelocityY(300);
  } else {
    game.ship.setVelocityY(0);
  }
}

export function onPlayerMovement(game) {
  game.socket.on("playerMoved", function (playerInfo) {
    game.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        otherPlayer.setDisplaySize(
          playerInfo.player_height,
          playerInfo.player_width
        );
      }
    });
  });
}
