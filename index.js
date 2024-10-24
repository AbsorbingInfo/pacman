const scoreElement = document.getElementById("score");
const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = innerWidth;
canvas.height = innerHeight;
const c = canvas.getContext("2d");

class Boundary {
  static width = 25;
  static height = 25;
  constructor({ position }) {
    this.position = position;
    this.width = 25;
    this.height = 25;
  }
  draw() {
    c.fillStyle = "deeppink";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class Player {
  static radius = 12;
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 12;
  }
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "yellow";
    c.fill();
    c.closePath();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Ghost {
  static radius = 12;
  constructor({ position, velocity, color = "red" }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 12;
    this.color = color;
    this.prevCollusions = [];
  }
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Pallete {
  static radius = 3;
  constructor({ position }) {
    this.position = position;
    this.radius = 3;
  }
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "white";
    c.fill();
    c.closePath();
  }
}

/*
- Map is 28x31 tiles.
- Paths are only 1 tile thick
- No sharp turns (i.e. intersections are separated by atleast 2 tiles).
- There are 1 or 2 tunnels
- No dead-ends.
- Only I, L, T, or + wall shapes are allowed, including the occasional rectangular wall.
- Any non-rectangular wall pieces must only be 2 tiles thick.
*/
const layoutHalf = [
  ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"],
  ["1", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "1"],
  ["1", "*", "1", "1", "1", "1", "*", "1", "1", "1", "1", "1", "*", "1"],
  ["1", "*", "1", "1", "1", "1", "*", "1", "1", "1", "1", "1", "*", "1"],
  ["1", "*", "1", "1", "1", "1", "*", "1", "1", "1", "1", "1", "*", "1"],
  ["1", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*"],
  ["1", "*", "1", "1", "1", "1", "*", "1", "1", "*", "1", "1", "1", "1"],
  ["1", "*", "1", "1", "1", "1", "*", "1", "1", "*", "1", "1", "1", "1"],
  ["1", "*", "*", "*", "*", "*", "*", "1", "1", "*", "*", "*", "*", "1"],
  ["1", "1", "1", "1", "1", "1", "*", "1", "1", "1", "1", "1", "*", "1"],
  ["*", "*", "*", "*", "*", "1", "*", "1", "1", "1", "1", "1", "*", "1"],
  ["*", "*", "*", "*", "*", "1", "*", "1", "1", "*", "*", "*", "*", "*"],
  ["*", "*", "*", "*", "*", "1", "*", "1", "1", "*", "1", "1", "1", "*"],
  ["1", "1", "1", "1", "1", "1", "*", "1", "1", "*", "1", "*", "*", "*"],
  ["*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "1", "*", "*", "*"],
  ["1", "1", "1", "1", "1", "1", "*", "1", "1", "*", "1", "*", "*", "*"],
  ["*", "*", "*", "*", "*", "1", "*", "1", "1", "*", "1", "1", "1", "1"],
  ["*", "*", "*", "*", "*", "1", "*", "1", "1", "*", "*", "*", "*", "*"],
  ["*", "*", "*", "*", "*", "1", "*", "1", "1", "*", "1", "1", "1", "1"],
  ["1", "1", "1", "1", "1", "1", "*", "1", "1", "*", "1", "1", "1", "1"],
  ["1", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "1"],
  ["1", "*", "1", "1", "1", "1", "*", "1", "1", "1", "1", "1", "*", "1"],
  ["1", "*", "1", "1", "1", "1", "*", "1", "1", "1", "1", "1", "*", "1"],
  ["1", "*", "*", "*", "1", "1", "*", "*", "*", "*", "*", "*", "*", "*"],
  ["1", "1", "1", "*", "1", "1", "*", "1", "1", "*", "1", "1", "1", "1"],
  ["1", "1", "1", "*", "1", "1", "*", "1", "1", "*", "1", "1", "1", "1"],
  ["1", "*", "*", "*", "*", "*", "*", "1", "1", "*", "*", "*", "*", "1"],
  ["1", "*", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "*", "1"],
  ["1", "*", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "*", "1"],
  ["1", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*"],
  ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"],
];

const layout = layoutHalf.map((row) => {
  const fullRow = row;
  for (let i = row.length - 1; i >= 0; i--) {
    fullRow.push(row[i]);
  }
  return fullRow;
});

const player = new Player({
  position: {
    x: Boundary.width + Boundary.width / 2,
    y: Boundary.height + Boundary.height / 2,
  },
  velocity: {
    x: 0,
    y: 0,
  },
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};
let lastPressedKey = "*";
let score = 0;
const boundaryBlocks = [];
const palletes = [];

layout.forEach((row, rowIdx) => {
  row.forEach((column, columnIdx) => {
    if (column === "1") {
      const boundaryBlock = new Boundary({
        position: {
          x: columnIdx * Boundary.width,
          y: rowIdx * Boundary.height,
        },
      });
      boundaryBlocks.push(boundaryBlock);
    } else if (column === "*") {
      const pallete = new Pallete({
        position: {
          x: columnIdx * Boundary.width + Boundary.width / 2,
          y: rowIdx * Boundary.height + Boundary.height / 2,
        },
      });
      palletes.push(pallete);
    }
  });
});

const ghosts = [
  new Ghost({
    position: {
      x: boundaryBlocks[boundaryBlocks.length - 1].position.x / 2,
      y: boundaryBlocks[boundaryBlocks.length - 1].position.y / 2,
    },
    velocity: {
      x: 0,
      y: 0,
    },
    color: "red",
  }),
];

function isCollidingWithWall(circle, boundaryBlock) {
  return (
    circle.position.x + circle.radius + circle.velocity.x >= boundaryBlock.position.x &&
    circle.position.x - circle.radius + circle.velocity.x <= boundaryBlock.position.x + boundaryBlock.width &&
    circle.position.y + circle.radius + circle.velocity.y >= boundaryBlock.position.y &&
    circle.position.y - circle.radius + circle.velocity.y <= boundaryBlock.position.y + boundaryBlock.height
  );
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);
  if (keys.w.pressed && lastPressedKey === "w") {
    for (let i = 0; i < boundaryBlocks.length; i++) {
      const boundaryBlock = boundaryBlocks[i];
      if (
        isCollidingWithWall(
          {
            ...player,
            velocity: {
              x: 0,
              y: -5,
            },
          },
          boundaryBlock
        )
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = -5;
      }
    }
  } else if (keys.a.pressed && lastPressedKey === "a") {
    for (let i = 0; i < boundaryBlocks.length; i++) {
      const boundaryBlock = boundaryBlocks[i];
      if (
        isCollidingWithWall(
          {
            ...player,
            velocity: {
              x: -5,
              y: 0,
            },
          },
          boundaryBlock
        )
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = -5;
      }
    }
  } else if (keys.s.pressed && lastPressedKey === "s") {
    for (let i = 0; i < boundaryBlocks.length; i++) {
      const boundaryBlock = boundaryBlocks[i];
      if (
        isCollidingWithWall(
          {
            ...player,
            velocity: {
              x: 0,
              y: 5,
            },
          },
          boundaryBlock
        )
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = 5;
      }
    }
  } else if (keys.d.pressed && lastPressedKey === "d") {
    for (let i = 0; i < boundaryBlocks.length; i++) {
      const boundaryBlock = boundaryBlocks[i];
      if (
        isCollidingWithWall(
          {
            ...player,
            velocity: {
              x: 5,
              y: 0,
            },
          },
          boundaryBlock
        )
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = 5;
      }
    }
  }

  boundaryBlocks.forEach((block) => {
    block.draw();
    // collusion detection
    if (isCollidingWithWall(player, block)) {
      player.velocity.x = 0;
      player.velocity.y = 0;
    }
  });

  for (let i = palletes.length - 1; i >= 0; i--) {
    const pallete = palletes[i];
    pallete.draw();
    // ployer and pallete collusion detection
    if (Math.hypot(pallete.position.x - player.position.x, pallete.position.y - player.position.y) <= Player.radius + Pallete.radius) {
      palletes.splice(i, 1);
      score += 10;
      scoreElement.innerText = score;
    }
  }
  player.update();

  ghosts.forEach((ghost) => {
    ghost.update();
    const collusions = [];
    boundaryBlocks.forEach((block) => {
      if (
        !collusions.includes("down") &&
        isCollidingWithWall(
          {
            ...ghost,
            velocity: {
              x: 0,
              y: 5,
            },
          },
          block
        )
      ) {
        collusions.push("down");
      } else if (
        !collusions.includes("right") &&
        isCollidingWithWall(
          {
            ...ghost,
            velocity: {
              x: 5,
              y: 0,
            },
          },
          block
        )
      ) {
        collusions.push("right");
      } else if (
        !collusions.includes("up") &&
        isCollidingWithWall(
          {
            ...ghost,
            velocity: {
              x: 0,
              y: -5,
            },
          },
          block
        )
      ) {
        collusions.push("up");
      } else if (
        !collusions.includes("left") &&
        isCollidingWithWall(
          {
            ...ghost,
            velocity: {
              x: -5,
              y: 0,
            },
          },
          block
        )
      ) {
        collusions.push("left");
      }
    });
    console.log({ collusions, prev: ghost.prevCollusions });
    if (collusions.length > ghost.prevCollusions.length) {
      ghost.prevCollusions = collusions;
    }
    if (JSON.stringify(collusions) !== JSON.stringify(ghost.prevCollusions)) {
      if (ghost.velocity.x > 0) {
        ghost.prevCollusions.push("right");
      } else if (ghost.velocity.x < 0) {
        ghost.prevCollusions.push("left");
      } else if (ghost.velocity.y > 0) {
        ghost.prevCollusions.push("down");
      } else if (ghost.velocity.y < 0) {
        ghost.prevCollusions.push("up");
      }
      const pathways = ghost.prevCollusions.filter((collusion) => !collusions.includes(collusion));
      const direction = pathways[Math.floor(Math.random() * pathways.length)];
      console.log(pathways);
      switch (direction) {
        case "down":
          ghost.velocity.y = 5;
          ghost.velocity.x = 0;
          break;
        case "up":
          ghost.velocity.y = -5;
          ghost.velocity.x = 0;
          break;
        case "right":
          ghost.velocity.y = 0;
          ghost.velocity.x = 5;
          break;
        case "right":
          ghost.velocity.y = 0;
          ghost.velocity.x = -5;
          break;
      }
    }
  });
}

animate();

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "w":
      keys.w.pressed = true;
      lastPressedKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastPressedKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastPressedKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastPressedKey = "d";
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
});
