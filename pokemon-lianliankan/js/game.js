// 游戏主类
class PokemonGame {
    constructor() {
        // 游戏元素
        this.startBtn = document.getElementById('start-game-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.difficultySelect = document.getElementById('difficulty-select');
        this.gameBoard = document.querySelector('.game-board');
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.hintsElement = document.getElementById('hints');
        
        // 游戏状态
        this.isPlaying = false;
        this.score = 0;
        this.timeLeft = 0;
        this.hintCount = 3;
        this.selectedCells = [];
        this.timer = null;
        
        // 初始化
        this.init();
    }
    
    // 初始化游戏
    init() {
        // 绑定按钮事件
        this.startBtn.addEventListener('click', () => this.startGame());
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.shuffleBtn.addEventListener('click', () => this.shuffleBoard());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        
        // 禁用游戏按钮
        this.toggleGameButtons(false);
    }
    
    // 开始游戏
    startGame() {
        // 获取难度
        const difficulty = this.difficultySelect.value;
        
        // 设置游戏参数
        let rows, cols, timeLimit;
        
        switch(difficulty) {
            case 'easy':
                rows = 6;
                cols = 6;
                timeLimit = 180;
                this.hintCount = 5;
                break;
            case 'hard':
                rows = 8;
                cols = 10;
                timeLimit = 300;
                this.hintCount = 3;
                break;
            case 'normal':
            default:
                rows = 8;
                cols = 8;
                timeLimit = 240;
                this.hintCount = 4;
                break;
        }
        
        // 重置游戏状态
        this.isPlaying = true;
        this.score = 0;
        this.timeLeft = timeLimit;
        this.selectedCells = [];
        
        // 更新UI
        this.updateUI();
        
        // 创建游戏面板
        this.createBoard(rows, cols);
        
        // 启用游戏按钮
        this.toggleGameButtons(true);
        
        // 开始计时
        this.startTimer();
    }
    
    // 创建游戏面板
    createBoard(rows, cols) {
        // 清空游戏面板
        this.gameBoard.innerHTML = '';
        
        // 设置网格列数
        this.gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        
        // 计算总格子数
        const totalCells = rows * cols;
        
        // 确保是偶数个格子
        if (totalCells % 2 !== 0) {
            console.error('格子总数必须是偶数');
            return;
        }
        
        // 创建宠物ID数组
        const pokemonIds = [];
        
        // 生成配对的宠物ID
        for (let i = 0; i < totalCells / 2; i++) {
            // 使用模运算确保ID在1-16范围内
            const pokemonId = (i % 16) + 1;
            pokemonIds.push(pokemonId, pokemonId);
        }
        
        // 打乱宠物ID数组
        this.shuffleArray(pokemonIds);
        
        // 创建格子
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            // 计算行列位置
            const row = Math.floor(i / cols);
            const col = i % cols;
            
            // 设置数据属性
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.dataset.pokemonId = pokemonIds[i];
            
            // 创建宠物图标
            const elementIcon = document.createElement('div');
            elementIcon.className = `element-icon element-${pokemonIds[i]}`;
            
            // 设置背景颜色（备用方案）
            const colors = [
                '#ff9999', '#99ff99', '#9999ff', '#ffff99', 
                '#ff99ff', '#99ffff', '#ffcc99', '#cc99ff',
                '#99ffcc', '#ff9966', '#66ff99', '#9966ff', 
                '#ffff66', '#ff66ff', '#66ffff', '#ffcc66'
            ];
            elementIcon.style.backgroundColor = colors[(pokemonIds[i] - 1) % colors.length];
            elementIcon.style.borderRadius = '8px';
            
            // 显示宠物ID
            elementIcon.textContent = pokemonIds[i];
            
            cell.appendChild(elementIcon);
            
            // 添加点击事件
            cell.addEventListener('click', (e) => this.handleCellClick(e));
            
            // 添加到游戏面板
            this.gameBoard.appendChild(cell);
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
        
        // 如果选中了两个格子，检查是否匹配
        if (this.selectedCells.length === 2) {
            const [cell1, cell2] = this.selectedCells;
            
            // 检查是否是相同的宠物
            if (cell1.dataset.pokemonId === cell2.dataset.pokemonId) {
                // 匹配成功
                setTimeout(() => {
                    cell1.classList.add('matched');
                    cell2.classList.add('matched');
                    
                    // 清除选中状态
                    cell1.classList.remove('selected');
                    cell2.classList.remove('selected');
                    
                    // 增加分数
                    this.score += 10;
                    this.updateUI();
                    
                    // 清空选中数组
                    this.selectedCells = [];
                    
                    // 检查游戏是否结束
                    this.checkGameEnd();
                }, 500);
            } else {
                // 不匹配
                setTimeout(() => {
                    cell1.classList.remove('selected');
                    cell2.classList.remove('selected');
                    
                    // 清空选中数组
                    this.selectedCells = [];
                }, 500);
            }
        }
    }
    
    // 检查游戏是否结束
    checkGameEnd() {
        const unmatchedCells = document.querySelectorAll('.cell:not(.matched)');
        
        if (unmatchedCells.length === 0) {
            // 游戏胜利
            this.endGame(true);
        }
    }
    
    // 结束游戏
    endGame(isWin) {
        // 停止游戏
        this.isPlaying = false;
        
        // 清除计时器
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // 禁用游戏按钮
        this.toggleGameButtons(false);
        
        // 显示游戏结果
        const message = isWin 
            ? `恭喜你赢了！得分：${this.score}`
            : `游戏结束！得分：${this.score}`;
            
        // 延迟显示结果，让玩家看到最后的匹配动画
        setTimeout(() => {
            alert(message);
        }, 500);
    }
    
    // 开始计时器
    startTimer() {
        // 清除之前的计时器
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // 开始计时
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateUI();
            
            // 检查时间是否用完
            if (this.timeLeft <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }
    
    // 显示提示
    showHint() {
        if (!this.isPlaying || this.hintCount <= 0) {
            return;
        }
        
        // 减少提示次数
        this.hintCount--;
        this.updateUI();
        
        // 获取所有未匹配的格子
        const unmatchedCells = Array.from(document.querySelectorAll('.cell:not(.matched)'));
        
        // 按宠物ID分组
        const groupedCells = {};
        unmatchedCells.forEach(cell => {
            const pokemonId = cell.dataset.pokemonId;
            if (!groupedCells[pokemonId]) {
                groupedCells[pokemonId] = [];
            }
            groupedCells[pokemonId].push(cell);
        });
        
        // 查找可匹配的一对
        for (const pokemonId in groupedCells) {
            if (groupedCells[pokemonId].length >= 2) {
                const [cell1, cell2] = groupedCells[pokemonId].slice(0, 2);
                
                // 添加提示效果
                cell1.classList.add('hint');
                cell2.classList.add('hint');
                
                // 3秒后移除提示效果
                setTimeout(() => {
                    cell1.classList.remove('hint');
                    cell2.classList.remove('hint');
                }, 3000);
                
                return;
            }
        }
    }
    
    // 洗牌
    shuffleBoard() {
        if (!this.isPlaying) {
            return;
        }
        
        // 获取所有未匹配的格子
        const unmatchedCells = Array.from(document.querySelectorAll('.cell:not(.matched)'));
        
        // 获取所有未匹配的宠物ID
        const pokemonIds = unmatchedCells.map(cell => cell.dataset.pokemonId);
        
        // 打乱宠物ID数组
        this.shuffleArray(pokemonIds);
        
        // 重新分配宠物ID
        unmatchedCells.forEach((cell, index) => {
            cell.dataset.pokemonId = pokemonIds[index];
            
            // 更新宠物图标
            const elementIcon = cell.querySelector('.element-icon');
            if (elementIcon) {
                elementIcon.className = `element-icon element-${pokemonIds[index]}`;
                
                // 更新背景颜色
                const colors = [
                    '#ff9999', '#99ff99', '#9999ff', '#ffff99', 
                    '#ff99ff', '#99ffff', '#ffcc99', '#cc99ff',
                    '#99ffcc', '#ff9966', '#66ff99', '#9966ff', 
                    '#ffff66', '#ff66ff', '#66ffff', '#ffcc66'
                ];
                elementIcon.style.backgroundColor = colors[(pokemonIds[index] - 1) % colors.length];
                
                // 更新文本
                elementIcon.textContent = pokemonIds[index];
            }
        });
        
        // 清除选中状态
        this.selectedCells.forEach(cell => {
            cell.classList.remove('selected');
        });
        this.selectedCells = [];
    }
    
    // 重置游戏
    resetGame() {
        // 停止游戏
        this.isPlaying = false;
        
        // 清除计时器
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // 清空游戏面板
        this.gameBoard.innerHTML = '';
        
        // 重置游戏状态
        this.score = 0;
        this.timeLeft = 0;
        this.hintCount = 3;
        this.selectedCells = [];
        
        // 更新UI
        this.updateUI();
        
        // 禁用游戏按钮
        this.toggleGameButtons(false);
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
        if (this.hintsElement) {
            this.hintsElement.textContent = this.hintCount;
        }
    }
    
    // 切换游戏按钮状态
    toggleGameButtons(enabled) {
        this.hintBtn.disabled = !enabled;
        this.shuffleBtn.disabled = !enabled;
        this.resetBtn.disabled = !enabled;
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

// 当DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new PokemonGame();
});
