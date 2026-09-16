const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 50;
const COLS = 15; 
const ROWS = 11;

const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const bankSoal = [
    { soal: "1. Yang termasuk sifat koligatif larutan adalah…", benar: "Tekanan osmotik", salah: ["Warna larutan", "Massa jenis", "Viskositas"] },
    { soal: "2. Kenaikan titik didih larutan dirumuskan sebagai…", benar: "ΔTb=Kb×m", salah: ["ΔTb=Kf×m", "ΔTb=P°×X", "ΔTb=M×R×T"] },
    { soal: "3. Penurunan titik beku larutan dirumuskan sebagai…", benar: "ΔTf=Kf×m", salah: ["ΔTf=Kb×m", "ΔTf=P°×X", "ΔTf=M×R×T"] },
    { soal: "4. Rumus tekanan osmotik adalah…", benar: "π=MRT", salah: ["π=Kf×m", "π=Kb×m", "π=P°×X"] },
    { soal: "5. Garam ditambahkan pada campuran es dalam pembuatan es krim karena…", benar: "Turunkan titik beku", salah: ["Naikkan titik beku", "Naikkan tekanan uap", "Hilangkan air"] },
    { soal: "6. Proses perpindahan molekul pelarut dari larutan encer ke pekat (semipermeabel)...", benar: "Osmosis", salah: ["Difusi", "Efusi", "Kondensasi"] },
    { soal: "7. Apakah penentu utama dari sifat koligatif suatu larutan?", benar: "Jumlah partikel", salah: ["Ukuran molekul", "Massa jenis", "Wujud zat"] },
    { soal: "8. Manakah di bawah ini yang termasuk sifat koligatif larutan?", benar: "Tekanan osmotik", salah: ["Viskositas cairan", "Kelarutan zat", "Tekanan gas ideal"] },
    { soal: "9. Urutan larutan berikut dari yang memiliki titik didih paling tinggi adalah...", benar: "Glukosa=Urea<NaCl", salah: ["Glukosa<Urea<NaCl", "NaCl<Glukosa<Urea", "Urea<NaCl<Glukosa"] },
    { soal: "10. Berikut ini faktor yang tidak mempengaruhi sifat koligatif larutan adalah...", benar: "Jenis zat", salah: ["Jumlah zat", "Sifat elektrolit", "Konsentrasi"] }
];

let indexSoal = 0, skor = 0, nyawa = 9, isGameOver = false, isGameStarted = false, isPaused = false;

const player = { 
    x: 7 * TILE_SIZE + TILE_SIZE/2, 
    y: 5 * TILE_SIZE + TILE_SIZE/2, 
    size: 14, speed: 2.2, vx: 0, vy: 0, invincible: 0 
};

const enemies = [
    { x: 1 * TILE_SIZE + TILE_SIZE/2, y: 1 * TILE_SIZE + TILE_SIZE/2, size: 14, speed: 1, vx: 1, vy: 0, type: 'green' },
    { x: 13 * TILE_SIZE + TILE_SIZE/2, y: 1 * TILE_SIZE + TILE_SIZE/2, size: 14, speed: 1, vx: -1, vy: 0, type: 'red' },
    { x: 1 * TILE_SIZE + TILE_SIZE/2, y: 9 * TILE_SIZE + TILE_SIZE/2, size: 14, speed: 1, vx: 1, vy: 0, type: 'red' },
    { x: 13 * TILE_SIZE + TILE_SIZE/2, y: 9 * TILE_SIZE + TILE_SIZE/2, size: 14, speed: 1, vx: -1, vy: 0, type: 'green' }
];

let answers = [];

// ==========================================
// SISTEM AUDIO (WEB AUDIO API)
// ==========================================
let audioCtx = null;
let bgmTimer = null;
let stepTimer = 0;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSFX(type) {
    if (!audioCtx) return;
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    let now = audioCtx.currentTime;

    if (type === 'click') {
        osc.frequency.setValueAtTime(450, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now); osc.stop(now + 0.08);
    } 
    else if (type === 'step') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
    }
    else if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(450, now + 0.1);
        osc.frequency.setValueAtTime(600, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } 
    else if (type === 'wrong' || type === 'hurt') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
    }
}

