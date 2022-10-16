const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

/**
 * Game gravity
 */
const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./assets/background.png",
});

const shop = new Sprite({
  position: {
    x: 620,
    y: 128,
  },
  imageSrc: "./assets/shop.png",
  scale: 2.75,
  framesMax: 6,
});

const player = new Fighter({
  position: {
    x: 100,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 10,
  },
  offSet: {
    x: 0,
    y: 0,
  },
  imageSrc: "./assets/samuraiMack/Idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157,
  },
  sprites: {
    idle: {
      imageSrc: "./assets/samuraiMack/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./assets/samuraiMack/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./assets/samuraiMack/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./assets/samuraiMack/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./assets/samuraiMack/Attack2.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./assets/samuraiMack/TakeHitWhiteSilhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./assets/samuraiMack/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 140,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 800,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 10,
  },
  color: "blue",
  offSet: {
    x: -50,
    y: 0,
  },
  imageSrc: "./assets/kenji/Idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167,
  },
  sprites: {
    idle: {
      imageSrc: "./assets/kenji/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./assets/kenji/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./assets/kenji/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./assets/kenji/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./assets/kenji/Attack1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./assets/kenji/TakeHit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./assets/kenji/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -175,
      y: 50,
    },
    width: 175,
    height: 50,
  },
});

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
};

decreaseTimer();

/**
 * Method called every time
 */
function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update(); // layer 1
  shop.update(); // layer 2
  c.fillStyle = "rgba(255,255,255,0.15)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update(); // layer 3
  enemy.update(); // layer 3

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // player movement
  if (keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
    player.swtichSprite("run");
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
    player.swtichSprite("run");
  } else {
    player.swtichSprite("idle");
  }

  if (player.velocity.y < 0) {
    player.swtichSprite("jump");
  } else if (player.velocity.y > 0) {
    player.swtichSprite("fall");
  }

  // enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.swtichSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.swtichSprite("run");
  } else {
    enemy.swtichSprite("idle");
  }

  //jumping
  if (enemy.velocity.y < 0) {
    enemy.swtichSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.swtichSprite("fall");
  }

  /**
   * Detect if enemy take hit
   */
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    gsap.to("#enemy-health", {
      width: enemy.health + "%",
    });
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  /**
   * Detect if player take hit
   */
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;
    gsap.to("#player-health", {
      width: player.health + "%",
    });
  }

  // if enemy misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

/**
 * Listen events
 */
window.addEventListener("keydown", (event) => {
  if (!player.dead) {
    switch (event.key) {
      // player
      case "d":
        keys.d.pressed = true;
        player.lastKey = "d";
        break;
      case "a":
        keys.a.pressed = true;
        player.lastKey = "a";
        break;
      case "w":
        player.velocity.y = player.velocity.y ? player.velocity.y : -20;
        break;
      case "s":
        player.attack();
        break;
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      // enemy
      case "l":
        keys.ArrowRight.pressed = true;
        enemy.lastKey = "ArrowRight";
        break;
      case "j":
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = "ArrowLeft";
        break;
      case "i":
        enemy.velocity.y = enemy.velocity.y ? enemy.velocity.y : -20;
        break;
      case "k":
        enemy.attack();
        break;
    }
  }
});

window.addEventListener("keyup", (event) => {
  // player keys
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;

    case "a":
      keys.a.pressed = false;
      break;
  }

  // enemy keys
  switch (event.key) {
    case "l":
      keys.ArrowRight.pressed = false;
      break;

    case "j":
      keys.ArrowLeft.pressed = false;
      break;
  }
});
