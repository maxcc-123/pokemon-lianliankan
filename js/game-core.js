// 游戏核心逻辑
class GameCore {
    constructor() {
        this.board = [];
        this.rows = 0;
        this.cols = 0;
        this.selectedCell = null;
        this.score = 0;
        this.hintsLeft = 3;
        this.timeLeft = 240;
        this.timer = null;
        this.gameStarted = false;
        this.difficulty = 'normal';
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.lastOperationTime = 0;
        this.operationTimeout = 30000; // 30秒操作超时
    }

    // 初始化游戏板
    initBoard(difficulty) {
        this.difficulty = difficulty;
        
        // 根据难度设置行列数和时间
        switch(difficulty) {
            case 'easy':
                this.rows = 6;
                this.cols = 6;
                this.timeLeft = 300;
                break;
            case 'normal':
                this.rows = 8;
                this.cols = 8;
                this.timeLeft = 240;
                break;
            case 'hard':
                this.rows = 10;
                this.cols = 10;
                this.timeLeft = 180;
                break;
        }
        
        // 计算需要的元素对数
        const totalCells = this.rows * this.cols;
        this.totalPairs = totalCells / 2;
        
        // 创建元素数组
        let elements = [];
        for (let i = 1; i <= this.totalPairs; i++) {
            // 每种元素放入两个
            const elementType = (i % 16) + 1; // 使用16种元素循环
            elements.push(elementType);
            elements.push(elementType);
        }
        
        // 随机打乱元素
        elements = this.shuffleArray(elements);
        
        // 填充游戏板
        this.board = [];
        let index = 0;
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = {
                    type: elements[index++],
                    matched: false,
                    row: row,
                    col: col
                };
            }
        }
        
        this.matchedPairs = 0;
        this.score = 0;
        this.hintsLeft = 3;
        this.selectedCell = null;
        this.lastOperationTime = Date.now();
        
        return this.board;
    }
    
    // 打乱数组
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // 选择单元格
    selectCell(row, col) {
        if (!this.gameStarted || this.board[row][col].matched) {
            return null;
        }
        
        // 更新最后操作时间
        this.lastOperationTime = Date.now();
        
        const currentCell = this.board[row][col];
        
        // 如果没有选中的单元格，选中当前单元格
        if (!this.selectedCell) {
            this.selectedCell = currentCell;
            return { action: 'select', cell: currentCell };
        }
        
        // 如果点击的是已选中的单元格，取消选中
        if (this.selectedCell === currentCell) {
            this.selectedCell = null;
            return { action: 'deselect', cell: currentCell };
        }
        
        // 检查是否匹配
        if (this.selectedCell.type === currentCell.type) {
            // 检查路径
            const path = this.findPath(this.selectedCell, currentCell);
            if (path) {
                // 匹配成功
                this.selectedCell.matched = true;
                currentCell.matched = true;
                
                // 更新分数和匹配对数
                this.score += 10;
                this.matchedPairs++;
                
                const result = { 
                    action: 'match', 
                    cells: [this.selectedCell, currentCell],
                    path: path
                };
                
                this.selectedCell = null;
                
                // 检查是否胜利
                if (this.matchedPairs === this.totalPairs) {
                    result.gameWon = true;
                }
                
                return result;
            }
        }
        
        // 不匹配或无法连接，选中新单元格
        const previousCell = this.selectedCell;
        this.selectedCell = currentCell;
        return { 
            action: 'switch', 
            previousCell: previousCell,
            newCell: currentCell
        };
    }
    
    // 查找连接路径
    findPath(cell1, cell2) {
        // 这个方法将在game-path.js中实现
        // 这里只是一个占位符
        return PathFinder.findPath(this.board, cell1, cell2);
    }
    
    // 使用提示
    useHint() {
        if (this.hintsLeft <= 0 || !this.gameStarted) {
            return null;
        }
        
        // 查找可匹配的一对
        const hintPair = this.findMatchablePair();
        if (hintPair) {
            this.hintsLeft--;
            return hintPair;
        }
        
        return null;
    }
    
    // 查找可匹配的一对
    findMatchablePair() {
        for (let r1 = 0; r1 < this.rows; r1++) {
            for (let c1 = 0; c1 < this.cols; c1++) {
                const cell1 = this.board[r1][c1];
                if (cell1.matched) continue;
                
                for (let r2 = 0; r2 < this.rows; r2++) {
                    for (let c2 = 0; c2 < this.cols; c2++) {
                        // 跳过相同位置和已匹配的单元格
                        if ((r1 === r2 && c1 === c2) || this.board[r2][c2].matched) continue;
                        
                        const cell2 = this.board[r2][c2];
                        // 检查类型是否相同且可连接
                        if (cell1.type === cell2.type && this.findPath(cell1, cell2)) {
                            return { cell1, cell2 };
                        }
                    }
                }
            }
        }
        
        return null;
    }
    
    // 检查是否还有可匹配的对
    hasMatchablePairs() {
        return this.findMatchablePair() !== null;
    }
    
    // 洗牌
    shuffleBoard() {
        if (!this.gameStarted) return false;
        
        // 收集未匹配的单元格
        let unmatchedCells = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].matched) {
                    unmatchedCells.push(this.board[row][col]);
                }
            }
        }
        
        // 提取类型
        let types = unmatchedCells.map(cell => cell.type);
        
        // 打乱类型
        types = this.shuffleArray(types);
        
        // 重新分配类型
        for (let i = 0; i < unmatchedCells.length; i++) {
            unmatchedCells[i].type = types[i];
        }
        
        // 重置选中状态
        this.selectedCell = null;
        
        return true;
    }
    
    // 检查操作超时
    checkOperationTimeout() {
        if (!this.gameStarted) return false;
        
        const now = Date.now();
        return (now - this.lastOperationTime) > this.operationTimeout;
    }
    
    // 开始游戏
    startGame(difficulty) {
        this.initBoard(difficulty);
        this.gameStarted = true;
        this.lastOperationTime = Date.now();
        return true;
    }
    
    // 结束游戏
    endGame() {
        this.gameStarted = false;
        return {
            score: this.score,
            matchedPairs: this.matchedPairs,
            totalPairs: this.totalPairs
        };
    }
}

