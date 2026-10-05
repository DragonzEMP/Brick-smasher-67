const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const baseSpeedX = isMobileDevice ? 2.5 : 5;
const baseSpeedY = isMobileDevice ? -2.5 : -5;
const baseSpeedMultiplier = isMobileDevice ? 0.5 : 1;

// Mode state
let currentGameMode = 'campaign';
let timeAttackTimer = 0;
let endlessDropTimer = 0;
let lastFrameTime = 0;

// Screen elements
const startScreen = document.getElementById('start-screen');
const mainMenu = document.getElementById('main-menu');
const levelSelector = document.getElementById('level-selector');
const gameScreen = document.getElementById('game-screen');

// Button elements
const startBtn = document.getElementById('start-btn');
const btnCampaign = document.getElementById('btn-campaign');
const btnEndless = document.getElementById('btn-endless');
const btnTimeAttack = document.getElementById('btn-timeattack');
const btnSurvival = document.getElementById('btn-survival');
const exitBtn = document.getElementById('exit-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const levelGrid = document.getElementById('level-grid');


// Custom Popup Logic
let popupCallback = null;

function showPopup(title, message, callback) {
    document.getElementById('custom-popup-title').innerText = title;
    document.getElementById('custom-popup-message').innerText = message;
    popupCallback = callback;
    document.getElementById('custom-popup-overlay').classList.remove('hidden');
    isPaused = true;
}


    document.getElementById('custom-popup-btn').addEventListener('click', () => {
        document.getElementById('custom-popup-overlay').classList.add('hidden');
        if (popupCallback) {
            let cb = popupCallback;
            popupCallback = null;
            cb();
        }
});

// Helper function to switch screens
function showScreen(screenToShow) {
    // Hide all screens
    startScreen.classList.remove('active');
    mainMenu.classList.remove('active');
    levelSelector.classList.remove('active');
    gameScreen.classList.remove('active');
    let hs = document.getElementById('help-screen');
    if (hs) hs.classList.remove('active');
    
    // Show the target screen
    screenToShow.classList.add('active');
    
    if (screenToShow !== gameScreen && typeof startMenuMusic === 'function') {
        startMenuMusic();
    }
}

// Event Listeners for Menus
startBtn.addEventListener('click', () => showScreen(mainMenu));
btnCampaign.addEventListener('click', () => {
    currentGameMode = 'campaign';
    showScreen(levelSelector);
});
btnEndless.addEventListener('click', () => {
    currentGameMode = 'endless';
    startGame(1);
});
btnTimeAttack.addEventListener('click', () => {
    currentGameMode = 'timeattack';
    startGame(1);
});
btnSurvival.addEventListener('click', () => {
    currentGameMode = 'survival';
    startGame(1);
});
backToMenuBtn.addEventListener('click', () => showScreen(mainMenu));

exitBtn.addEventListener('click', () => {
    // Browsers don't allow JS to close tabs it didn't open, 
    // so we will just send them back to the start screen.
    showScreen(startScreen); 
});

const totalLevels = levelLayouts.length;
const levelsPerPage = 15;
let currentLevelPage = 0;
const totalPages = Math.ceil(totalLevels / levelsPerPage);

const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const pageIndicator = document.getElementById('page-indicator');

function renderLevelButtons() {
    levelGrid.innerHTML = '';
    
    const startLevel = currentLevelPage * levelsPerPage + 1;
    const endLevel = Math.min((currentLevelPage + 1) * levelsPerPage, totalLevels);
    
    for (let i = startLevel; i <= endLevel; i++) {
        const levelBtn = document.createElement('button');
        levelBtn.innerText = i;
        levelBtn.addEventListener('click', () => {
            startGame(i);
        });
        levelGrid.appendChild(levelBtn);
    }
    
    pageIndicator.innerText = `${currentLevelPage + 1} / ${totalPages}`;
    
    prevPageBtn.style.visibility = currentLevelPage > 0 ? 'visible' : 'hidden';
    nextPageBtn.style.visibility = currentLevelPage < totalPages - 1 ? 'visible' : 'hidden';
}

prevPageBtn.addEventListener('click', () => {
    if (currentLevelPage > 0) {
        currentLevelPage--;
        renderLevelButtons();
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentLevelPage < totalPages - 1) {
        currentLevelPage++;
        renderLevelButtons();
    }
});

// Initial render
renderLevelButtons();

// --- Help Menu Logic ---
const powerUpDescriptions = {
    life: "Extra Life (+1 Life)", expand: "Expand Paddle", slow: "Slow Ball", thru: "Thru-Brick (Smash without bouncing)", 
    shrink: "Shrink Paddle", fast: "Fast Ball", kill: "Kill (Instant death!)", warp: "Level Warp (Skip to next stage)", 
    split: "Split Ball (Duplicates active balls)", laser: "Laser Paddle (Press Space to shoot)", fireball: "Fireball (Explosive blast radius)", 
    grab: "Grab (Catch balls, Space to release)", shrinkball: "Shrink Ball (Harder to hit)", eightball: "Eight Ball (Massive multi-ball split)", 
    gravity: "Gravity Ball (Pulls towards paddle)", double: "Double Score Multiplier", zap: "Zap Bricks (Clears lowest active row)", 
    supershrink: "Super Shrink (Tiny paddle!)", timeslow: "Time Slow (Matrix mode)", timestop: "Time Stop (Freeze frame)", 
    lightning: "Lightning (Zaps random bricks)", falling: "Falling Bricks (Grid drops down!)"
};

let currentHelpPage = 0;
const helpItemsPerPage = 5;

const helpBtn = document.getElementById('help-btn');
const helpScreen = document.getElementById('help-screen');
const helpContent = document.getElementById('help-content');
const helpPrevBtn = document.getElementById('help-prev-btn');
const helpNextBtn = document.getElementById('help-next-btn');
const helpBackBtn = document.getElementById('help-back-btn');

if (helpBtn) {
    helpBtn.addEventListener('click', () => {
        currentHelpPage = 0;
        renderHelpPage();
        showScreen(helpScreen);
    });
}

if (helpBackBtn) {
    helpBackBtn.addEventListener('click', () => {
        showScreen(mainMenu);
    });
}

function renderHelpPage() {
    if (!helpContent) return;
    helpContent.innerHTML = '';
    let start = currentHelpPage * helpItemsPerPage;
    let end = Math.min(start + helpItemsPerPage, powerUpRoster.length);
    
    for (let i = start; i < end; i++) {
        let item = powerUpRoster[i];
        
        let row = document.createElement('div');
        row.className = 'help-row';
        
        let canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 30;
        let tempCtx = canvas.getContext('2d');
        
        drawCapsule(tempCtx, 5, 5, item.category, item.id);
        
        let desc = document.createElement('span');
        desc.className = 'help-desc';
        desc.innerText = powerUpDescriptions[item.id] || "Unknown Power-up";
        
        row.appendChild(canvas);
        row.appendChild(desc);
        helpContent.appendChild(row);
    }
    
    if (helpPrevBtn) helpPrevBtn.style.visibility = currentHelpPage === 0 ? 'hidden' : 'visible';
    if (helpNextBtn) helpNextBtn.style.visibility = end >= powerUpRoster.length ? 'hidden' : 'visible';
}

if (helpPrevBtn) {
    helpPrevBtn.addEventListener('click', () => {
        if (currentHelpPage > 0) {
            currentHelpPage--;
            renderHelpPage();
        }
    });
}

if (helpNextBtn) {
    helpNextBtn.addEventListener('click', () => {
        if ((currentHelpPage + 1) * helpItemsPerPage < powerUpRoster.length) {
            currentHelpPage++;
            renderHelpPage();
        }
    });
}

// --- Canvas & Game Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Ensure paddle stays on screen
    try {
        paddle.y = canvas.height - 30;
        if (paddle.x + paddle.width > canvas.width) {
            paddle.x = canvas.width - paddle.width;
        }
    } catch(e) {
        // Ignore TDZ ReferenceError during script load
    }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


let audioCtx = null;
try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
        audioCtx = new AudioContextClass();
    }
} catch (e) {
    console.warn('Audio context not supported or blocked:', e);
}

