function drawCapsule(ctx, x, y, type, id) {
    ctx.beginPath();
    ctx.roundRect(x, y, 40, 20, 10);
    
    let grad = ctx.createLinearGradient(x, y, x, y + 20);
    if (type === 'positive') {
        grad.addColorStop(0, '#004400');
        grad.addColorStop(0.5, '#00ff00');
        grad.addColorStop(1, '#004400');
    } else if (type === 'negative') {
        grad.addColorStop(0, '#440000');
        grad.addColorStop(0.5, '#ff0000');
        grad.addColorStop(1, '#440000');
    } else if (type === 'special') {
        grad.addColorStop(0, '#444400');
        grad.addColorStop(0.5, '#ffff00');
        grad.addColorStop(1, '#444400');
    }
    ctx.fillStyle = grad;
    ctx.fill();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    drawIcon(ctx, id, x + 20, y + 10);
}

function drawIcon(ctx, id, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#fff';

    // shadow/glow for consistency
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 5;

    switch(id) {
        case 'life':
            ctx.beginPath();
            ctx.moveTo(0, 2);
            ctx.bezierCurveTo(-5, -4, -10, 0, 0, 6);
            ctx.bezierCurveTo(10, 0, 5, -4, 0, 2);
            ctx.fill();
            // Subtle '+'
            ctx.fillStyle = '#00ff00';
            ctx.shadowBlur = 0;
            ctx.fillRect(-2.5, 0, 5, 1);
            ctx.fillRect(-0.5, -2, 1, 5);
            break;
        case 'expand':
            ctx.fillRect(-6, -1.5, 12, 3);
            ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-5, -3); ctx.lineTo(-5, 3); ctx.fill();
            ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(5, -3); ctx.lineTo(5, 3); ctx.fill();
            break;
        case 'laser':
            ctx.fillRect(-6, 2, 12, 3);
            ctx.fillRect(-5, -5, 2, 7);
            ctx.fillRect(3, -5, 2, 7);
            ctx.beginPath(); ctx.moveTo(-4, -6); ctx.lineTo(-4, -9); ctx.moveTo(4, -6); ctx.lineTo(4, -9); ctx.stroke();
            break;
        case 'grab':
            ctx.fillRect(-6, 2, 12, 3);
            ctx.beginPath(); ctx.arc(0, -2, 3.5, 0, Math.PI*2); ctx.fill();
            // magnetic lines
            ctx.beginPath(); ctx.arc(0, -2, 6, Math.PI, Math.PI*2); ctx.stroke();
            break;
        case 'slow':
            ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -3); ctx.moveTo(0, 0); ctx.lineTo(2, 2); ctx.stroke();
            // Slow motion trails
            ctx.beginPath(); ctx.arc(-3, 0, 5, Math.PI*0.7, Math.PI*1.3); ctx.stroke();
            break;
        case 'megaball':
            ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI*2); ctx.fill();
            ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 8;
            ctx.stroke();
            break;
        case 'split':
            ctx.beginPath(); ctx.arc(0, -3, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(-4, 3, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(4, 3, 2, 0, Math.PI*2); ctx.fill();
            // arrows
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(-3, 1); ctx.moveTo(0, -1); ctx.lineTo(3, 1); ctx.stroke();
            break;
        case 'eightball':
            ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
            for(let i=0; i<8; i++) {
                let a = i * Math.PI / 4;
                ctx.beginPath(); ctx.arc(Math.cos(a)*6.5, Math.sin(a)*6.5, 1.2, 0, Math.PI*2); ctx.fill();
            }
            break;
        case 'thru':
            ctx.strokeRect(-7, -4, 14, 8); // brick
            ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI*2); ctx.fill(); // ball
            ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(0, -6); ctx.stroke();
            break;
        case 'fireball':
            ctx.beginPath(); ctx.arc(0, 2, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-4.5, 2); ctx.lineTo(-2.5, -6); ctx.lineTo(0, -1); ctx.lineTo(2.5, -7); ctx.lineTo(4.5, 2); ctx.fill();
            break;
        case 'explode':
            ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
            for(let i=0; i<6; i++) {
                let a = i * Math.PI / 3;
                ctx.beginPath(); ctx.moveTo(Math.cos(a)*3, Math.sin(a)*3); ctx.lineTo(Math.cos(a)*7, Math.sin(a)*7); ctx.stroke();
                ctx.fillRect(Math.cos(a+0.2)*8, Math.sin(a+0.2)*8, 1, 1);
            }
            break;
        case 'zap':
            ctx.beginPath(); ctx.moveTo(3, -7); ctx.lineTo(-3, 0); ctx.lineTo(1, 1); ctx.lineTo(-2, 8); ctx.stroke();
            ctx.fillRect(-6, 3, 4, 2); ctx.fillRect(2, 3, 4, 2); // bricks
            break;
        case 'double':
            // Two stars overlapping
            const drawStar = (sx, sy, r) => {
                ctx.beginPath();
                for(let i=0; i<5; i++) {
                    let a = i * Math.PI * 0.4 - Math.PI/2;
                    ctx.lineTo(sx + Math.cos(a)*r, sy + Math.sin(a)*r);
                    let a2 = a + Math.PI * 0.2;
                    ctx.lineTo(sx + Math.cos(a2)*(r/2), sy + Math.sin(a2)*(r/2));
                }
                ctx.closePath();
                ctx.stroke();
            };
            drawStar(-2, -2, 4);
            drawStar(3, 3, 4);
            break;
        case 'gravity':
            ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(0, 0, 7, 3, Math.PI/6, 0, Math.PI*2); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(0, 0, 7, 3, -Math.PI/6, 0, Math.PI*2); ctx.stroke();
            break;
        case 'kill':
            // Broken paddle
            ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-2, 0); ctx.lineTo(0, 2); ctx.lineTo(2, -2); ctx.lineTo(7, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-4, -5); ctx.lineTo(4, 5); ctx.moveTo(4, -5); ctx.lineTo(-4, 5); ctx.stroke(); // X mark
            break;
        case 'shrink':
            ctx.fillRect(-3, -1.5, 6, 3);
            ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-5, -3); ctx.lineTo(-5, 3); ctx.fill();
            ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(5, -3); ctx.lineTo(5, 3); ctx.fill();
            break;
        case 'fast':
            ctx.beginPath(); ctx.arc(3, 0, 3.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(0, -2); 
            ctx.moveTo(-8, 0); ctx.lineTo(0, 0); 
            ctx.moveTo(-5, 2); ctx.lineTo(-1, 2); ctx.stroke();
            break;
        case 'shrinkball':
            ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(-3, -3); ctx.moveTo(-5, -3); ctx.lineTo(-3, -3); ctx.lineTo(-3, -5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(5, 5); ctx.lineTo(3, 3); ctx.moveTo(5, 3); ctx.lineTo(3, 3); ctx.lineTo(3, 5); ctx.stroke();
            break;
        case 'supershrink':
            ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(-2, -2); ctx.moveTo(6, 6); ctx.lineTo(2, 2); 
            ctx.moveTo(-6, 6); ctx.lineTo(-2, 2); ctx.moveTo(6, -6); ctx.lineTo(2, -2); ctx.stroke();
            // Arrow heads
            ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(-2, -2); ctx.lineTo(-2, -4); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(4, 2); ctx.lineTo(2, 2); ctx.lineTo(2, 4); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-4, 2); ctx.lineTo(-2, 2); ctx.lineTo(-2, 4); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(4, -2); ctx.lineTo(2, -2); ctx.lineTo(2, -4); ctx.stroke();
            break;
        case 'falling':
            ctx.fillRect(-7, -5, 4, 3); ctx.fillRect(-1, -5, 4, 3); ctx.fillRect(4, -5, 4, 3);
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 6); ctx.lineTo(-3, 3); ctx.moveTo(0, 6); ctx.lineTo(3, 3); ctx.stroke();
            break;
        case 'warp':
            // Portal spiral
            ctx.beginPath();
            for (let i = 0; i < 20; i++) {
                let angle = 0.5 * i;
                let x = (1 + angle) * Math.cos(angle);
                let y = (1 + angle) * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.beginPath(); ctx.arc(5, 5, 2, 0, Math.PI*2); ctx.fill();
            break;
        case 'lightning':
            ctx.beginPath(); ctx.moveTo(3, -6); ctx.lineTo(-2, 1); ctx.lineTo(2, 1); ctx.lineTo(-3, 7); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(2, -6); ctx.lineTo(-3, 1); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(4, -6); ctx.lineTo(-1, 1); ctx.stroke();
            break;
        case 'timeslow':
            ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI*2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-2, -2); ctx.moveTo(0, 0); ctx.lineTo(2, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-7, -3); ctx.lineTo(-9, -3); ctx.moveTo(-7, 3); ctx.lineTo(-9, 3); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(7, -3); ctx.lineTo(9, -3); ctx.moveTo(7, 3); ctx.lineTo(9, 3); ctx.stroke();
            break;
        case 'timestop':
            ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI*2); ctx.stroke();
            ctx.fillRect(-2.5, -2.5, 1.5, 5); ctx.fillRect(1, -2.5, 1.5, 5);
            break;
        case 'timereverse':
            ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI*1.6); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(2, -7); ctx.lineTo(2, -3); ctx.lineTo(-2, -5); ctx.fill(); // Reverse arrow head
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-2, 2.5); ctx.stroke(); // backward hands
            break;
        default:
            ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.textBaseline='middle'; ctx.fillText(id.substring(0,2).toUpperCase(), 0, 0);
    }

    ctx.restore();
}
