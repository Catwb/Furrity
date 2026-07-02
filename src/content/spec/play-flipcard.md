---
title: 翻牌游戏
---



<style>
/* 开始界面 */
.start-screen {
text-align: center;
padding: 2rem;
max-width: 800px;
margin: 0 auto;
}

/* 游戏容器 */
.memory-game {
text-align: center;
padding: 2rem;
max-width: 800px;
margin: 0 auto;
display: none;
}

/* 游戏标题 */
.memory-game h2 {
font-size: 1.5rem;
color: #2c3e50;
margin-bottom: 1rem;
}

/* 游戏信息 */
.game-info {
margin-bottom: 1rem;
display: flex;
justify-content: center;
gap: 2rem;
}

/* 游戏板 */
.game-board {
display: grid;
grid-template-columns: repeat(4, 1fr);
grid-gap: 10px;
margin-bottom: 1rem;
min-height: 300px;
}

/* 卡牌样式 */
.card {
aspect-ratio: 1/1;
perspective: 1000px;
cursor: pointer;
}

.card-inner {
position: relative;
width: 100%;
height: 100%;
transition: transform 0.6s;
transform-style: preserve-3d;
}

.card.flipped .card-inner {
transform: rotateY(180deg);
}

.card-front, .card-back {
position: absolute;
width: 100%;
height: 100%;
backface-visibility: hidden;
display: flex;
justify-content: center;
align-items: center;
border-radius: 10px;
}

.card-front {
background-color: #3498db;
transform: rotateY(180deg);
font-size: 1.5rem;
}

.card-back {
background-color: #2c3e50;
color: white;
font-size: 1.5rem;
}

/* 按钮样式 */
.game-btn {
padding: 0.7rem 1.5rem;
font-size: 0.9rem;
border-radius: 50px;
cursor: pointer;
transition: all 0.3s ease;
font-weight: bold;
border: none;
background-color: #3498db;
color: white;
margin: 0.5rem;
}

.game-btn:hover {
background-color: #2980b9;
}

/* 游戏结束界面 */
.game-over {
text-align: center;
padding: 2rem;
max-width: 800px;
margin: 0 auto;
display: none;
}

.final-score {
font-size: 1.8rem;
color: #3498db;
margin: 1rem 0;
}

/* 设置面板 */
.settings-panel {
margin: 1rem auto;
max-width: 500px;
padding: 1rem;
}

.settings-row {
display: flex;
align-items: center;
margin-bottom: 1rem;
}

.settings-row label {
margin-right: 1rem;
min-width: 120px;
}

.settings-row input, .settings-row select {
padding: 0.5rem;
border-radius: 4px;
border: 1px solid #ddd;
}
</style>

<div class="start-screen">
<div class="settings-panel">
<div class="settings-row">
<label for="card-count">卡牌数量:</label>
<select id="card-count">
<option value="4">4张 (2对)</option>
<option value="6">6张 (3对)</option>
<option value="8" selected>8张 (4对)</option>
<option value="10">10张 (5对)</option>
<option value="12">12张 (6对)</option>
<option value="14">14张 (7对)</option>
<option value="16">16张 (8对)</option>
<option value="18">18张 (9对)</option>
<option value="20">20张 (10对)</option>
<option value="22">22张 (11对)</option>
<option value="24">24张 (12对)</option>
</select>
</div>

<div class="settings-row">
<label for="custom-emojis">自定义表情 (用逗号分隔):</label>
<input type="text" id="custom-emojis" placeholder="例如: 🐱,🐶,🐭">
</div>
</div>

<button class="game-btn" id="start-game">开始游戏</button>
</div>

<!-- 游戏界面 -->
<div class="memory-game" id="memory-game">
<div class="game-info">
<div>得分: <span id="score">0</span></div>
<div>回合: <span id="turns">0</span></div>
</div>

<div class="game-board" id="game-board"></div>

<button class="game-btn" id="back-to-start">返回</button>
</div>

<!-- 游戏结束界面 -->
<div class="game-over" id="game-over">
<h2>游戏结束</h2>

<div class="final-score">最终得分: <span id="final-score">0</span></div>

<div>
<button class="game-btn" id="play-again">再玩一次</button>
<button class="game-btn" id="back-to-menu">返回菜单</button>
</div>
</div>

<script>
// 游戏卡片表情
let emojis = ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐬', '🐯', '🦁', '🐮', '🐷', '🐵', '🐔'];

