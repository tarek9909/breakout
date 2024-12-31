let leftPressed = false;
let rightPressed = false;

let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

let playerWidth = 115;
let playerHeight = 10;
let playerVelocityX = 8;

let player = {
  x: boardWidth / 2 - playerWidth / 2,
  y: boardHeight - playerHeight - 5,
  width: playerWidth,
  height: playerHeight,
  velocityX: playerVelocityX,
};

let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 3;
let ballVelocityY = 2;

let ball = {
  x: boardWidth / 2,
  y: boardHeight / 2,
  width: ballWidth,
  height: ballHeight,
  velocityX: ballVelocityX,
  velocityY: ballVelocityY,
};

let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8;
let blockRows = 3;
let blockMaxRows = 10;
let blockCount = 0;

let blockX = 15;
let blockY = 45;

let score = 0;
let gameOver = false;

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  context.fillStyle = "skyblue";
  context.fillRect(player.x, player.y, player.width, player.height);

  requestAnimationFrame(update);
  document.addEventListener("keydown", movePlayer);

  createBlocks();
};

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") {
    leftPressed = true;
  } else if (e.code === "ArrowRight") {
    rightPressed = true;
  } else if (gameOver && e.code === "Space") {
    resetGame();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") {
    leftPressed = false;
  } else if (e.code === "ArrowRight") {
    rightPressed = false;
  }
});
function update() {
  requestAnimationFrame(update);

  if (gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);
  if (leftPressed) {
    player.x = Math.max(player.x - player.velocityX, 0);
  }
  if (rightPressed) {
    player.x = Math.min(player.x + player.velocityX, boardWidth - player.width);
  }

  context.fillStyle = "steelblue";
  context.fillRect(player.x, player.y, player.width, player.height);

  context.fillStyle = "seagreen";
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;
  context.beginPath();
  context.arc(
    ball.x + ball.width / 2,
    ball.y + ball.height / 1.2,
    ball.width / 1.2,
    0,
    2 * Math.PI
  );
  context.fill();
  context.closePath();

  updateBallVelocityDisplay();

  if (topCollision(ball, player)) {
    handleElasticCollision(ball, player);
  } else if (leftCollision(ball, player) || rightCollision(ball, player)) {
    ball.velocityX *= -1;
  }

  if (ball.y <= 0) {
    ball.velocityY *= -1;
  } else if (ball.x <= 0 || ball.x + ball.width >= boardWidth) {
    ball.velocityX *= -1;
  } else if (ball.y + ball.height >= boardHeight) {
    context.font = "20px 'Poppins', sans-serif";
    context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
    gameOver = true;
  }

  context.fillStyle = "indianred";
  for (let i = 0; i < blockArray.length; i++) {
    let block = blockArray[i];
    if (!block.break) {
      if (topCollision(ball, block) || bottomCollision(ball, block)) {
        block.break = true;
        ball.velocityY *= -1;
        score += 100;
        blockCount -= 1;
      } else if (leftCollision(ball, block) || rightCollision(ball, block)) {
        block.break = true;
        ball.velocityX *= -1;
        score += 100;
        blockCount -= 1;
      }
      context.fillRect(block.x, block.y, block.width, block.height);
    }
  }

  if (blockCount == 0) {
    score += 100 * blockRows * blockColumns;
    blockRows = Math.min(blockRows + 1, blockMaxRows);
    createBlocks();
  }

  context.font = "20px 'Poppins', sans-serif";
  context.fillText(score, 10, 25);
}

function updateBallVelocityDisplay() {
  const velocityText = `X: ${ball.velocityX.toFixed(
    2
  )}, Y: ${ball.velocityY.toFixed(2)}`;
  document.getElementById("ballVelocity").textContent = velocityText;
}

function outOfBounds(xPosition) {
  return xPosition < 0 || xPosition + playerWidth > boardWidth;
}

function movePlayer(e) {
  if (gameOver) {
    if (e.code === "Space") {
      resetGame();
    }
    return;
  }

  switch (e.code) {
    case "ArrowLeft":
      player.x = Math.max(player.x - player.velocityX, 0);
      break;
    case "ArrowRight":
      player.x = Math.min(
        player.x + player.velocityX,
        boardWidth - player.width
      );
      break;
    default:
      break;
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function topCollision(ball, block) {
  return detectCollision(ball, block) && ball.y + ball.height >= block.y;
}

function bottomCollision(ball, block) {
  return detectCollision(ball, block) && block.y + block.height >= ball.y;
}

function leftCollision(ball, block) {
  return detectCollision(ball, block) && ball.x + ball.width >= block.x;
}

function rightCollision(ball, block) {
  return detectCollision(ball, block) && block.x + block.width >= ball.x;
}

function createBlocks() {
  blockArray = [];
  for (let c = 0; c < blockColumns; c++) {
    for (let r = 0; r < blockRows; r++) {
      let block = {
        x: blockX + c * blockWidth + c * 10,
        y: blockY + r * blockHeight + r * 10,
        width: blockWidth,
        height: blockHeight,
        break: false,
      };
      blockArray.push(block);
    }
  }
  blockCount = blockArray.length;

  player.width = Math.max(player.width - 20, 20);
  ball.velocityX += 2;
  ball.velocityY += 1;
  player.velocityX += 1;
  player.x = Math.min(player.x, boardWidth - player.width);
}

function handleElasticCollision(ball, object) {
  const objectCenter = object.x + object.width / 2;
  const ballCenter = ball.x + ball.width / 2;

  const collisionPoint = (ballCenter - objectCenter) / (object.width / 2);

  const maxBounceAngle = Math.PI / 3;
  const bounceAngle = collisionPoint * maxBounceAngle;

  const speed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);

  ball.velocityX = speed * Math.sin(bounceAngle);
  ball.velocityY = -speed * Math.cos(bounceAngle);
}

function resetGame() {
  gameOver = false;
  player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX,
  };
  ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY,
  };
  blockArray = [];
  blockRows = 3;
  score = 0;
  createBlocks();
}