let masterVolume = 0.5;
let isPaused = false;

function playSound(type) {
    if (!audioCtx) return;
    
    if (audioCtx.state === 'suspended') {
        try { audioCtx.resume(); } catch(e) {}
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    gain.gain.value = masterVolume;
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'brick') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'metal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === 'paddle') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'powerup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
    } else if (type === 'drop') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'explosion') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(masterVolume * 2, now);
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

// --- Menu Music Logic ---
let menuMusicTimer = null;
let currentNoteIndex = 0;
let isMenuMusicPlaying = false;
const themeNotes = [220, 261, 329, 440, 329, 261, 220, 164, 220, 293, 349, 466, 349, 293, 220, 164];

function playMusicalNote(frequency) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        try { audioCtx.resume(); } catch(e) {}
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    gain.gain.value = masterVolume * 0.2; // slightly quieter
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    // Quick pluck
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.1);
}

function startMenuMusic() {
    if (isMenuMusicPlaying || !audioCtx) return;
    if (audioCtx.state === 'suspended') {
        try { audioCtx.resume(); } catch(e) {}
    }
    isMenuMusicPlaying = true;
    menuMusicTimer = setInterval(() => {
        playMusicalNote(themeNotes[currentNoteIndex]);
        currentNoteIndex = (currentNoteIndex + 1) % themeNotes.length;
    }, 150);
}

function stopMenuMusic() {
    if (menuMusicTimer) clearInterval(menuMusicTimer);
    isMenuMusicPlaying = false;
    currentNoteIndex = 0;
}

document.addEventListener('click', () => { 
    if (audioCtx && audioCtx.state === 'suspended') {
        try { audioCtx.resume(); } catch(e) {}
    }
    if (!isGameRunning) startMenuMusic(); 
}, { once: true });

let gameLoopId;
let isGameRunning = false;
let score = 0;
let lives = 3;
let scoreMultiplier = 1;
let balls = [];
let lasers = [];
let grabbedBalls = [];
let timeSlowTimer = 0;
let timeStopTimer = 0;