function startBGM() {
    if (bgmTimer) return;
    initAudio();
    const melody = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 293.66, 349.23];
    let index = 0;

    bgmTimer = setInterval(() => {
        if (!isGameStarted || isPaused || isGameOver) return;
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(melody[index], audioCtx.currentTime);
        gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
        index = (index + 1) % melody.length;
    }, 280);
}

function stopBGM() {
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
}
// ==========================================

document.getElementById('btn-start').addEventListener('click', () => {
    initAudio();
    playSFX('click');
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');
});

document.querySelectorAll('.btn-level').forEach(btn => {
    if(btn.id.includes('btn-resume') || btn.id.includes('btn-restart') || btn.id.includes('btn-back')) return;
    btn.addEventListener('click', (e) => {
        playSFX('click');
        let speedMultiplier = parseFloat(e.target.getAttribute('data-speed'));
        
        enemies.forEach(enemy => {
            enemy.speed = speedMultiplier;
            if(enemy.vx !== 0) enemy.vx = enemy.vx > 0 ? enemy.speed : -enemy.speed;
            if(enemy.vy !== 0) enemy.vy = enemy.vy > 0 ? enemy.speed : -enemy.speed;
        });

        document.getElementById('level-screen').classList.add('hidden');
        if (!isGameStarted) {
            isGameStarted = true;
            loadSoal();
            startBGM();
            requestAnimationFrame(update);
        }
        isPaused = false;
    });
});

const settingsModal = document.getElementById('settings-modal');
document.getElementById('btn-settings').addEventListener('click', () => {
    if (!isGameStarted || isGameOver) return;
    playSFX('click');
    isPaused = true;
    settingsModal.classList.remove('hidden');
});

document.getElementById('btn-resume').addEventListener('click', () => {
    playSFX('click');
    isPaused = false;
    settingsModal.classList.add('hidden');
    requestAnimationFrame(update);
});

document.getElementById('btn-restart-game').addEventListener('click', () => {
    playSFX('click');
    settingsModal.classList.add('hidden');
    indexSoal = 0; skor = 0; nyawa = 9;
    document.getElementById('skor').innerText = skor;
    document.getElementById('nyawa').innerText = nyawa;
    isPaused = false;
    loadSoal();
    requestAnimationFrame(update);
});

document.getElementById('btn-back-menu').addEventListener('click', () => {
    playSFX('click');
    settingsModal.classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');
    isGameStarted = false;
    stopBGM();
});

let snowflakes = [];
for(let i=0; i<80; i++) {
    snowflakes.push({ x: Math.random() * 750, y: Math.random() * 550, r: Math.random() * 3 + 1, d: Math.random() * 2 });
}

function drawSnow() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    for(let i=0; i<snowflakes.length; i++) {
        let p = snowflakes[i];
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
    }
    ctx.fill();
    for(let i=0; i<snowflakes.length; i++) {
        let p = snowflakes[i];
        p.y += Math.cos(p.d) + 1 + p.r/2;
        p.x += Math.sin(p.d) * 1;
        if(p.y > canvas.height) { p.y = 0; p.x = Math.random() * canvas.width; }
    }
}

function loadSoal() {
    if (indexSoal >= bankSoal.length) { mengakhiriGame(); return; }
    document.getElementById('teks-soal').innerText = bankSoal[indexSoal].soal;
    player.x = 7 * TILE_SIZE + TILE_SIZE/2; 
    player.y = 5 * TILE_SIZE + TILE_SIZE/2; 
    player.vx = 0; player.vy = 0;
    
    let opsi = [
        { teks: bankSoal[indexSoal].benar, isBenar: true },
        { teks: bankSoal[indexSoal].salah[0], isBenar: false },
        { teks: bankSoal[indexSoal].salah[1], isBenar: false },
        { teks: bankSoal[indexSoal].salah[2], isBenar: false }
    ];
    opsi.sort(() => Math.random() - 0.5);

    const positions = [ { x: 1, y: 1 }, { x: 13, y: 1 }, { x: 1, y: 9 }, { x: 13, y: 9 } ];
    answers = opsi.map((ans, i) => ({
        x: positions[i].x * TILE_SIZE, y: positions[i].y * TILE_SIZE,
        centerX: positions[i].x * TILE_SIZE + TILE_SIZE/2, centerY: positions[i].y * TILE_SIZE + TILE_SIZE/2,
        teks: ans.teks, isBenar: ans.isBenar, isVisible: true 
    }));
}

