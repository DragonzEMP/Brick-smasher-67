const fs = require('fs');

let code = fs.readFileSync('g:/Work/DexBALL/game.js', 'utf8');

const gameLoopOld = `function gameLoop() {
    if (!isPaused) {
        const continueGame = update();
        if (!continueGame) return; // Exit loop if level complete or game over
        draw();
    }
    gameLoopId = requestAnimationFrame(gameLoop);
}`;

const gameLoopNew = `function gameLoop() {
    try {
        if (!isPaused) {
            const continueGame = update();
            if (!continueGame) return; // Exit loop if level complete or game over
            draw();
        }
        gameLoopId = requestAnimationFrame(gameLoop);
    } catch (e) {
        alert('GAMELOOP ERROR: ' + e.message + '\\n' + e.stack);
    }
}`;

const startGameOld = `function startGame(levelNumber) {
    console.log("Starting Level: " + levelNumber);
    showScreen(gameScreen);
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    // Reset game state
    score = 0;
    lives = 3;
    isGameRunning = true;
    
    loadLevel(levelNumber);
    
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameLoop();
}`;

const startGameNew = `function startGame(levelNumber) {
    try {
        console.log("Starting Level: " + levelNumber);
        showScreen(gameScreen);
        
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        // Reset game state
        score = 0;
        lives = 3;
        isGameRunning = true;
        
        loadLevel(levelNumber);
        
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        gameLoop();
    } catch(e) {
        alert('STARTGAME ERROR: ' + e.message + '\\n' + e.stack);
    }
}`;

code = code.replace(gameLoopOld, gameLoopNew);
code = code.replace(startGameOld, startGameNew);

fs.writeFileSync('g:/Work/DexBALL/game.js', code);
console.log('Patched game.js!');
