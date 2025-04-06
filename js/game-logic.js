/**
 * 游戏逻辑处理类
 */
class GameLogic {
    constructor(game) {
        this.game = game;
        this.connectionContainer = document.getElementById('connection-container');
    }

    /**
     * 处理格子点击事件
     */
    handleCellClick(cell) {
        // 如果游戏未开始或格子已匹配，则忽略点击
        if (!this.game.isPlaying || cell.classList.contains('matched')) {
            return;
        }
        
        // 如果已经选中了这个格子，则取消选中
        if (cell.classList.contains('selected')) {
            cell.classList.remove('selected');
            this.game.selectedCells = this.game.selectedCells.filter(selectedCell => selectedCell !== cell);
            return;
        }
        
        // 如果已经选中了两个格子，先取消之前的选择
        if (this.game.selectedCells.length >= 2) {
            this.game.selectedCells.forEach(selectedCell => {
                selectedCell.classList.remove('selected');
            });
            this.game.selectedCells = [];
        }
        
        // 播放选择音效
        if (this.game.selectSound) {
            this.game.selectSound.currentTime = 0;
            this.game.selectSound.play().catch(e => console.log("音频播放失败:", e));
        }
        
        // 选中格子
        cell.classList.add('selected');
        this.game.selectedCells.push(cell);
        
        // 如果选中了两个格子，检查是否匹配
        if (this.game.selectedCells.length === 2) {
            const [cell1, cell2] = this.game.selectedCells;
            
            // 检查是否是相同的元素
            if (cell1.dataset.pokemonId === cell2.dataset.pokemonId) {
                // 检查是否可以连接
                const path = this.findPath(cell1, cell2);
                if (path) {
                    // 显示连接线
                    this.showConnectionLine(path);
                    
                    // 匹配成功
                    setTimeout(() => {
                        // 清除连接线
                        if (this.connectionContainer) {
                            this.connectionContainer.innerHTML = '';
                        }
                        
                        // 播放匹配音效
                        if (this.game.matchSound) {
                            this.game.matchSound.currentTime = 0;
                            this.game.matchSound.play().catch(e => console.log("音频播放失败:", e));
                        }
                        
                        // 标记为已匹配
                        cell1.classList.add('matched');
                        cell2.classList.add('matched');
                        cell1.classList.remove('selected');
                        cell2.classList.remove('selected');
                        
                        // 更新图鉴收集
                        const pokemonId = parseInt(cell1.dataset.pokemonId);
                        this.game.pokedexCollection[pokemonId] = true;
                        
                        // 更新图鉴显示
                        const pokedexItem = this.game.pokedexGrid.querySelector(`.pokedex-item[data-id="${pokemonId}"]`);
                        if (pokedexItem) {
                            pokedexItem.classList.remove('locked');
                        }
                        
                        // 增加分数
                        this.game.score += 10;
                        this.game.updateScore();
                        
                        // 增加匹配对数
                        this.game.matchedPairs++;
                        
                        // 检查游戏是否结束
                        if (this.game.matchedPairs >= this.game.totalPairs) {
                            this.game.endGame(true);
                        }
                        
                        // 清空选中的格子
                        this.game.selectedCells = [];
                    }, 500);
                } else {
                    // 不可连接
                    setTimeout(() => {
                        // 播放不匹配音效
                        if (this.game.noMatchSound) {
                            this.game.noMatchSound.currentTime = 0;
                            this.game.noMatchSound.play().catch(e => console.log("音频播放失败:", e));
                        }
                        
                        // 取消选中
                        cell1.classList.remove('selected');
                        cell2.classList.remove('selected');
                        this.game.selectedCells = [];
                    }, 500);
                }
            } else {
                // 不匹配
                setTimeout(() => {
                    // 播放不匹配音效
                    if (this.game.noMatchSound) {
                        this.game.noMatchSound.currentTime = 0;
                        this.game.noMatchSound.play().catch(e => console.log("音频播放失败:", e));
                    }
                    
                    // 取消选中
                    cell1.classList.remove('selected');
                    cell2.classList.remove('selected');
                    this.game.selectedCells = [];
                }, 500);
            }
        }
    }

