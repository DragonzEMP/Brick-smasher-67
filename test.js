const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html><html><body>
<div id="start-screen"></div>
<div id="main-menu"></div>
<div id="level-selector"></div>
<div id="game-screen"></div>
<canvas id="gameCanvas"></canvas>
<div id="high-score-display"></div>
<div id="menu-high-score"></div>
<button id="start-btn"></button>
<button id="select-level-btn"></button>
<button id="random-level-btn"></button>
<button id="random-stage-btn"></button>
<button id="exit-btn"></button>
<div id="level-grid"></div>
<button id="back-to-menu-btn"></button>
<button id="mobile-pause-btn"></button>
<div id="pause-overlay"></div>
<button id="resume-btn"></button>
<input id="volume-slider" />
<button id="exit-pause-btn"></button>
</body></html>`, { runScripts: 'dangerously' });
const fs = require('fs');
const levels = fs.readFileSync('g:/Work/DexBALL/levels.js', 'utf8');
const icons = fs.readFileSync('g:/Work/DexBALL/icons.js', 'utf8');
const game = fs.readFileSync('g:/Work/DexBALL/game.js', 'utf8');

// Mock audio
dom.window.AudioContext = class {
    constructor() {
        this.state = 'suspended';
    }
    resume() {}
};
dom.window.webkitAudioContext = dom.window.AudioContext;
dom.window.eval('window.requestAnimationFrame = function(cb) { cb(); }; window.cancelAnimationFrame = function() {};');

try {
    dom.window.eval(levels + "\\n" + icons + "\\n" + game);
    console.log('Script loaded successfully');
    dom.window.startGame(1);
    console.log('startGame executed successfully');
    dom.window.update();
    console.log('update executed successfully');
    dom.window.draw();
    console.log('draw executed successfully');
} catch (e) {
    console.error('ERROR:', e.message);
    if (e.stack) console.error(e.stack);
}
