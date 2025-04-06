// 游戏初始化和事件绑定
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const startGameBtn = document.getElementById('start-game-btn');
    const difficultySelect = document.getElementById('difficulty-select');
    const gameBoard = document.querySelector('.game-board');
    const timerElement = document.getElementById('timer');
    const scoreElement = document.getElementById('score');
    const hintsElement = document.getElementById('hints');
    
    // 游戏实例
    let game = null;
    
    // 绑定开始游戏按钮事件
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            console.log('开始游戏按钮被点击');
            
            // 获取难度
            const difficulty = difficultySelect ? difficultySelect.value : 'normal';
            
            // 初始化游戏
            initGame(difficulty);
        });
    } else {
        console.error('找不到开始游戏按钮元素');
    }
    
    // 初始化游戏
    function initGame(difficulty) {
        console.log(`初始化游戏，难度: ${difficulty}`);
        
        // 清空游戏面板
        if (gameBoard) {
            gameBoard.innerHTML = '';
        }
        
        // 根据难度设置游戏参数
        let rows, cols, timeLimit, hintCount;
        
        switch(difficulty) {
            case 'easy':
                rows = 6;
                cols = 6;
                timeLimit = 180;
                hintCount = 5;
                break;
            case 'hard':
                rows = 8;
                cols = 10;
                timeLimit = 300;
                hintCount = 3;
                break;
            case 'normal':
            default:
                rows = 8;
                cols = 8;
                timeLimit = 240;
                hintCount = 4;
                break;
        }
        
        // 创建游戏实例
        game = new PokemonGame(rows, cols, timeLimit, hintCount);
        
        // 开始游戏
        game.start();
        
        // 更新UI
        updateUI();
    }
    
    // 更新UI
    function updateUI() {
        if (!game) return;
        
        // 更新计时器
        if (timerElement) {
            timerElement.textContent = game.timeLeft;
        }
        
        // 更新分数
        if (scoreElement) {
            scoreElement.textContent = game.score;
        }
        
        // 更新提示次数
        if (hintsElement) {
            hintsElement.textContent = game.hintCount;
        }
    }
    
    // 绑定其他按钮事件
    const hintBtn = document.getElementById('hint-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    
    if (hintBtn) {
        hintBtn.addEventListener('click', function() {
            if (game) {
                game.showHint();
            }
        });
    }
    
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', function() {
            if (game) {
                game.shuffleBoard();
            }
        });
    }
});

// 宠物小精灵连连看游戏类
class PokemonGame {
    constructor(rows, cols, timeLimit, hintCount) {
        this.rows = rows;
        this.cols = cols;
        this.timeLimit = timeLimit;
        this.timeLeft = timeLimit;
        this.hintCount = hintCount;
        this.shuffleCount = 3;
        this.score = 0;
        this.isPlaying = false;
        this.selectedCells = [];
        this.matchedPairs = 0;
        this.totalPairs = (rows * cols) / 2;
        this.timer = null;
        
        // DOM元素
        this.boardElement = document.querySelector('.game-board');
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.hintCountElement = document.getElementById('hints');
        this.shuffleCountElement = document.getElementById('shuffles');
        
        // 连接线容器
        this.connectionContainer = document.querySelector('.connection-container');
        if (!this.connectionContainer) {
            this.connectionContainer = document.createElement('div');
            this.connectionContainer.className = 'connection-container';
            this.boardElement.parentNode.appendChild(this.connectionContainer);
        }
        
        // 游戏逻辑处理器
        this.gameLogic = new GameLogic(this);
    }
    
    // 开始游戏
    start() {
        console.log('游戏开始');
        
        // 初始化游戏面板
        this.initBoard();
        
        // 开始计时
        this.startTimer();
        
        // 设置游戏状态
        this.isPlaying = true;
        
        // 更新UI
        this.updateUI();
    }
    