    /**
     * 查找两个格子之间的连接路径
     */
    findPath(cell1, cell2) {
        const index1 = parseInt(cell1.dataset.index);
        const index2 = parseInt(cell2.dataset.index);
        
        // 获取棋盘大小
        let cols;
        if (this.game.gameMode === 'classic') {
            cols = 8;
        } else if (this.game.gameMode === 'challenge') {
            cols = 10;
        } else {
            cols = 6;
        }
        
        // 计算行列位置
        const row1 = Math.floor(index1 / cols);
        const col1 = index1 % cols;
        const row2 = Math.floor(index2 / cols);
        const col2 = index2 % cols;
        
        // 如果是同一个格子，返回null
        if (row1 === row2 && col1 === col2) {
            return null;
        }
        
        // 尝试直线连接
        const directPath = this.checkDirectPath(row1, col1, row2, col2);
        if (directPath) return directPath;
        
        // 尝试一个拐角的连接
        const oneTurnPath = this.checkOneTurnPath(row1, col1, row2, col2);
        if (oneTurnPath) return oneTurnPath;
        
        // 尝试两个拐角的连接
        const twoTurnPath = this.checkTwoTurnPath(row1, col1, row2, col2);
        if (twoTurnPath) return twoTurnPath;
        
        return null;
    }
    
    /**
     * 检查直线连接
     */
    checkDirectPath(row1, col1, row2, col2) {
        // 如果不在同一行或同一列，返回null
        if (row1 !== row2 && col1 !== col2) {
            return null;
        }
        
        // 获取棋盘大小
        let cols;
        if (this.game.gameMode === 'classic') {
            cols = 8;
        } else if (this.game.gameMode === 'challenge') {
            cols = 10;
        } else {
            cols = 6;
        }
        
        // 检查路径上是否有障碍物
        if (row1 === row2) {
            // 在同一行
            const minCol = Math.min(col1, col2);
            const maxCol = Math.max(col1, col2);
            
            for (let col = minCol + 1; col < maxCol; col++) {
                const index = row1 * cols + col;
                const cell = document.querySelector(`.cell[data-index="${index}"]`);
                if (cell && !cell.classList.contains('matched')) {
                    return null;
                }
            }
            
            return [
                { row: row1, col: col1 },
                { row: row2, col: col2 }
            ];
        } else {
            // 在同一列
            const minRow = Math.min(row1, row2);
            const maxRow = Math.max(row1, row2);
            
            for (let row = minRow + 1; row < maxRow; row++) {
                const index = row * cols + col1;
                const cell = document.querySelector(`.cell[data-index="${index}"]`);
                if (cell && !cell.classList.contains('matched')) {
                    return null;
                }
            }
            
            return [
                { row: row1, col: col1 },
                { row: row2, col: col2 }
            ];
        }
    }
    
    /**
     * 检查一个拐角的连接
     */
    checkOneTurnPath(row1, col1, row2, col2) {
        // 检查拐角(row1, col2)
        const corner1Empty = this.isEmptyCell(row1, col2);
        if (corner1Empty) {
            const path1 = this.checkDirectPath(row1, col1, row1, col2);
            const path2 = this.checkDirectPath(row1, col2, row2, col2);
            
            if (path1 && path2) {
                return [
                    { row: row1, col: col1 },
                    { row: row1, col: col2 },
                    { row: row2, col: col2 }
                ];
            }
        }
        
        // 检查拐角(row2, col1)
        const corner2Empty = this.isEmptyCell(row2, col1);
        if (corner2Empty) {
            const path1 = this.checkDirectPath(row1, col1, row2, col1);
            const path2 = this.checkDirectPath(row2, col1, row2, col2);
            
            if (path1 && path2) {
                return [
                    { row: row1, col: col1 },
                    { row: row2, col: col1 },
                    { row: row2, col: col2 }
                ];
            }
        }
        
        return null;
    }
    
