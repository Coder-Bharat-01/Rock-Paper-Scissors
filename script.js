const USE_IMAGES = true;
const IMG = {
  Cpurock: 'images/Rockright.png',
  Cpupaper: 'images/Paperright.png',
  Cpuscissors: 'images/Scissorright.png',
  yourock: 'images/Rockleft.png',
  youpaper: 'images/Paperleft.png',
  youscissors: 'images/Scissorleft.png',
  rock: 'images/Rock.png',
  fist: 'images/fist.png'
};

const EMOJI = { rock: '✊', paper: '✋', scissors: '✌️', fist: '✊' };

const youBoard = document.getElementById('youBoard');
const cpuBoard = document.getElementById('cpuBoard');
const res = document.getElementById('roundResult');
const youScoreEl = document.getElementById('youScore');
const cpuScoreEl = document.getElementById('cpuScore');
const resetBtn = document.getElementById('resetBtn');
const autoBtn = document.getElementById('autoBtn');

let youScore = 0, cpuScore = 0, busy = false, autoTimer = null;
const picks = ['rock', 'paper', 'scissors'];

function getNode(kind, side){
  if (USE_IMAGES){
    const img = document.createElement('img');
    img.className = 'hand';
    img.alt = kind;
    img.src = IMG[kind] || IMG.fist;
    if (side === 'cpu') img.style.transform = 'scaleX(-1)'; 
    return img;
  } else {
    const span = document.createElement('div');
    span.className = 'emoji';
    span.textContent = EMOJI[kind] || EMOJI.fist;
    return span;
  }
}

function setSlot(boardEl, kind, side){
  boardEl.innerHTML = '';
  boardEl.appendChild(getNode(kind, side));
}

// Background music
const bgAudio = new Audio('RockPaperaudio.mp3');
bgAudio.loop = true;
bgAudio.volume = 0.6;

window.addEventListener('load', () => {
  bgAudio.currentTime = 0; 
  bgAudio.play().catch(() => {
    document.body.addEventListener('click', startAudioOnce, { once: true });
  });
});

function startAudioOnce(){
  bgAudio.currentTime = 0;
  bgAudio.play();
}

// Reset game
resetBtn.addEventListener('click', () => {
  youScore = cpuScore = 0;
  youScoreEl.textContent = '0';
  cpuScoreEl.textContent = '0';
  res.textContent = '';
  shake();
  bgAudio.currentTime = 0;
  bgAudio.play();
});

function shake(){
  youBoard.classList.add('shaking', 'glow');
  cpuBoard.classList.add('shaking', 'glow');
  setSlot(youBoard, 'rock', 'you');
  setSlot(cpuBoard, 'fist', 'cpu');
  res.textContent = '';
  res.className = 'result';
}

function reveal(yPick, cPick){
  setSlot(youBoard, "you" + yPick, 'you');
  setSlot(cpuBoard, "Cpu" + cPick, 'cpu');
  youBoard.firstElementChild.classList.add('reveal-left');
  cpuBoard.firstElementChild.classList.add('reveal-right');
}

function outcome(y, c){
  if (y === c) return 'draw';
  if ((y === 'rock' && c === 'scissors') || 
      (y === 'paper' && c === 'rock') || 
      (y === 'scissors' && c === 'paper')) 
    return 'win';
  return 'lose';
}

function showResult(kind){
  res.className = 'result ' + kind;
  res.textContent = kind === 'win' ? 'You Win!' : 
                    kind === 'lose' ? 'You Lose' : 'Draw';
}

async function playRound(yPick){
  if (busy) return; 
  busy = true;
  const cPick = picks[Math.floor(Math.random()*3)];

  shake();
  await wait(650);
  youBoard.classList.remove('shaking');
  cpuBoard.classList.remove('shaking');

  reveal(yPick, cPick);
  await wait(360);

  const out = outcome(yPick, cPick);
  if (out === 'win') youScore++; 
  else if (out === 'lose') cpuScore++;
  youScoreEl.textContent = youScore;
  cpuScoreEl.textContent = cpuScore;
  showResult(out);

  await wait(200);
  youBoard.classList.remove('glow');
  cpuBoard.classList.remove('glow');
  busy = false;
}

function wait(ms){ return new Promise(r => setTimeout(r, ms)); }

// Button events
document.querySelectorAll('.btn[data-pick]').forEach(b => {
  b.addEventListener('click', () => playRound(b.dataset.pick));
});

autoBtn.addEventListener('click', () => {
  if (autoTimer){
    clearInterval(autoTimer); 
    autoTimer = null; 
    autoBtn.textContent = 'Auto Play';
  } else {
    autoBtn.textContent = 'Stop Auto';
    autoTimer = setInterval(() => {
      if (!busy){
        const yPick = picks[Math.floor(Math.random()*3)];
        playRound(yPick);
      }
    }, 1300);
  }
});

shake();