const powerUpRoster = [
    { id: 'life', text: 'XL', category: 'positive' },
    { id: 'expand', text: 'E', category: 'positive' },
    { id: 'slow', text: 'SL', category: 'positive' },
    { id: 'thru', text: 'T', category: 'positive' },
    { id: 'shrink', text: 'S', category: 'negative' },
    { id: 'fast', text: 'F', category: 'negative' },
    { id: 'kill', text: 'K', category: 'negative' },
    { id: 'warp', text: 'W', category: 'special' },
    { id: 'split', text: 'SP', category: 'positive' },
    { id: 'laser', text: 'LSR', category: 'positive' },
    { id: 'fireball', text: 'FB', category: 'positive' },
    { id: 'grab', text: 'G', category: 'positive' },
    { id: 'shrinkball', text: 'SB', category: 'negative' },
    { id: 'eightball', text: '8B', category: 'positive' },
    { id: 'gravity', text: 'GB', category: 'special' },
    { id: 'double', text: '2X', category: 'positive' },
    { id: 'zap', text: 'ZB', category: 'positive' },
    { id: 'supershrink', text: 'SS', category: 'negative' },
    { id: 'timeslow', text: 'T-SL', category: 'special' },
    { id: 'timestop', text: 'T-ST', category: 'special' },
    { id: 'lightning', text: 'LT', category: 'special' },
    { id: 'falling', text: 'F-BR', category: 'negative' }
];

let currentLevel = 1;
let highScore = 0;
try {
    highScore = localStorage.getItem('dexball_highscore') || 0;
} catch (e) {
    console.warn("localStorage blocked");
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        try {
            localStorage.setItem('dexball_highscore', highScore);
        } catch(e) {}
    }
    document.getElementById('high-score-display').innerText = "High Score: " + highScore;
    document.getElementById('menu-high-score').innerText = "High Score: " + highScore;
}

const paddle = {
    width: 75,
    height: 10,
    x: (canvas.width - 75) / 2,
    y: window.innerHeight - 30,
    speed: 7,
    isLaser: false,
    isMagnetic: false,
    isFireball: false,
    isGravityPull: false
};

// Keyboard state
let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

document.getElementById('volume-slider').addEventListener('input', (e) => {
    masterVolume = parseFloat(e.target.value);
});

const pauseOverlay = document.getElementById('pause-overlay');

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseOverlay.classList.remove('hidden');
    } else {
        pauseOverlay.classList.add('hidden');
    }
}

document.getElementById('mobile-pause-btn').addEventListener('click', togglePause);
document.getElementById('resume-btn').addEventListener('click', togglePause);
document.getElementById('exit-pause-btn').addEventListener('click', () => {
    isGameRunning = false;
    isPaused = false;
    pauseOverlay.classList.add('hidden');
    showScreen(mainMenu);
});

// Mobile touch listener for paddle
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    // Restrict to bottom 50% of the screen
    if (touch.clientY > canvas.height / 2) {
        let newX = touch.clientX - paddle.width / 2;
        // Clamp to left and right boundaries
        if (newX < 0) newX = 0;
        if (newX > canvas.width - paddle.width) newX = canvas.width - paddle.width;
        paddle.x = newX;
    }
}, { passive: false });

// Mobile action button (simulates spacebar)
canvas.addEventListener('touchstart', (e) => {
    if (!isGameRunning || isPaused) return;
    if (paddle.isLaser) {
        lasers.push({ x: paddle.x + 10, y: paddle.y || paddle.y, speedY: -10 });
        lasers.push({ x: paddle.x + paddle.width - 10, y: paddle.y || paddle.y, speedY: -10 });
        playSound('laser');
    }
    if (paddle.isMagnetic && grabbedBalls.length > 0) {
        for (let i = 0; i < grabbedBalls.length; i++) {
            let b = grabbedBalls[i];
            b.speedY = baseSpeedY;
            b.speedX = (b.grabOffsetX - paddle.width / 2) / (paddle.width / 2) * (4 * baseSpeedMultiplier);
            if (b.speedX === 0) b.speedX = (Math.random() - 0.5); // Prevent fully vertical bounce lock
            balls.push(b);
        }
        grabbedBalls = [];
        playSound('paddle');
    }
}, { passive: false });

function keyDownHandler(e) {
    if (e.key === 'Escape' && isGameRunning) {
        togglePause();
    }
    if (e.key === ' ' && isGameRunning && !isPaused) {
        if (paddle.isLaser) {
            lasers.push({ x: paddle.x + 10, y: paddle.y || paddle.y, speedY: -10 });
            lasers.push({ x: paddle.x + paddle.width - 10, y: paddle.y || paddle.y, speedY: -10 });
            playSound('laser');
        }
        if (paddle.isMagnetic && grabbedBalls.length > 0) {
            for (let i = 0; i < grabbedBalls.length; i++) {
                let b = grabbedBalls[i];
                b.speedY = baseSpeedY;
                b.speedX = (b.grabOffsetX - paddle.width / 2) / (paddle.width / 2) * (4 * baseSpeedMultiplier);
                if (b.speedX === 0) b.speedX = (Math.random() - 0.5); // Prevent fully vertical bounce lock
                balls.push(b);
            }
            grabbedBalls = [];
            playSound('paddle');
        }
    }
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
}

// 1. Define a brick configuration object
const brickConfig = {
    rowCount: 5,
    columnCount: 8,
    width: 75,
    height: 20,
    padding: 10,
    offsetTop: 30,
    offsetLeft: 60
};

// 2. Create a 2D array to store the active level layout
let bricks = [];


function generateRandomRow() {
    let row = [];
    for (let i = 0; i < 15; i++) {
        let rand = Math.random();
        if (rand < 0.1) row.push(0); // 10% empty
        else if (rand < 0.2) row.push(3); // 10% indestructible
        else if (rand < 0.6) row.push(2); // 40% power-up
        else row.push(1); // 40% standard
    }
    // Ensure the outer edges aren't solidly blocked by 3s
    if (row[0] === 3) row[0] = 1;
    if (row[14] === 3) row[14] = 1;
    return row;
}

