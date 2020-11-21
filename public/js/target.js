const MAX_SIZE = 200;
export function createTarget(game) {
  game.socket.on("targetLocation", function(targetLocation) {
    if (game.target) game.target.destroy();
    game.target = game.physics.add
      .image(targetLocation.x, targetLocation.y, "target")
      .setDisplaySize(53, 53);

    //target overlap with player
    game.physics.add.overlap(
      game.ship,
      game.target,
      function() {
        game.socket.emit("targetCollected");
        if (game.player_width < MAX_SIZE && game.player_height < MAX_SIZE) {
          game.player_width = game.player_width + 10;
          game.player_height = game.player_height + 10;
          game.ship.setDisplaySize(game.player_height, game.player_width);
        }
      },
      null,
      game
    );
  });
}

export function bulletOverlap(game) {
  game.bullets.children.each(bullet => {
    game.physics.add.overlap(
      bullet,
      game.target,
      () => {
        bullet.destroy();
        //check if the bullet belongs to the player
        if (bullet.playerId === game.playerId) {
          game.socket.emit("targetCollected", game.bullets.children);
          if (game.player_width < MAX_SIZE && game.player_height < MAX_SIZE) {
            game.player_width = game.player_width + 10;
            game.player_height = game.player_height + 10;
            game.ship.setDisplaySize(game.player_height, game.player_width);
          }
        }
      },
      null,
      game
    );
  });
}