    // 初始化游戏面板
    initBoard() {
        if (!this.boardElement) {
            console.error('找不到游戏面板元素');
            return;
        }
        
        // 清空游戏面板
        this.boardElement.innerHTML = '';
        
        // 设置网格列数
        this.boardElement.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        
        // 创建宠物ID数组
        const totalCells = this.rows * this.cols;
        const pokemonIds = [];
        
        // 确保是偶数个格子
        if (totalCells % 2 !== 0) {
            console.error('格子总数必须是偶数');
            return;
        }
        
        // 生成配对的宠物ID
        for (let i = 0; i < totalCells / 2; i++) {
            // 使用模运算确保ID在1-16范围内
            const pokemonId = (i % 16) + 1;
            pokemonIds.push(pokemonId, pokemonId);
        }
        
        // 打乱宠物ID数组
        this.gameLogic.shuffleArray(pokemonIds);
        
        // 创建格子
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            // 计算行列位置
            const row = Math.floor(i / this.cols);
            const col = i % this.cols;
            
            // 设置数据属性
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.dataset.pokemonId = pokemonIds[i];
            
            // 创建宠物图标
            const elementIcon = document.createElement('div');
            elementIcon.className = `element-icon element-${pokemonIds[i]}`;
            cell.appendChild(elementIcon);
            
            // 添加点击事件
            cell.addEventListener('click', this.handleCellClick.bind(this));
            
            // 添加到游戏面板
            this.boardElement.appendChild(cell);
        }
    }
    
    // 处理格子点击事件
    handleCellClick(event) {
        if (!this.isPlaying) return;
        
        const cell = event.currentTarget;
        
        // 如果已经匹配或已经选中，则忽略
        if (cell.classList.contains('matched') || cell.classList.contains('selected')) {
            return;
        }
        
        // 添加选中状态
        cell.classList.add('selected');
        this.selectedCells.push(cell);
        
        // 播放选中音效
        this.playSound('select');
        
        // 如果选中了两个格子，检查是否匹配
        if (this.selectedCells.length === 2) {
            const [cell1, cell2] = this.selectedCells;
            
            // 检查是否是相同的宠物
            if (cell1.dataset.pokemonId === cell2.dataset.pokemonId) {
                // 检查是否可以连接
                const path = this.gameLogic.findPath(cell1, cell2);
                
                if (path) {
                    // 匹配成功
                    this.handleMatch(cell1, cell2, path);
                } else {
                    // 不可连接
                    this.handleMismatch();
                }
            } else {
                // 不是相同的宠物
                this.handleMismatch();
            }
        }
    }
    
    // 处理匹配成功
    handleMatch(cell1, cell2, path) {
        // 播放匹配音效
        this.playSound('match');
        
        // 显示连接线
        this.gameLogic.showConnectionLine(path);
        
        // 添加匹配状态
        setTimeout(() => {
            cell1.classList.add('matched');
            cell2.classList.add('matched');
            
            // 清除选中状态
            cell1.classList.remove('selected');
            cell2.classList.remove('selected');
            
            // 增加分数
            this.score += 10;
            
            // 增加匹配对数
            this.matchedPairs++;
            
            // 更新UI
            this.updateUI();
            
            // 清空选中的格子
            this.selectedCells = [];
            
            // 检查游戏是否结束
            if (this.matchedPairs === this.totalPairs) {
                this.endGame(true);
            }
        }, 500);
    }
    
    // 处理匹配失败
    handleMismatch() {
        // 播放不匹配音效
        this.playSound('mismatch');
        
        // 清除选中状态
        setTimeout(() => {
            this.selectedCells.forEach(cell => {
                cell.classList.remove('selected');
            });
            
            // 清空选中的格子
            this.selectedCells = [];
        }, 500);
    }
    
    // 开始计时器
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            
            // 更新计时器UI
            if (this.timerElement) {
                this.timerElement.textContent = this.timeLeft;
            }
            
            // 检查时间是否用完
            if (this.timeLeft <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }
    
    // 结束游戏
    endGame(isWin) {
        // 停止游戏
        this.isPlaying = false;
        
        // 清除计时器
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // 显示游戏结果
        const message = isWin 
            ? `恭喜你赢了！得分：${this.score}`
            : `游戏结束！得分：${this.score}`;
            
        // 延迟显示结果，让玩家看到最后的匹配动画
        setTimeout(() => {
            alert(message);
        }, 500);
    }
    
    // 播放音效
    playSound(type) {
        let sound;
        
        switch(type) {
            case 'select':
                sound = document.getElementById('select-sound');
                break;
            case 'match':
                sound = document.getElementById('match-sound');
                break;
            case 'mismatch':
                sound = document.getElementById('mismatch-sound');
                break;
            case 'win':
                sound = document.getElementById('win-sound');
                break;
            case 'lose':
                sound = document.getElementById('lose-sound');
                break;
        }
        
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("音频播放失败:", e));
        }
    }
    
    // 更新UI
    updateUI() {
        // 更新计时器
        if (this.timerElement) {
            this.timerElement.textContent = this.timeLeft;
        }
        
        // 更新分数
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
        
        // 更新提示次数
        if (this.hintCountElement) {
            this.hintCountElement.textContent = this.hintCount;
        }
        
        // 更新洗牌次数
        if (this.shuffleCountElement) {
            this.shuffleCountElement.textContent = this.shuffleCount;
        }
    }
    
    // 显示提示
    showHint() {
        if (!this.isPlaying || this.hintCount <= 0) {
            return;
        }
        
        // 减少提示次数
        this.hintCount--;
        
        // 更新UI
        this.updateUI();
        
        // 播放提示音效
        this.playSound('select');
        
        // 查找可匹配的一对
        const matchablePair = this.gameLogic.findMatchablePair();
        
        if (matchablePair) {
            const [cell1, cell2] = matchablePair;
            
            // 添加提示效果
            cell1.classList.add('hint');
            cell2.classList.add('hint');
            
            // 3秒后移除提示效果
            setTimeout(() => {
                cell1.classList.remove('hint');
                cell2.classList.remove('hint');
            }, 3000);
        }
    }
    
    // 洗牌
    shuffleBoard() {
        if (!this.isPlaying || this.shuffleCount <= 0) {
            return;
        }
        
        // 减少洗牌次数
        this.shuffleCount--;
        
        // 更新UI
        this.updateUI();
        
        // 播放洗牌音效
        this.playSound('select');
        
        // 获取所有未匹配的格子
        const unmatchedCells = Array.from(document.querySelectorAll('.cell:not(.matched)'));
        
        // 获取所有未匹配的宠物ID
        const pokemonIds = unmatchedCells.map(cell => cell.dataset.pokemonId);
        
        // 打乱宠物ID数组
        this.gameLogic.shuffleArray(pokemonIds);
        
        // 重新分配宠物ID
        unmatchedCells.forEach((cell, index) => {
            cell.dataset.pokemonId = pokemonIds[index];
            
            // 更新宠物图标
            const elementIcon = cell.querySelector('.element-icon');
            if (elementIcon) {
                elementIcon.className = `element-icon element-${pokemonIds[index]}`;
            }
        });
        
        // 清除选中状态
        this.selectedCells.forEach(cell => {
            cell.classList.remove('selected');
        });
        this.selectedCells = [];
    }
}