// 导出GameCore类
if (typeof module !== 'undefined') {
    module.exports = { GameCore };
}


/**
 * 创建单个游戏单元格
 * @param {number} row - 行索引
 * @param {number} col - 列索引
 * @param {number} value - 单元格值
 * @returns {HTMLElement} - 创建的单元格元素
 */
createCell(row, col, value); {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.dataset.value = value;
    
    // 创建图标容器，用于翻转效果
    const iconContainer = document.createElement('div');
    iconContainer.className = 'icon-container';
    
    // 创建正面（宝可梦图像）
    const elementIcon = document.createElement('div');
    elementIcon.className = 'element-icon';
    
    // 创建宝可梦图像
    const pokemonImg = document.createElement('img');
    pokemonImg.alt = `Pokemon ${value}`;
    
    // 根据全局设置决定使用本地图片还是API图片
    if (window.usePokemonAPI) {
        pokemonImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${value}.png`;
    } else {
        pokemonImg.src = `./assets/images/pokemon/${value}.png`;
    }
    
    // 图片加载失败时的处理
    pokemonImg.onerror = function() {
        this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${value}.png`;
    };
    
    elementIcon.appendChild(pokemonImg);
    
    // 创建背面（宝可球）
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    
    const pokeballImg = document.createElement('img');
    pokeballImg.src = './assets/images/pokeball.png';
    pokeballImg.alt = 'Pokeball';
    pokeballImg.onerror = function() {
        this.src = 'https://raw.githubusercontent.com/PokeAPI/media/master/logo/pokeball.png';
    };
    
    cardBack.appendChild(pokeballImg);
    
    // 将正反面添加到容器
    iconContainer.appendChild(elementIcon);
    iconContainer.appendChild(cardBack);
    
    // 将容器添加到单元格
    cell.appendChild(iconContainer);
    
    return cell;
}

