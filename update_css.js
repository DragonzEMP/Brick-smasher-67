const fs = require('fs');

let css = fs.readFileSync('g:/Work/DexBALL/style.css', 'utf8');

const newStyles = `
/* Start Screen Background and Button Customization */
#start-screen {
    background-image: url("Brick smasher 67.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    width: 100vw;
    height: 100vh;
    position: relative;
    /* Reset flex so we can use absolute positioning freely */
    display: block; 
}
#start-screen.active {
    display: block;
}

#start-screen #high-score-display {
    position: absolute;
    top: 20px;
    right: 30px;
    font-size: 28px;
    color: #ffffff;
    text-shadow: 0 0 10px #ff0055, 0 0 20px #ff0055;
    margin: 0;
}

#start-btn {
    position: absolute;
    bottom: 12%; /* Positioned under the word "smasher" */
    left: 50%;
    transform: translateX(-50%);
    background: transparent;
    background-color: transparent;
    color: #ffffff;
    border: 3px solid rgba(255, 255, 255, 0.7);
    font-size: 32px;
    padding: 15px 50px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 5px;
    text-shadow: 0 0 10px rgba(0, 255, 255, 1), 0 0 20px rgba(0, 255, 255, 1);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.2) inset, 0 0 20px rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    width: auto;
    margin: 0;
}

#start-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 25px rgba(255, 255, 255, 0.5) inset, 0 0 30px rgba(255, 255, 255, 0.5);
    transform: translateX(-50%) scale(1.1);
}

#start-btn:active {
    transform: translateX(-50%) scale(0.95);
}
`;

// Remove the old #logo-placeholder from CSS since it's obsolete
css = css.replace(/#logo-placeholder\s*\{[^}]+\}/g, '');

css += newStyles;

fs.writeFileSync('g:/Work/DexBALL/style.css', css);
console.log('Appended styles!');
