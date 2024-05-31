const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('gameOverModal');
const retryButton = document.getElementById('retryButton');
const scoreDisplay = document.getElementById('scoreDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const difficultySelection = document.getElementById('difficultySelection');
const easyButton = document.getElementById('easyButton');
const mediumButton = document.getElementById('mediumButton');
const hardButton = document.getElementById('hardButton');

// Canvas dimensions
const width = 400;
const height = 600;
canvas.width = width;
canvas.height = height;

// Bird properties
let bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    gravity: 0,
    lift: -6,
    velocity: 0
};

// Pipe properties
const pipeWidth = 30;
let pipeGap = 180;
let pipes = [];
let pipeSpeed = 2;
let pipeInterval = 2000;
let pipeCreationInterval; // Define pipeCreationInterval

// Game properties
let score = 0;
let gameOver = false;
let highScore = 0;

// Difficulty settings
const settings = {
    easy: { gravity: 0.2, pipeSpeed: 2, pipeGap: 180, pipeInterval: 1500 },
    medium: { gravity: 0.3, pipeSpeed: 3, pipeGap: 150, pipeInterval: 1200 },
    hard: { gravity: 0.4, pipeSpeed: 4, pipeGap: 120, pipeInterval: 900 }
};

// Event listeners for difficulty buttons
easyButton.addEventListener('click', () => startGame('easy'));
mediumButton.addEventListener('click', () => startGame('medium'));
hardButton.addEventListener('click', () => startGame('hard'));

retryButton.addEventListener('click', () => {
    modal.style.display = 'none';
    difficultySelection.style.display = 'flex';
    canvas.style.display = 'none';
});

// Function to start the game
function startGame(difficulty) {
    const setting = settings[difficulty];
    bird.gravity = setting.gravity;
    pipeSpeed = setting.pipeSpeed;
    pipeGap = setting.pipeGap;
    pipeInterval = setting.pipeInterval;
    highScore = localStorage.getItem(`${difficulty}HighScore`) || 0;
    highScoreDisplay.innerText = `High Score: ${highScore}`;
    resetGame();
    difficultySelection.style.display = 'none';
    canvas.style.display = 'block';
}

// Function to reset the game
function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    modal.style.display = 'none';
    clearInterval(pipeCreationInterval); // Clear previous interval
    createPipe();
    pipeCreationInterval = setInterval(createPipe, pipeInterval);
    gameLoop();
}

// Function to draw the bird
function drawBird() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

// Function to draw pipes
function drawPipes() {
    ctx.fillStyle = 'green';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, pipe.top + pipeGap, pipeWidth, height - pipe.top - pipeGap);
    });
}

// Function to create pipes
function createPipe() {
    const pipeX = width;
    const minHeight = 50;
    const maxHeight = height - pipeGap - minHeight;
    const pipeTopHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
    pipes.push({ x: pipeX, top: pipeTopHeight });
}

// Function to move pipes
function movePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
    });

    // Remove off-screen pipes
    if (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
        pipes.shift();
        score++;
    }
}

// Function to check collisions
function checkCollisions() {
    pipes.forEach(pipe => {
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > pipe.top + pipeGap)
        ) {
            gameOver = true;
            updateHighScore();
        }
    });

    if (bird.y + bird.height > height || bird.y < 0) {
        gameOver = true;
        updateHighScore();
    }
}

// Function to update high score
function updateHighScore() {
    const currentDifficulty = getCurrentDifficulty();
    const currentHighScore = localStorage.getItem(`${currentDifficulty}HighScore`) || 0;
    if (score > currentHighScore) {
        localStorage.setItem(`${currentDifficulty}HighScore`, score);
        highScoreDisplay.innerText = `High Score: ${score}`;
    }
}

// Function to get the current difficulty setting
function getCurrentDifficulty() {
    if (bird.gravity === settings.easy.gravity) {
        return 'easy';
    } else if (bird.gravity === settings.medium.gravity) {
        return 'medium';
    } else {
        return 'hard';
    }
}

// Function to update game state
function update() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    movePipes();
    checkCollisions();

    if (gameOver) {
        scoreDisplay.innerText = `Score: ${score}`;
        modal.style.display = 'block';
        clearInterval(pipeCreationInterval);
        return;
    }
}

// Function to draw the game
function draw() {
    ctx.clearRect(0, 0, width, height);
    drawBird();
    drawPipes();
}

// Main game loop
function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Event listener for bird jump
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !gameOver) {
        bird.velocity = bird.lift;
    }
});
//Event listener for bird jump using tap on the mobile devices
canvas.addEventListener('touchstart', () => {
    if (!gameOver) {
        bird.velocity = bird.lift;
    }
});
// Initially hide game over modal and show difficulty selection
difficultySelection.style.display = 'flex';
modal.style.display = 'none';
canvas.style.display = 'none';