function generateRandomBoard(rowCount) {
    let board = [];
    for (let i = 0; i < rowCount; i++) {
        board.push(generateRandomRow());
    }
    // Ensure at least the bottom 3 rows of the board are strictly 0 (empty)
    board.push(new Array(15).fill(0));
    board.push(new Array(15).fill(0));
    board.push(new Array(15).fill(0));
    return board;
}

function initBricks(levelNumber) {
    let layout;
    if (currentGameMode === 'endless' || currentGameMode === 'timeattack') {
        layout = generateRandomBoard(8);
    } else {
        const layoutIndex = (levelNumber - 1) % levelLayouts.length;
        layout = levelLayouts[layoutIndex];
    }
    
    brickConfig.columnCount = layout[0].length;
    brickConfig.rowCount = layout.length;
    brickConfig.width = (canvas.width - (brickConfig.padding * (brickConfig.columnCount + 1))) / brickConfig.columnCount;
    brickConfig.height = 25;
    brickConfig.offsetLeft = brickConfig.padding;
    
    bricks = [];
    for (let r = 0; r < brickConfig.rowCount; r++) {
        bricks[r] = [];
        for (let c = 0; c < brickConfig.columnCount; c++) {
            bricks[r][c] = layout[r][c]; // Deep copy
        }
    }
}

function spawnPowerUp(brickX, brickY) {
    const selectedUp = powerUpRoster[Math.floor(Math.random() * powerUpRoster.length)];
    powerUps.push({
        x: brickX + brickConfig.width / 2,
        y: brickY + brickConfig.height / 2,
        speedY: 3,
        id: selectedUp.id,
        text: selectedUp.text,
        category: selectedUp.category
    });
}

