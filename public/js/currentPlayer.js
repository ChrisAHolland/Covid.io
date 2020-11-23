export function currentPlayers(game) {
  game.player_width = 53;
  game.player_height = 53;

  game.otherPlayers = game.physics.add.group();
  game.socket.on("currentPlayers", function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === game.socket.id) {
        addPlayer(game, players[id]);
      } else {
        addOtherPlayers(game, players[id]);
      }
    });
  });

  game.socket.on("newPlayer", function (playerInfo) {
    addOtherPlayers(game, playerInfo);
  });

  game.socket.on("disconnect", function (playerId) {
    game.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
}

function addOtherPlayers(game, playerInfo) {
  let otherPlayer;
  if (playerInfo.team === "doctor") {

    otherPlayer = game.add
      .sprite(playerInfo.x, playerInfo.y, "doctor")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(playerInfo.player_height, playerInfo.player_width);
  } else {

    otherPlayer = game.add
      .sprite(playerInfo.x, playerInfo.y, "virus")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(playerInfo.player_height, playerInfo.player_width);
  }
  otherPlayer.playerId = playerInfo.playerId;
  game.otherPlayers.add(otherPlayer);
}

function addPlayer(game, playerInfo) {
  if (playerInfo.team === "doctor") {
    game.team = "doctor"
    game.ship = game.physics.add
      .image(playerInfo.x, playerInfo.y, "doctor")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(playerInfo.player_height, playerInfo.player_width);
  } else {
    game.team = "virus"
    game.ship = game.physics.add
      .image(playerInfo.x, playerInfo.y, "virus")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(playerInfo.player_height, playerInfo.player_width);
  }
  game.ship.setDrag(1800);
  game.ship.setAngularDrag(800);
  game.ship.setMaxVelocity(800);
}