// 游戏逻辑处理类
class GameLogic {
    constructor(game) {
        this.game = game;
    }
    
    // 查找路径
    findPath(cell1, cell2) {
        const row1 = parseInt(cell1.dataset.row);
        const col1 = parseInt(cell1.dataset.col);
        const row2 = parseInt(cell2.dataset.row);
        const col2 = parseInt(cell2.dataset.col);
        
        // 创建路径起点和终点
        const start = { row: row1, col: col1 };
        const end = { row: row2, col: col2 };
        
        // 检查直线连接
        if (this.checkStraightLine(start, end)) {
            return [start, end];
        }
        
        // 检查一次拐角连接
        const oneCornerPath = this.checkOneCorner(start, end);
        if (oneCornerPath) {
            return oneCornerPath;
        }
        
        // 检查两次拐角连接
        const twoCornerPath = this.checkTwoCorners(start, end);
        if (twoCornerPath) {
            return twoCornerPath;
        }
        
        return null;
    }
    
    // 检查直线连接
    checkStraightLine(start, end) {
        // 如果不在同一行或同一列，则不是直线
        if (start.row !== end.row && start.col !== end.col) {
            return false;
        }
        
        // 检查路径上是否有障碍物
        if (start.row === end.row) {
            // 水平方向
            const minCol = Math.min(start.col, end.col);
            const maxCol = Math.max(start.col, end.col);
            
            for (let col = minCol + 1; col < maxCol; col++) {
                const cell = document.querySelector(`.cell[data-row="${start.row}"][data-col="${col}"]`);
                if (cell && !cell.classList.contains('matched')) {
                    return false;
                }
            }
        } else {
            // 垂直方向
            const minRow = Math.min(start.row, end.row);
            const maxRow = Math.max(start.row, end.row);
            
            for (let row = minRow + 1; row < maxRow; row++) {
                const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${start.col}"]`);
                if (cell && !cell.classList.contains('matched')) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // 检查一次拐角连接
    checkOneCorner(start, end) {
        // 创建两个可能的拐角点
        const corner1 = { row: start.row, col: end.col };
        const corner2 = { row: end.row, col: start.col };
        
        // 检查第一个拐角点
        const cornerCell1 = document.querySelector(`.cell[data-row="${corner1.row}"][data-col="${corner1.col}"]`);
        if (!cornerCell1 || cornerCell1.classList.contains('matched') || 
            (this.checkStraightLine(start, corner1) && this.checkStraightLine(corner1, end))) {
            return [start, corner1, end];
        }
        
        // 检查第二个拐角点
        const cornerCell2 = document.querySelector(`.cell[data-row="${corner2.row}"][data-col="${corner2.col}"]`);
        if (!cornerCell2 || cornerCell2.classList.contains('matched') || 
            (this.checkStraightLine(start, corner2) && this.checkStraightLine(corner2, end))) {
            return [start, corner2, end];
        }
        
        return null;
    }
    
    // 检查两次拐角连接
    checkTwoCorners(start, end) {
        // 检查所有可能的两次拐角路径
        for (let row = 0; row < this.game.rows; row++) {
            // 检查 start -> (row, start.col) -> (row, end.col) -> end
            const corner1 = { row: row, col: start.col };
            const corner2 = { row: row, col: end.col };
            
            if ((row !== start.row || row !== end.row) && 
                this.checkStraightLine(start, corner1) && 
                this.checkStraightLine(corner1, corner2) && 
                this.checkStraightLine(corner2, end)) {
                return [start, corner1, corner2, end];
            }
        }
        
        for (let col = 0; col < this.game.cols; col++) {
            // 检查 start -> (start.row, col) -> (end.row, col) -> end
            const corner1 = { row: start.row, col: col };
            const corner2 = { row: end.row, col: col };
            
            if ((col !== start.col || col !== end.col) && 
                this.checkStraightLine(start, corner1) && 
                this.checkStraightLine(corner1, corner2) && 
                this.checkStraightLine(corner2, end)) {
                return [start, corner1, corner2, end];
            }
        }
        
        return null;
    }
    
    // 显示连接线
    showConnectionLine(path) {
        if (!this.game.connectionContainer || !path || path.length < 2) {
            return;
        }
        
        // 清除之前的连接线
        this.game.connectionContainer.innerHTML = '';
        
        // 获取格子大小
        const cellElement = document.querySelector('.cell');
        const cellRect = cellElement.getBoundingClientRect();
        const cellSize = cellRect.width;
        
        // 创建连接线
        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            
            const line = document.createElement('div');
            line.className = 'connection-line';
            
            // 计算线的位置和尺寸
            if (start.row === end.row) {
                // 水平线
                const minCol = Math.min(start.col, end.col);
                const maxCol = Math.max(start.col, end.col);
                const width = (maxCol - minCol) * cellSize;
                
                line.style.width = `${width}px`;
                line.style.height = '3px';
                line.style.left = `${minCol * cellSize + cellSize / 2}px`;
                line.style.top = `${start.row * cellSize + cellSize / 2}px`;
            } else if (start.col === end.col) {
                // 垂直线
                const minRow = Math.min(start.row, end.row);
                const maxRow = Math.max(start.row, end.row);
                const height = (maxRow - minRow) * cellSize;
                
                line.style.width = '3px';
                line.style.height = `${height}px`;
                line.style.left = `${start.col * cellSize + cellSize / 2}px`;
                line.style.top = `${minRow * cellSize + cellSize / 2}px`;
            }
            
            this.game.connectionContainer.appendChild(line);
        }
        
        // 设置连接线的动画效果
        setTimeout(() => {
            if (this.game.connectionContainer) {
                this.game.connectionContainer.innerHTML = '';
            }
        }, 800);
    }
    
    // 查找可匹配的一对
    findMatchablePair() {
        const cells = Array.from(document.querySelectorAll('.cell:not(.matched)'));
        
        // 按宠物ID分组
        const groupedCells = {};
        cells.forEach(cell => {
            const pokemonId = cell.dataset.pokemonId;
            if (!groupedCells[pokemonId]) {
                groupedCells[pokemonId] = [];
            }
            groupedCells[pokemonId].push(cell);
        });
        
        // 查找可连接的一对
        for (const pokemonId in groupedCells) {
            const sameCells = groupedCells[pokemonId];
            
            for (let i = 0; i < sameCells.length; i++) {
                for (let j = i + 1; j < sameCells.length; j++) {
                    const path = this.findPath(sameCells[i], sameCells[j]);
                    if (path) {
                        return [sameCells[i], sameCells[j]];
                    }
                }
            }
        }
        
        return null;
    }
    
    // 打乱数组
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