function isWall(x, y, size) {
    let padding = size * 0.7; 
    let left = Math.floor((x - padding) / TILE_SIZE);
    let right = Math.floor((x + padding) / TILE_SIZE);
    let top = Math.floor((y - padding) / TILE_SIZE);
    let bottom = Math.floor((y + padding) / TILE_SIZE);

    if (left < 0 || right >= COLS || top < 0 || bottom >= ROWS) return true;
    return map[top][left] === 1 || map[top][right] === 1 || map[bottom][left] === 1 || map[bottom][right] === 1;
}

const gerakkanKarakter = (e, vx, vy) => { 
    if (e) e.preventDefault(); 
    player.vx = vx; 
    player.vy = vy; 
};

window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); }
    if (e.key === 'ArrowUp') gerakkanKarakter(null, 0, -player.speed);
    if (e.key === 'ArrowDown') gerakkanKarakter(null, 0, player.speed);
    if (e.key === 'ArrowLeft') gerakkanKarakter(null, -player.speed, 0);
    if (e.key === 'ArrowRight') gerakkanKarakter(null, player.speed, 0);
}, { passive: false });

const bindDpad = (id, vx, vy) => {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', (e) => gerakkanKarakter(e, vx, vy), { passive: false });
    btn.addEventListener('pointerdown', (e) => gerakkanKarakter(e, vx, vy));
};
bindDpad('btn-up', 0, -player.speed); 
bindDpad('btn-down', 0, player.speed);
bindDpad('btn-left', -player.speed, 0); 
bindDpad('btn-right', player.speed, 0);

function drawMap() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (map[row][col] === 1) {
                ctx.fillStyle = 'rgba(173, 216, 230, 0.3)';
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.strokeRect(col * TILE_SIZE + 2, row * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            }
        }
    }
}

function drawAstronaut(x, y, vx) {
    if (player.invincible > 0 && Math.floor(Date.now() / 100) % 2 === 0) return;
    ctx.save(); ctx.translate(x, y);
    if (vx < 0) ctx.scale(-1, 1); 
    ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-14, -8, 6, 16);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, player.size, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.roundRect(-2, -8, 12, 10, 4); ctx.fill();
    ctx.restore();
}

function drawAlien(x, y, type) {
    ctx.save(); ctx.translate(x, y);
    let hover = Math.sin(Date.now() / 150) * 3; 
    ctx.fillStyle = type === 'red' ? '#e74c3c' : '#2ecc71';
    ctx.beginPath();
    ctx.moveTo(-10, -10 + hover); ctx.lineTo(10, -10 + hover);
    ctx.lineTo(12, 10 + hover); ctx.lineTo(-12, 10 + hover); ctx.fill();
    ctx.fillStyle = '#2c3e50'; ctx.fillRect(-8, -4 + hover, 16, 6);
    ctx.fillStyle = type === 'red' ? '#f1c40f' : '#ffffff';
    ctx.beginPath(); ctx.arc(0, -1 + hover, 2, 0, Math.PI*2); ctx.fill(); 
    ctx.restore();
}