/**
 * 选择单元格
 * @param {HTMLElement} cell - 要选择的单元格
 */
selectCell(cell); {
    // 如果游戏未开始或单元格已匹配，则不做任何操作
    if (!this.gameStarted || cell.classList.contains('matched')) {
        return;
    }
    
    // 如果单元格已经被选中，则取消选择
    if (cell.classList.contains('selected')) {
        cell.classList.remove('selected');
        // 移除翻转效果
        const iconContainer = cell.querySelector('.icon-container');
        if (iconContainer) {
            iconContainer.classList.remove('flipped');
        }
        this.selectedCells = this.selectedCells.filter(c => c !== cell);
        return;
    }
    
    // 添加选中样式
    cell.classList.add('selected');
    
    // 添加翻转效果 - 显示宝可梦图像
    const iconContainer = cell.querySelector('.icon-container');
    if (iconContainer) {
        iconContainer.classList.add('flipped');
    }
    
    // 添加到已选中数组
    this.selectedCells.push(cell);
    
    // 如果已选中两个单元格，则检查是否匹配
    if (this.selectedCells.length === 2) {
        this.checkMatch();
    }
}

/**
 * 检查两个选中的单元格是否匹配
 */
checkMatch(); {
    const [cell1, cell2] = this.selectedCells;
    const value1 = cell1.dataset.value;
    const value2 = cell2.dataset.value;
    
    // 如果值相同且不是同一个单元格
    if (value1 === value2 && cell1 !== cell2) {
        // 检查是否可以连接
        const path = this.pathFinder.findPath(
            parseInt(cell1.dataset.row), 
            parseInt(cell1.dataset.col), 
            parseInt(cell2.dataset.row), 
            parseInt(cell2.dataset.col)
        );
        
        if (path) {
            // 匹配成功
            this.handleMatchSuccess(cell1, cell2, path);
        } else {
            // 不能连接
            this.handleMatchFailed();
        }
    } else {
        // 值不同，匹配失败
        this.handleMatchFailed();
    }
}

/**
 * 处理匹配成功
 * @param {HTMLElement} cell1 - 第一个单元格
 * @param {HTMLElement} cell2 - 第二个单元格
 * @param {Array} path - 连接路径
 */
handleMatchSuccess(cell1, cell2, path); {
    // 移除选中样式
    cell1.classList.remove('selected');
    cell2.classList.remove('selected');
    
    // 添加匹配样式
    cell1.classList.add('matched');
    cell2.classList.add('matched');
    
    // 保持翻转状态，不需要移除flipped类
    
    // 清空选中数组
    this.selectedCells = [];
    
    // 更新游戏状态
    this.matchedPairs++;
    this.updateScore(10); // 基础分数
    
    // 显示连接路径
    if (this.visualEffects) {
        this.visualEffects.showPath(path);
    }
    
    // 检查游戏是否结束
    this.checkGameEnd();
    
    // 触发匹配成功事件
    document.dispatchEvent(new CustomEvent('matchSuccess'));
}

/**
 * 处理匹配失败
 */
handleMatchFailed(); {
    // 获取选中的单元格
    const [cell1, cell2] = this.selectedCells;
    
    // 移除选中样式
    setTimeout(() => {
        cell1.classList.remove('selected');
        cell2.classList.remove('selected');
        
        // 移除翻转效果
        const iconContainer1 = cell1.querySelector('.icon-container');
        const iconContainer2 = cell2.querySelector('.icon-container');
        
        if (iconContainer1) iconContainer1.classList.remove('flipped');
        if (iconContainer2) iconContainer2.classList.remove('flipped');
        
        // 清空选中数组
        this.selectedCells = [];
        
        // 触发匹配失败事件
        document.dispatchEvent(new CustomEvent('matchFailed'));
    }, 1000); // 延迟一秒，让玩家看清楚
}

// 导出Game类
if (typeof module !== 'undefined') {
    module.exports = { Game };
}