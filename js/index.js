
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

// Game settings

const speed = 10;
const refreshRateMs = 1;
let gameStartedState = false;
const pointsPerObstacle = 42;

// Obstacles settings

const defaultObstacleHeigth = 20;
const obstacleFrequencyMs = 1500;
const obstacleSpeedOnY = 1;
let obstaclePool = [];

// Game Objects

class Background {
  constructor() {
    this.img = new Image();
    this.img.src = "./images/road.png";
  }

  draw() {
    context.drawImage(this.img, 0, 0, canvas.clientWidth, canvas.clientHeight);
  }
}

class Player {
  constructor() {
    this.img = new Image();
    this.img.src = "./images/car.png";
    this.width = this.img.width / 2;
    this.heigth = this.img.height / 2;
    this.x = (canvas.width / 2) - (this.width / 2);
    this.y = canvas.height - this.heigth - 20;
    this.score = 0;
  }

  draw() {
    context.drawImage(this.img, this.x, this.y, this.width, this.heigth);
  }

  drawScore() {
    context.font = '48px Courier New';
    context.fillStyle = 'black'
    context.fillText(`SCORE: ${this.score}`, 10, 50);
  }

  addPoints() {
    this.score += pointsPerObstacle;
  }

  getColisionCoordinates() {
    return {
      y: this.y,
      xMin: this.x,
      xMax: this.x + this.width
    }
  }

  move(direction) {
    if (direction && typeof direction === 'function') {
      const newX = this.x + speed * direction();
      if (newX > 0 && newX < canvas.width - this.width) {
        this.x = newX;
      }
    }
  }
}

class Obstacle {
  constructor() {
    this.width = player.width + Math.floor(Math.random() * (canvas.width / 2 - player.width));
    this.heigth = defaultObstacleHeigth;
    this.x = Math.floor(Math.random() * (canvas.width - this.width));
    this.y = 0;
  }

  draw() {
    context.beginPath()
    context.rect(this.x, this.y, this.width, this.heigth)
    context.fillStyle = 'red'
    context.fill()
  }

  getColisionCoordinates() {
    return {
      y: this.y + this.heigth,
      xMin: this.x,
      xMax: this.x + this.width
    }
  }

  move() {
    this.y += obstacleSpeedOnY;
  }
}

// Game objects instances

const bg = new Background();
const player = new Player();
let gameIntervalId = null;
let obstacleGeneratorIntervalId = null;

// Game functions

function hasPlayerColided() {
  let colision = false;
  const { xMin: plXMin, xMax: plXMax, y: plY } = player.getColisionCoordinates();

  for (let i = 0; i < obstaclePool.length; i++) {
    const { xMin: obXMin, xMax: obXMax, y: obY } = obstaclePool[i].getColisionCoordinates();

    colision = obY > plY && ((plXMax > obXMin && plXMax < obXMax) || (plXMin > obXMin && plXMin < obXMax));

    if (colision) {
      break;
    }
  }
  return colision;
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height)
}

function startGame() {
  if (!gameStartedState) {
    gameStartedState = true;
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowRight':
          player.move(() => +1);
          break;
        case 'ArrowLeft':
          player.move(() => -1);
          break;
      }
    })

    gameIntervalId = setInterval(() => {
      renderGame();
    }, refreshRateMs);

    obstacleGeneratorIntervalId = setInterval(() => {
      obstaclePool.push(new Obstacle());
    }, obstacleFrequencyMs);
  }
};

function stopGame() {
  clearInterval(gameIntervalId);
  clearInterval(obstacleGeneratorIntervalId);
}


function drawBlackBox() {
  context.beginPath()
  context.rect(0, 100, canvas.width, 200)
  context.fillStyle = 'black'
  context.fill()
}

function drawGameOverMessage() {
  context.font = '48px Courier New';
  context.fillStyle = 'red'
  context.fillText(`Game over`, canvas.width / 4, 190);
  context.fillText(`😵‍💫`, canvas.width / 2 - 24, 250);
}

function drawGameOver() {
  drawBlackBox();
  drawGameOverMessage();
}

function manageObstacles() {
  obstaclePool.forEach(obstacle => {
    obstacle.move();
  });
  const len = obstaclePool.length;
  obstaclePool = obstaclePool.filter(obstacle => obstacle.y < canvas.height);
  if (len != obstaclePool.length) {
    player.addPoints();
    console.log(player.score);
  }
}

function drawInitialGame() {
  bg.draw();
  player.draw();
}

function drawAll() {
  bg.draw();
  player.drawScore();
  player.draw();
  obstaclePool.forEach(obstacle => {
    obstacle.draw();
  });
}

function renderGame() {
  manageObstacles();
  if (hasPlayerColided()) {
    stopGame();
    drawGameOver();
  } else {
    clearCanvas();
    drawAll();
  }
}

window.onload = () => {
  document.getElementById('start-button').onclick = () => {
    startGame();
  };
  drawInitialGame();
}