function update() {
    if (isGameOver || !isGameStarted || isPaused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    drawSnow(); 
    drawMap();

    if (player.invincible > 0) player.invincible--;

    let nextX = player.x + player.vx;
    let nextY = player.y + player.vy;
    
    let isMoving = (player.vx !== 0 || player.vy !== 0);
    if (isMoving) {
        stepTimer++;
        if (stepTimer % 14 === 0) { playSFX('step'); }
    }

    if (!isWall(nextX, player.y, player.size)) {
        player.x = nextX;
    } else {
        player.vx = 0;
    }

    if (!isWall(player.x, nextY, player.size)) {
        player.y = nextY;
    } else {
        player.vy = 0;
    }

    drawAstronaut(player.x, player.y, player.vx);

    enemies.forEach(enemy => {
        let isHittingWall = isWall(enemy.x + enemy.vx, enemy.y + enemy.vy, enemy.size);
        
        if (isHittingWall || Math.random() < 0.01) {
            let dirs = [{x: enemy.speed, y: 0}, {x: -enemy.speed, y: 0}, {x: 0, y: enemy.speed}, {x: 0, y: -enemy.speed}];
            let validDirs = dirs.filter(d => !isWall(enemy.x + d.x, enemy.y + d.y, enemy.size));

            if (validDirs.length > 0) {
                if (enemy.type === 'red' && player.invincible <= 0 && Math.hypot(player.x - enemy.x, player.y - enemy.y) < TILE_SIZE * 5) {
                    validDirs.sort((a, b) => {
                        let distA = Math.hypot((enemy.x + a.x) - player.x, (enemy.y + a.y) - player.y);
                        let distB = Math.hypot((enemy.x + b.x) - player.x, (enemy.y + b.y) - player.y);
                        return distA - distB;
                    });
                    enemy.vx = validDirs[0].x; enemy.vy = validDirs[0].y;
                } else {
                    let randomDir = validDirs[Math.floor(Math.random() * validDirs.length)];
                    enemy.vx = randomDir.x; enemy.vy = randomDir.y;
                }
            }
        }

        enemy.x += enemy.vx; enemy.y += enemy.vy;
        drawAlien(enemy.x, enemy.y, enemy.type);

        if (player.invincible <= 0 && Math.abs(player.x - enemy.x) < player.size * 1.5 && Math.abs(player.y - enemy.y) < player.size * 1.5) {
            playSFX('hurt');
            nyawa--; document.getElementById('nyawa').innerText = nyawa;
            player.x = 7 * TILE_SIZE + TILE_SIZE/2; player.y = 5 * TILE_SIZE + TILE_SIZE/2; 
            player.vx = 0; player.vy = 0;
            player.invincible = 120; 

            canvas.style.boxShadow = "0 0 50px red";
            setTimeout(() => canvas.style.boxShadow = "none", 300);
            if (nyawa <= 0) mengakhiriGame();
        }
    });

    answers.forEach(ans => {
        if (!ans.isVisible) return; 

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; 
        ctx.fillRect(ans.x, ans.y, TILE_SIZE, TILE_SIZE);
        
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 9px Poppins';
        ctx.textAlign = 'center';
        
        let words = ans.teks.split(' ');
        let line1 = words.slice(0, 2).join(' '); 
        ctx.fillText(line1, ans.centerX, ans.centerY + 3);

        if (Math.abs(player.x - ans.centerX) < TILE_SIZE * 0.8 && Math.abs(player.y - ans.centerY) < TILE_SIZE * 0.8) {
            if (ans.isBenar) {
                playSFX('correct');
                skor += 100; document.getElementById('skor').innerText = skor;
                indexSoal++; loadSoal();
            } else {
                if (player.invincible <= 0) {
                    playSFX('wrong');
                    nyawa--; document.getElementById('nyawa').innerText = nyawa;
                    ans.isVisible = false; 
                    player.invincible = 60; 
                    
                    canvas.style.boxShadow = "0 0 50px red";
                    setTimeout(() => canvas.style.boxShadow = "none", 300);
                    player.vx = -player.vx; player.vy = -player.vy; 
                    if (nyawa <= 0) mengakhiriGame();
                }
            }
        }
    });

    requestAnimationFrame(update);
}

function mengakhiriGame() {
    isGameOver = true;
    stopBGM();
    playSFX('wrong');
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('skor-akhir').innerText = skor;
}