    /**
     * 检查两个拐角的连接
     */
    checkTwoTurnPath(row1, col1, row2, col2) {
        // 获取棋盘大小
        let rows, cols;
        if (this.game.gameMode === 'classic') {
            rows = 8;
            cols = 8;
        } else if (this.game.gameMode === 'challenge') {
            rows = 8;
            cols = 10;
        } else {
            rows = 6;
            cols = 6;
        }
        
        // 尝试所有可能的中间点
        for (let row = 0; row < rows; row++) {
            if (row !== row1 && row !== row2) {
                const corner1Empty = this.isEmptyCell(row, col1);
                const corner2Empty = this.isEmptyCell(row, col2);
                
                if (corner1Empty && corner2Empty) {
                    const path1 = this.checkDirectPath(row1, col1, row, col1);
                    const path2 = this.checkDirectPath(row, col1, row, col2);
                    const path3 = this.checkDirectPath(row, col2, row2, col2);
                    
                    if (path1 && path2 && path3) {
                        return [
                            { row: row1, col: col1 },
                            { row: row, col: col1 },
                            { row: row, col: col2 },
                            { row: row2, col: col2 }
                        ];
                    }
                }
            }
        }
        
        for (let col = 0; col < cols; col++) {
            if (col !== col1 && col !== col2) {
                const corner1Empty = this.isEmptyCell(row1, col);
                const corner2Empty = this.isEmptyCell(row2, col);
                
                if (corner1Empty && corner2Empty) {
                    const path1 = this.checkDirectPath(row1, col1, row1, col);
                    const path2 = this.checkDirectPath(row1, col, row2, col);
                    const path3 = this.checkDirectPath(row2, col, row2, col2);
                    
                    if (path1 && path2 && path3) {
                        return [
                            { row: row1, col: col1 },
                            { row: row1, col: col },
                            { row: row2, col: col },
                            { row: row2, col: col2 }
                        ];
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * 检查格子是否为空（已匹配或不存在）
     */
    isEmptyCell(row, col) {
        // 获取棋盘大小
        let cols;
        if (this.game.gameMode === 'classic') {
            cols = 8;
        } else if (this.game.gameMode === 'challenge') {
            cols = 10;
        } else {
            cols = 6;
        }
        
        const index = row * cols + col;
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        
        return !cell || cell.classList.contains('matched');
    }
    
    /**
     * 显示连接线
     */
    showConnectionLine(path) {
        if (!this.connectionContainer || !path || path.length < 2) {
            return;
        }
        
        // 清除之前的连接线
        this.connectionContainer.innerHTML = '';
        
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
                const width = Math.abs(start.col - end.col) * cellSize;
                
                line.style.width = `${width}px`;
                line.style.height = '3px';
                line.style.left = `${minCol * cellSize + cellSize / 2}px`;
                line.style.top = `${start.row * cellSize + cellSize / 2}px`;
            } else if (start.col === end.col) {
                // 垂直线
                const minRow = Math.min(start.row, end.row);
                const height = Math.abs(start.row - end.row) * cellSize;
                
                line.style.width = '3px';
                line.style.height = `${height}px`;
                line.style.left = `${start.col * cellSize + cellSize / 2}px`;
                line.style.top = `${minRow * cellSize + cellSize / 2}px`;
            }
            
            this.connectionContainer.appendChild(line);
        }
        
        // 设置连接线的动画效果
        setTimeout(() => {
            if (this.connectionContainer) {
                this.connectionContainer.innerHTML = '';
            }
        }, 800);
    }
    
    /**
     * 获取格子大小
     */
    getCellSize() {
        const cell = document.querySelector('.cell');
        if (!cell) return 50; // 默认大小
        
        const rect = cell.getBoundingClientRect();
        return rect.width;
    }
    
    /**
     * 显示提示
     */
    showHint() {
        if (!this.game.isPlaying || this.game.hintCount <= 0) {
            return;
        }
        
        // 减少提示次数
        this.game.hintCount--;
        if (this.game.hintCountElement) {
            this.game.hintCountElement.textContent = this.game.hintCount;
        }
        
        // 播放提示音效
        if (this.game.hintSound) {
            this.game.hintSound.currentTime = 0;
            this.game.hintSound.play().catch(e => console.log("音频播放失败:", e));
        }
        
        // 查找可匹配的一对
        const matchablePair = this.findMatchablePair();
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
    
    /**
     * 查找可匹配的一对
     */
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
    
    /**
     * 洗牌
     */
    shuffleBoard() {
        if (!this.game.isPlaying || this.game.shuffleCount <= 0) {
            return;
        }
        
        // 减少洗牌次数
        this.game.shuffleCount--;
        if (this.game.shuffleCountElement) {
            this.game.shuffleCountElement.textContent = this.game.shuffleCount;
        }
        
        // 播放洗牌音效
        if (this.game.shuffleSound) {
            this.game.shuffleSound.currentTime = 0;
            this.game.shuffleSound.play().catch(e => console.log("音频播放失败:", e));
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
            }
        });
        
        // 清除选中状态
        this.game.selectedCells.forEach(cell => {
            cell.classList.remove('selected');
        });
        this.game.selectedCells = [];
    }
    
    /**
     * 打乱数组
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
