
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

// Game settings

const speed = 10;
const refreshRateMs = 1;
let gameStartedState = false;

// Obstacles settings

const defaultObstacleHeigth = 20;
const obstacleFrequencyMs = 1500;
const obstacleSpeedOnY = 1;
let obstaclePool = [];

// Game Objects

class Timer {
  constructor() {
    this.currentTime = 0;
    this.startTime = 0;
    this.intervalId = null;
  }

  start() {
    this.startTime = Date.now();
    this.intervalId = setInterval(() => {
      this.currentTime = Date.now() - this.startTime;
    }, 10);
  }

  getTimeInMs() {
    return this.currentTime;
  }

  getTimeInSeconds() {
    return Math.floor(this.currentTime / 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

}

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
  }

  draw() {
    context.drawImage(this.img, this.x, this.y, this.width, this.heigth);
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
    this.creationTimestamp = Date.now();
    this.width = Math.floor(Math.random() * (canvas.width / 2));
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
const timer = new Timer();
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
      console.log('player', plXMin, plXMax, plY);
      console.log('ob', obXMin, obXMax, obY);
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

    timer.start();
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

function drawGameOver() {
  context.beginPath()
  context.rect(0, 100, canvas.width, 200)
  context.fillStyle = 'black'
  context.fill()
}

function newObstacleNeeded() {
  /* Allow for new obstacle to be generated after a given time has passed
  ** or shortly after the start of the game (but not directly after the start)
  */
  const len = obstaclePool.length;
  return (!len && timer.getTimeInMs() > obstacleFrequencyMs / 2)
    || (len && Date.now() - obstaclePool[len - 1].creationTimestamp >= obstacleFrequencyMs);
}

function renderGame() {
  if (gameStartedState && newObstacleNeeded()) {
    obstaclePool.push(new Obstacle());
  }
  obstaclePool.forEach(obstacle => {
    obstacle.move();
  });

  obstaclePool = obstaclePool.filter(obstacle => obstacle.y < canvas.height);

  if (hasPlayerColided()) {
    stopGame();
    drawGameOver();
  } else {
    clearCanvas();
    bg.draw();
    player.draw();
    obstaclePool.forEach(obstacle => {
      obstacle.draw();
    });
  }
}

window.onload = () => {
  document.getElementById('start-button').onclick = () => {
    startGame();
  };
  renderGame();
}

