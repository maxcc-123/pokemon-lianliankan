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