// 3. Create a drawBricks() function
function drawBricks() {
    for (let r = 0; r < brickConfig.rowCount; r++) {
        for (let c = 0; c < brickConfig.columnCount; c++) {
            const val = bricks[r][c];
            if (val > 0) {
                const brickX = (c * (brickConfig.width + brickConfig.padding)) + brickConfig.offsetLeft;
                const brickY = (r * (brickConfig.height + brickConfig.padding)) + brickConfig.offsetTop;
                const w = brickConfig.width;
                const h = brickConfig.height;
                
                ctx.save(); // Save state before applying glow/shadows to prevent bleeding
                
                if (val === 1) {
                    // Standard Brick
                    const grad = ctx.createLinearGradient(brickX, brickY, brickX, brickY + h);
                    grad.addColorStop(0, '#ff0077');
                    grad.addColorStop(1, '#880033');
                    ctx.fillStyle = grad;
                    
                    ctx.shadowColor = '#ff0077';
                    ctx.shadowBlur = 10;
                    
                    ctx.beginPath();
                    if (ctx.roundRect) ctx.roundRect(brickX, brickY, w, h, 4);
                    else ctx.rect(brickX, brickY, w, h);
                    ctx.fill();
                    
                    ctx.shadowBlur = 0; // Reset shadow for internal drawing
                    
                    // 3D Bevel Top & Left (Highlight)
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                    ctx.beginPath();
                    ctx.moveTo(brickX + 2, brickY + h - 2);
                    ctx.lineTo(brickX + 2, brickY + 2);
                    ctx.lineTo(brickX + w - 2, brickY + 2);
                    ctx.stroke();
                    
                    // 3D Bevel Bottom & Right (Shadow)
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx.beginPath();
                    ctx.moveTo(brickX + w - 2, brickY + 2);
                    ctx.lineTo(brickX + w - 2, brickY + h - 2);
                    ctx.lineTo(brickX + 2, brickY + h - 2);
                    ctx.stroke();
                    
                } else if (val === 2) {
                    // Anti-Gravity / Power-Up Brick
                    const grad = ctx.createLinearGradient(brickX, brickY, brickX, brickY + h);
                    grad.addColorStop(0, '#00ffff');
                    grad.addColorStop(1, '#005588');
                    ctx.fillStyle = grad;
                    
                    ctx.shadowColor = '#00ffff';
                    ctx.shadowBlur = 15;
                    
                    ctx.beginPath();
                    if (ctx.roundRect) ctx.roundRect(brickX, brickY, w, h, 4);
                    else ctx.rect(brickX, brickY, w, h);
                    ctx.fill();
                    
                    ctx.shadowBlur = 0;
                    
                    // Core Rectangle
                    ctx.fillStyle = '#e0ffff';
                    ctx.beginPath();
                    if (ctx.roundRect) ctx.roundRect(brickX + w * 0.25, brickY + h * 0.35, w * 0.5, h * 0.3, 2);
                    else ctx.rect(brickX + w * 0.25, brickY + h * 0.35, w * 0.5, h * 0.3);
                    ctx.fill();
                    
                } else if (val === 3) {
                    // Indestructible Brick
                    const grad = ctx.createLinearGradient(brickX, brickY, brickX, brickY + h);
                    grad.addColorStop(0, '#666666');
                    grad.addColorStop(1, '#222222');
                    ctx.fillStyle = grad;
                    
                    ctx.shadowColor = '#000000';
                    ctx.shadowBlur = 5;
                    ctx.shadowOffsetY = 3;
                    
                    ctx.beginPath();
                    if (ctx.roundRect) ctx.roundRect(brickX, brickY, w, h, 4);
                    else ctx.rect(brickX, brickY, w, h);
                    ctx.fill();
                    
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetY = 0;
                    
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 1;
                    ctx.stroke(); // Add the black border
                    
                    // Rivets
                    ctx.fillStyle = '#111111';
                    const offset = 6;
                    ctx.beginPath();
                    ctx.arc(brickX + offset, brickY + offset, 2, 0, Math.PI * 2);
                    ctx.arc(brickX + w - offset, brickY + offset, 2, 0, Math.PI * 2);
                    ctx.arc(brickX + offset, brickY + h - offset, 2, 0, Math.PI * 2);
                    ctx.arc(brickX + w - offset, brickY + h - offset, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.restore(); // MUST restore to stop shadows/glows from bleeding to other objects
            }
        }
    }
}

function drawPaddle() {
    ctx.save();
    
    let dynamicColor = '#00ffff';
    if (paddle.isFireball) dynamicColor = '#ff6600';
    else if (paddle.isMagnetic) dynamicColor = '#cc00ff';

    // 4. Laser Cannons
    if (paddle.isLaser) {
        ctx.fillStyle = '#666';
        ctx.fillRect(paddle.x + 5, paddle.y - 8, 10, 15);
        ctx.fillRect(paddle.x + paddle.width - 15, paddle.y - 8, 10, 15);
        
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 5;
        ctx.fillRect(paddle.x + 5, paddle.y - 12, 10, 4);
        ctx.fillRect(paddle.x + paddle.width - 15, paddle.y - 12, 10, 4);
        ctx.shadowBlur = 0;
    }

    // 1. Core Paddle Rendering
    const grad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    grad.addColorStop(0, '#aaaaaa');
    grad.addColorStop(0.5, '#ffffff');
    grad.addColorStop(1, '#444444');
    
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, paddle.height / 2);
    else ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    ctx.fillStyle = grad;
    ctx.shadowColor = dynamicColor;
    ctx.shadowBlur = 10;
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. Neon Energy Core
    ctx.beginPath();
    ctx.moveTo(paddle.x + 10, paddle.y + paddle.height / 2);
    ctx.lineTo(paddle.x + paddle.width - 10, paddle.y + paddle.height / 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = dynamicColor;
    ctx.shadowBlur = 10;
    ctx.stroke();
    
    ctx.shadowBlur = 0;

    // 3. Magnetic Aura Effect
    if (paddle.isMagnetic) {
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(paddle.x, paddle.y - 5, paddle.width, 2, 1);
        else ctx.rect(paddle.x, paddle.y - 5, paddle.width, 2);
        ctx.strokeStyle = '#cc00ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#cc00ff';
        ctx.shadowBlur = 15;
        ctx.stroke();
    }

    ctx.restore();
}

function update() {
    if (!isGameRunning) return false;

    if (timeSlowTimer > 0) timeSlowTimer--;
    if (timeStopTimer > 0) timeStopTimer--;

    // Paddle movement
    if(rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    }
    else if(leftPressed && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }

    // Grabbed balls movement
    for (let i = 0; i < grabbedBalls.length; i++) {
        let gb = grabbedBalls[i];
        gb.x = paddle.x + gb.grabOffsetX;
        gb.y = paddle.y - gb.radius;
    }

    // Laser Logic
    for (let i = lasers.length - 1; i >= 0; i--) {
        let l = lasers[i];
        if (timeStopTimer > 0) {
            // freeze
        } else if (timeSlowTimer > 0) {
            l.y += l.speedY * 0.5;
        } else {
            l.y += l.speedY;
        }
        let laserHit = false;

        for (let r = 0; r < brickConfig.rowCount; r++) {
            for (let c = 0; c < brickConfig.columnCount; c++) {
                let val = bricks[r][c];
                if (val === 1 || val === 2) {
                    const brickX = (c * (brickConfig.width + brickConfig.padding)) + brickConfig.offsetLeft;
                    const brickY = (r * (brickConfig.height + brickConfig.padding)) + brickConfig.offsetTop;
                    if (l.x > brickX && l.x < brickX + brickConfig.width && l.y > brickY && l.y < brickY + brickConfig.height) {
                        playSound('brick');
                        bricks[r][c] = 0;
                        score += ((val === 1) ? 10 : 50) * scoreMultiplier;
                        if (val === 2) spawnPowerUp(brickX, brickY);
                        laserHit = true;
                        break;
                    }
                }
            }
            if (laserHit) break;
        }

        if (laserHit || l.y < 0) {
            lasers.splice(i, 1);
        }
    }

    let activeBricksCount = 0;

    // Balls logic
    for (let i = balls.length - 1; i >= 0; i--) {
        let b = balls[i];
        if (paddle.isGravityPull && timeStopTimer === 0) {
            let pull = ((paddle.x + paddle.width / 2) - b.x) * 0.005;
            b.speedX += pull;
            b.speedX = Math.max(-9, Math.min(9, b.speedX));
        }
        if (timeStopTimer > 0) {
            // freeze
        } else if (timeSlowTimer > 0) {
            b.x += b.speedX * 0.5;
            b.y += b.speedY * 0.5;
        } else {
            b.x += b.speedX;
            b.y += b.speedY;
        }

        // Side wall collision
        if(b.x + b.speedX > canvas.width - b.radius || b.x + b.speedX < b.radius) {
            b.speedX = -b.speedX;
        }
        
        // Top wall collision
        if(b.y + b.speedY < b.radius) {
            b.speedY = -b.speedY;
        } 
        // Bottom wall (floor) collision
        else if(b.y + b.speedY > canvas.height - b.radius) {
            playSound('drop');
            balls.splice(i, 1);
            continue;
        }

        // Ball-to-paddle collision
        if (b.y + b.radius >= paddle.y && 
            b.x >= paddle.x && b.x <= paddle.x + paddle.width) {
            if (b.speedY > 0) {
                if (b.isShrunk) {
                    b.radius = 8;
                    b.isShrunk = false;
                }
                paddle.isFireball = false; // Wears off on hit
                if (paddle.isMagnetic) {
                    b.grabOffsetX = b.x - paddle.x;
                    b.speedX = 0;
                    b.speedY = 0;
                    b.y = paddle.y - b.radius;
                    grabbedBalls.push(b);
                    balls.splice(i, 1);
                    continue;
                } else {
                    playSound('paddle');
                    b.speedY = -b.speedY;
                    b.y = paddle.y - b.radius; // Prevent sticking
                    b.isPiercing = false;
                }
            }
        }

        // Add ball-to-brick collision detection
        for (let r = 0; r < brickConfig.rowCount; r++) {
            for (let c = 0; c < brickConfig.columnCount; c++) {
                const val = bricks[r][c];
                if (val > 0) {
                    // We only want to count active bricks once per frame, not per ball. 
                    // But we're in the ball loop. So we will count them at the end of the frame instead.
                    const brickX = (c * (brickConfig.width + brickConfig.padding)) + brickConfig.offsetLeft;
                    const brickY = (r * (brickConfig.height + brickConfig.padding)) + brickConfig.offsetTop;
                    
                    // If the ball's coordinates intersect with a brick
                    if (b.x > brickX && b.x < brickX + brickConfig.width &&
                        b.y > brickY && b.y < brickY + brickConfig.height) {
                        
                        if (!b.isPiercing || val === 3) {
                            b.speedY = -b.speedY; // reverse speedY
                        }
                        
                        if (val === 1 || val === 2) {
                            if (paddle.isFireball) {
                                playSound('explosion');
                                for (let dr = -1; dr <= 1; dr++) {
                                    for (let dc = -1; dc <= 1; dc++) {
                                        let er = r + dr;
                                        let ec = c + dc;
                                        if (er >= 0 && er < brickConfig.rowCount && ec >= 0 && ec < brickConfig.columnCount) {
                                            let evalType = bricks[er][ec];
                                            if (evalType === 1 || evalType === 2) {
                                                bricks[er][ec] = 0;
                                                score += ((evalType === 1) ? 10 : 50) * scoreMultiplier;
                                                if (evalType === 2) {
                                                    const ebX = (ec * (brickConfig.width + brickConfig.padding)) + brickConfig.offsetLeft;
                                                    const ebY = (er * (brickConfig.height + brickConfig.padding)) + brickConfig.offsetTop;
                                                    spawnPowerUp(ebX, ebY);
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                playSound('brick');
                                bricks[r][c] = 0;
                                score += ((val === 1) ? 10 : 50) * scoreMultiplier;
                                if (val === 2) spawnPowerUp(brickX, brickY);
                            }
                        } else if (val === 3) {
                            playSound('metal');
                        }
                    }
                }
            }
        }
    }

    if (balls.length === 0 && grabbedBalls.length === 0) {
        lives--;
        scoreMultiplier = 1;
        timeSlowTimer = 0;
        timeStopTimer = 0;
        paddle.isLaser = false;
        paddle.isMagnetic = false;
        paddle.isFireball = false;
        paddle.isGravityPull = false;
        if(lives === 0) {
            showPopup("GAME OVER", "You ran out of lives. Final Score: " + score, () => {
                isGameRunning = false;
                isPaused = false;
                updateHighScore();
                showScreen(mainMenu);
                if (typeof startMenuMusic === 'function') startMenuMusic();
            });
            return false;
        } else {
            // Reset ball and paddle
            balls = [{ x: canvas.width/2, y: canvas.height-50, radius: 8, speedX: baseSpeedX, speedY: baseSpeedY, color: '#00ffff', isPiercing: false }];
            paddle.x = (canvas.width - paddle.width) / 2;
        }
    }

    // Active Bricks Sweep
    for (let r = 0; r < brickConfig.rowCount; r++) {
        for (let c = 0; c < brickConfig.columnCount; c++) {
            if (bricks[r][c] === 1 || bricks[r][c] === 2) activeBricksCount++;
        }
    }

    // Power-up logic
    for (let i = powerUps.length - 1; i >= 0; i--) {
        let p = powerUps[i];
        if (timeStopTimer > 0) {
            // freeze
        } else if (timeSlowTimer > 0) {
            p.y += p.speedY * 0.5;
        } else {
            p.y += p.speedY;
        }

        // Paddle collision (AABB)
        if (p.x + 18 >= paddle.x && 
            p.x - 18 <= paddle.x + paddle.width &&
            p.y + 8 >= paddle.y) {
            
            playSound('powerup');
            
            switch(p.id) {
                case 'life': lives++; break;
                case 'expand': paddle.width = Math.min(paddle.width + 40, 200); break;
                case 'shrink': paddle.width = Math.max(paddle.width - 40, 50); break;
                case 'fast': 
                    for (let j = 0; j < balls.length; j++) {
                        balls[j].speedX *= 1.3; 
                        balls[j].speedY *= 1.3;
                    }
                    break;
                case 'slow': 
                    for (let j = 0; j < balls.length; j++) {
                        balls[j].speedX *= 0.75; 
                        balls[j].speedY *= 0.75;
                    }
                    break;
                case 'thru': 
                    for (let j = 0; j < balls.length; j++) {
                        balls[j].isPiercing = true;
                    }
                    break;
                case 'split':
                    let currentBalls = balls.length;
                    for (let j = 0; j < currentBalls; j++) {
                        balls.push({
                            x: balls[j].x,
                            y: balls[j].y,
                            radius: balls[j].radius,
                            speedX: -balls[j].speedX,
                            speedY: balls[j].speedY - (1 * baseSpeedMultiplier),
                            color: balls[j].color,
                            isPiercing: balls[j].isPiercing
                        });
                    }
                    break;
                case 'laser':
                    paddle.isLaser = true;
                    break;
                case 'grab':
                    paddle.isMagnetic = true;
                    break;
                case 'fireball':
                    paddle.isFireball = true;
                    break;
                case 'shrinkball':
                    for (let j = 0; j < balls.length; j++) {
                        balls[j].radius = 4;
                        balls[j].isShrunk = true;
                    }
                    for (let j = 0; j < grabbedBalls.length; j++) {
                        grabbedBalls[j].radius = 4;
                        grabbedBalls[j].isShrunk = true;
                    }
                    break;
                case 'eightball':
                    let count = balls.length;
                    const spreads = [[-6, -3], [-4, -5], [-2, -6], [0, -7], [2, -6], [4, -5], [6, -3]];
                    for (let j = 0; j < count; j++) {
                        let ob = balls[j];
                        for (let s = 0; s < spreads.length; s++) {
                            balls.push({
                                x: ob.x,
                                y: ob.y,
                                radius: ob.radius,
                                speedX: spreads[s][0] * baseSpeedMultiplier,
                                speedY: spreads[s][1] * baseSpeedMultiplier,
                                color: ob.color,
                                isPiercing: ob.isPiercing,
                                isShrunk: ob.isShrunk
                            });
                        }
                    }
                    break;
                case 'gravity':
                    paddle.isGravityPull = true;
                    break;
                case 'double':
                    scoreMultiplier = 2;
                    break;
                case 'zap':
                    let zapped = false;
                    for (let r = brickConfig.rowCount - 1; r >= 0; r--) {
                        for (let c = 0; c < brickConfig.columnCount; c++) {
                            if (bricks[r][c] === 1 || bricks[r][c] === 2) {
                                zapped = true;
                                break;
                            }
                        }
                        if (zapped) {
                            for (let c = 0; c < brickConfig.columnCount; c++) {
                                let val = bricks[r][c];
                                if (val === 1 || val === 2) {
                                    bricks[r][c] = 0;
                                    score += ((val === 1) ? 10 : 50) * scoreMultiplier;
                                    if (val === 2) {
                                        const bX = (c * (brickConfig.width + brickConfig.padding)) + brickConfig.offsetLeft;
                                        const bY = (r * (brickConfig.height + brickConfig.padding)) + brickConfig.offsetTop;
                                        spawnPowerUp(bX, bY);
                                    }
                                }
                            }
                            playSound('explosion');
                            break;
                        }
                    }
                    break;
                case 'supershrink':
                    paddle.width = 25;
                    break;
                case 'timeslow':
                    timeSlowTimer = 300;
                    break;
                case 'timestop':
                    timeStopTimer = 180;
                    break;
                case 'lightning':
                    let activeBricks = [];
                    for (let r = 0; r < brickConfig.rowCount; r++) {
                        for (let c = 0; c < brickConfig.columnCount; c++) {
                            if (bricks[r][c] === 1 || bricks[r][c] === 2) {
                                activeBricks.push({r: r, c: c, val: bricks[r][c]});
                            }
                        }
                    }
                    activeBricks.sort(() => Math.random() - 0.5);
                    let strikeCount = Math.min(5, activeBricks.length);
                    for (let i = 0; i < strikeCount; i++) {
                        let brick = activeBricks[i];
                        bricks[brick.r][brick.c] = 0;
                        score += ((brick.val === 1) ? 10 : 50) * scoreMultiplier;
                        if (brick.val === 2) {
                            const bX = (brick.c * (brickConfig.width + brickConfig.padding)) + brickConfig.offsetLeft;
                            const bY = (brick.r * (brickConfig.height + brickConfig.padding)) + brickConfig.offsetTop;
                            spawnPowerUp(bX, bY);
                        }
                    }
                    if (strikeCount > 0) playSound('laser');
                    break;
                case 'falling':
                    for (let r = brickConfig.rowCount - 1; r > 0; r--) {
                        for (let c = 0; c < brickConfig.columnCount; c++) {
                            bricks[r][c] = bricks[r-1][c];
                        }
                    }
                    for (let c = 0; c < brickConfig.columnCount; c++) {
                        bricks[0][c] = 0;
                    }
                    playSound('drop');
                    break;
                case 'kill':
                    lives--;
                    playSound('drop');
                    if (lives > 0) {
                        balls = [{ x: canvas.width/2, y: canvas.height-50, radius: 8, speedX: baseSpeedX, speedY: baseSpeedY, color: '#00ffff', isPiercing: false }];
                        paddle.x = (canvas.width - paddle.width) / 2;
                        scoreMultiplier = 1;
                        timeSlowTimer = 0;
                        timeStopTimer = 0;
                        paddle.isLaser = false;
                        paddle.isMagnetic = false;
                        paddle.isFireball = false;
                        paddle.isGravityPull = false;
                        grabbedBalls = [];
                    } else {
                        showPopup("GAME OVER", "You ran out of lives. Final Score: " + score, () => {
                            isGameRunning = false;
                            isPaused = false;
                            updateHighScore();
                            showScreen(mainMenu);
                            if (typeof startMenuMusic === 'function') startMenuMusic();
                        });
                        return false;
                    }
                    break;
                case 'warp':
                    showPopup("WARP ZONE", "Skipping to the next level!", () => {
                        currentLevel++;
                        if (currentLevel > totalLevels) {
                            showPopup("VICTORY", "Congratulations! You beat the game with a score of " + score, () => {
                                isGameRunning = false;
                                isPaused = false;
                                updateHighScore();
                                showScreen(mainMenu);
                                if (typeof startMenuMusic === 'function') startMenuMusic();
                            });
                        } else {
                            loadLevel(currentLevel);
                            isPaused = false;
                        }
                    });
                    return true;
            }
            
            powerUps.splice(i, 1);
        } else if (p.y - 8 > canvas.height) {
            // Remove if missed
            powerUps.splice(i, 1);
        }
    }

    // Win condition check (ignoring indestructible bricks)
    if (activeBricksCount === 0) {
        showPopup("LEVEL CLEARED", "Level " + currentLevel + " Complete!", () => {
            currentLevel++;
            if (currentLevel > totalLevels) {
                showPopup("VICTORY", "Congratulations! You beat the game with a score of " + score, () => {
                    isGameRunning = false;
                    isPaused = false;
                    updateHighScore();
                    showScreen(mainMenu);
                    if (typeof startMenuMusic === 'function') startMenuMusic();
                });
            } else {
                loadLevel(currentLevel);
                isPaused = false;
            }
        });
        return false; // Stop current frame immediately
    }
    
    return true; // Continue the loop
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();
    
    // Draw lasers
    ctx.fillStyle = "#ffff00";
    for (let i = 0; i < lasers.length; i++) {
        ctx.fillRect(lasers[i].x - 1.5, lasers[i].y, 3, 15);
    }
    
    drawPaddle();
    if (paddle.isLaser) {
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(paddle.x, paddle.y - 5, 6, 5);
        ctx.fillRect(paddle.x + paddle.width - 6, paddle.y - 5, 6, 5);
    }
    
    // Draw power-ups
    for (let i = 0; i < powerUps.length; i++) {
        let p = powerUps[i];
        drawCapsule(ctx, p.x - 20, p.y - 10, p.category, p.id);
    }
    
    // Draw the balls
    const drawBall = (b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2);
        if (paddle.isFireball) {
            ctx.fillStyle = "#ff6600";
        } else {
            ctx.fillStyle = b.isPiercing ? "#ffff00" : b.color;
        }
        ctx.fill();
        ctx.closePath();
    };

    for (let i = 0; i < balls.length; i++) {
        drawBall(balls[i]);
    }
    for (let i = 0; i < grabbedBalls.length; i++) {
        drawBall(grabbedBalls[i]);
    }

    // Draw Score and Lives
    ctx.font = "bold 18px Arial";
    ctx.fillStyle = "#0095DD";
    
    ctx.textAlign = 'left';
    ctx.fillText("Score: " + score, 20, 30);
    
    ctx.textAlign = 'center';
    ctx.fillText("High Score: " + highScore, canvas.width / 2, 30);
    
    ctx.textAlign = 'right';
    ctx.fillText("Lives: " + lives, canvas.width - 20, 30);
    ctx.textAlign = 'left';
}

function gameLoop() {
    try {
        if (!isPaused) {
            const continueGame = update();
            if (!continueGame) return; // Exit loop if level complete or game over
            draw();
        }
        gameLoopId = requestAnimationFrame(gameLoop);
    } catch (e) {
        alert('GAMELOOP ERROR: ' + e.message + ' at ' + e.stack);
    }
}

function loadLevel(levelNumber) {
    currentLevel = levelNumber;
    
    balls = [{ x: canvas.width/2, y: canvas.height-50, radius: 8, speedX: baseSpeedX, speedY: baseSpeedY, color: '#00ffff', isPiercing: false }];
    lasers = [];
    grabbedBalls = [];
    scoreMultiplier = 1;
    timeSlowTimer = 0;
    timeStopTimer = 0;
    paddle.isLaser = false;
    paddle.isMagnetic = false;
    paddle.isFireball = false;
    paddle.isGravityPull = false;
    
    paddle.width = 100;
    paddle.x = (canvas.width - paddle.width) / 2;
    paddle.y = canvas.height - 30;
    
    powerUps = [];
    initBricks(levelNumber);
}


// Game Start Logic
function startGame(levelNumber) {
    if (typeof stopMenuMusic === 'function') stopMenuMusic();
    try {
        console.log("Starting Level: " + levelNumber);
        showScreen(gameScreen);
        
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        // Reset game state
        score = 0;
        lives = (currentGameMode === 'survival') ? 1 : 3;
        isGameRunning = true;
        
        loadLevel(levelNumber);
        
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        gameLoop();
    } catch(e) {
        alert('STARTGAME ERROR: ' + e.message + '\\n' + e.stack);
    }
}

randomLevelBtn.addEventListener('click', () => {
    const randomLevel = Math.floor(Math.random() * totalLevels) + 1;
    startGame(randomLevel);
});

// Initialize UI
updateHighScore();