// 获取DOM元素
const startScreen = document.querySelector('.start-screen');
const memoryGame = document.getElementById('memory-game');
const gameOver = document.getElementById('game-over');
const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const turnsElement = document.getElementById('turns');
const finalScoreElement = document.getElementById('final-score');
const cardCountSelect = document.getElementById('card-count');
const customEmojisInput = document.getElementById('custom-emojis');
const startGameBtn = document.getElementById('start-game');
const backToStartBtn = document.getElementById('back-to-start');
const playAgainBtn = document.getElementById('play-again');
const backToMenuBtn = document.getElementById('back-to-menu');

// 游戏状态
let score = 0;
let turns = 0;
let flippedCards = [];
let matchedPairs = 0;
let gameCards = [];

// 初始化游戏
function initGame() {
// 获取设置
const cardCount = parseInt(cardCountSelect.value);
const customEmojis = customEmojisInput.value.split(',').map(e => e.trim()).filter(e => e);

// 使用自定义表情或默认表情
let gameEmojis = [...emojis];
if (customEmojis.length >= cardCount / 2) {
gameEmojis = customEmojis;
} else if (customEmojis.length > 0) {
gameEmojis = [...new Set([...gameEmojis, ...customEmojis])];
}

// 选择所需的表情对数
const pairsNeeded = cardCount / 2;
const selectedEmojis = [...gameEmojis].sort(() => 0.5 - Math.random()).slice(0, pairsNeeded);

// 创建卡牌
gameCards = [...selectedEmojis, ...selectedEmojis];
gameCards = [...gameCards].sort(() => 0.5 - Math.random());

// 清空游戏板
gameBoard.innerHTML = '';
gameBoard.style.display = 'grid';

// 设置网格列数
const columns = Math.min(6, Math.max(2, Math.ceil(Math.sqrt(cardCount))));
gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

// 创建卡片
gameCards.forEach((emoji, index) => {
const card = document.createElement('div');
card.className = 'card';
card.dataset.emoji = emoji;
card.dataset.index = index;

const cardInner = document.createElement('div');
cardInner.className = 'card-inner';

const cardFront = document.createElement('div');
cardFront.className = 'card-front';
cardFront.textContent = emoji;

const cardBack = document.createElement('div');
cardBack.className = 'card-back';
cardBack.textContent = '?';

cardInner.appendChild(cardFront);
cardInner.appendChild(cardBack);
card.appendChild(cardInner);

card.addEventListener('click', flipCard);
gameBoard.appendChild(card);
});

// 重置游戏状态
score = 0;
turns = 0;
flippedCards = [];
matchedPairs = 0;

// 更新分数和回合显示
scoreElement.textContent = score;
turnsElement.textContent = turns;

// 切换到游戏界面
startScreen.style.display = 'none';
gameOver.style.display = 'none';
memoryGame.style.display = 'block';
}

// 翻牌函数
function flipCard() {
const selectedCard = this;

// 如果卡片已翻转或已匹配，或者已经翻了两张牌，则不做任何操作
if (
selectedCard.classList.contains('flipped') || 
selectedCard.classList.contains('matched') ||
flippedCards.length >= 2
) {
return;
}

// 翻转卡片
selectedCard.classList.add('flipped');
flippedCards.push(selectedCard);

// 如果翻了两张牌，则进行匹配检查
if (flippedCards.length === 2) {
turns++;
turnsElement.textContent = turns;

const [firstCard, secondCard] = flippedCards;

// 检查两张牌是否匹配
if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
firstCard.classList.add('matched');
secondCard.classList.add('matched');
flippedCards = [];
score += 10;
scoreElement.textContent = score;
matchedPairs++;

// 检查游戏是否结束
if (matchedPairs === gameCards.length / 2) {
setTimeout(() => {
endGame();
}, 500);
}
} else {
// 如果不匹配，则在短暂延时后翻回
setTimeout(() => {
firstCard.classList.remove('flipped');
secondCard.classList.remove('flipped');
flippedCards = [];
}, 1000);
}
}
}

// 结束游戏
function endGame() {
finalScoreElement.textContent = score;
memoryGame.style.display = 'none';
gameOver.style.display = 'block';
}

// 事件监听
startGameBtn.addEventListener('click', initGame);
backToStartBtn.addEventListener('click', () => {
memoryGame.style.display = 'none';
startScreen.style.display = 'block';
});
playAgainBtn.addEventListener('click', initGame);
backToMenuBtn.addEventListener('click', () => {
gameOver.style.display = 'none';
startScreen.style.display = 'block';
});
</script>
