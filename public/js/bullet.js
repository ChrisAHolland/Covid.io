export function updateBullet(game, time) {
  let bulletInfo = {
    playerId: game.socket.id,
    active: false,
    visible: false,
    x: null,
    y: null,
    toX: null,
    toY: null,
    time: 0
  };

  //mouse click event
  const pointer = game.input.activePointer;
  if (pointer.isDown && game.team === "virus") {
    bulletInfo.x = game.ship.x;
    bulletInfo.y = game.ship.y;
    bulletInfo.toX = pointer.x;
    bulletInfo.toY = pointer.y;
    bulletInfo.active = true;
    bulletInfo.visible = true;
    bulletInfo.time = time;

    game.socket.emit("bulletShooting", bulletInfo);
    shoot(game, bulletInfo);
  }

  //from server broadcast: send to all other player except the paired one
  game.socket.on("bulletShot", bulletInfo => {
    shoot(game, bulletInfo);
  });
}

function shoot(game, bulletInfo) {
  if (bulletInfo.time > game.lastFire) {
    //shoot from the player's current coordinates
    const bullet = game.bullets.get(bulletInfo.x, bulletInfo.y);

    //shoot at mouse direction
    if (bullet) {
      bullet.setActive(true);
      game.bullets.children.each(bullet => {
        //differentiate whos bullet this is
        bullet.playerId = bulletInfo.playerId;
        bullet.setScale(0.1, 0.1);
        bullet.outOfBoundsKill = true;
        bullet.checkWorldBounds = true;
        //set active to false when bullet out of screen
        if (bullet.active) {
          if (
            bullet.y < 0 ||
            bullet.y > game.canvasHeight ||
            bullet.x < 0 ||
            bullet.x > game.canvasWidth
          ) {
            bulletInfo.active = false;
            bullet.setActive(false);
            bullet.destroy();
          }
        }
      });
      game.physics.moveTo(bullet, bulletInfo.toX, bulletInfo.toY, 600);
    }
  }
  //set inverval for bullet shooting
  game.lastFire = bulletInfo.time + 20;
}

//initialization for bullets
export function createBullet(game) {
  game.bullets = game.physics.add.group({
    defaultKey: "bullet",
    active: false
  });
}
