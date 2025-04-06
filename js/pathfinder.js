/**
 * 路径查找算法
 * 实现连连看游戏中的路径检测
 */
class PathFinder {
    constructor(boardElement) {
        this.boardElement = boardElement;
        this.rows = 0;
        this.cols = 0;
        this.grid = [];
        
        // 初始化网格
        this.initGrid();
    }
    
    /**
     * 初始化网格
     */
    initGrid() {
        // 获取所有格子
        const cells = Array.from(this.boardElement.querySelectorAll('.cell'));
        
        // 确定行列数
        const style = getComputedStyle(this.boardElement);
        this.cols = parseInt(style.gridTemplateColumns.split(' ').length) || 8;
        this.rows = Math.ceil(cells.length / this.cols);
        
        console.log(`Grid size: ${this.rows} rows x ${this.cols} columns`);
        
        // 创建二维网格
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(null));
        
        // 填充网格
        cells.forEach(cell => {
            const index = parseInt(cell.dataset.index);
            const row = Math.floor(index / this.cols);
            const col = index % this.cols;
            
            if (row < this.rows && col < this.cols) {
                this.grid[row][col] = {
                    cell: cell,
                    matched: cell.classList.contains('matched'),
                    obstacle: cell.classList.contains('obstacle'),
                    pokemonId: cell.dataset.pokemonId
                };
            }
        });
    }
    
    /**
     * 查找两个格子之间的路径
     */
    findPath(cell1, cell2) {
        console.log("Finding path between cells");
        
        // 获取格子在网格中的位置
        const pos1 = this.getCellPosition(cell1);
        const pos2 = this.getCellPosition(cell2);
        
        if (!pos1 || !pos2) {
            console.log("Cannot find cell positions");
            return null;
        }
        
        console.log(`Cell 1: row=${pos1.row}, col=${pos1.col}, Cell 2: row=${pos2.row}, col=${pos2.col}`);
        
        // 检查直线连接
        const directPath = this.checkDirectPath(pos1, pos2);
        if (directPath) {
            console.log("Found direct path");
            return directPath;
        }
        
        // 检查单折线
        const oneTurnPath = this.checkOneTurnPath(pos1, pos2);
        if (oneTurnPath) {
            console.log("Found one turn path");
            return oneTurnPath;
        }
        
        // 检查双折线
        const twoTurnPath = this.checkTwoTurnPath(pos1, pos2);
        if (twoTurnPath) {
            console.log("Found two turn path");
            return twoTurnPath;
        }
        
        console.log("No path found");
        return null;
    }
    
    /**
     * 获取格子在网格中的位置
     */
    getCellPosition(cell) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col] && this.grid[row][col].cell === cell) {
                    return { row, col };
                }
            }
        }
        
        // 如果找不到位置，尝试通过索引计算
        const index = parseInt(cell.dataset.index);
        if (!isNaN(index)) {
            const row = Math.floor(index / this.cols);
            const col = index % this.cols;
            return { row, col };
        }
        
        return null;
    }
    
    /**
     * 检查两点之间是否可以直线连接
     */
    checkDirectPath(pos1, pos2) {
        // 如果两点在同一行
        if (pos1.row === pos2.row) {
            const row = pos1.row;
            const startCol = Math.min(pos1.col, pos2.col);
            const endCol = Math.max(pos1.col, pos2.col);
            
            // 检查中间是否有障碍物
            for (let col = startCol + 1; col < endCol; col++) {
                if (this.grid[row][col] && !this.grid[row][col].matched && !this.grid[row][col].obstacle) {
                    return null; // 有障碍物，不能直线连接
                }
            }
            
            // 可以直线连接，返回路径
            return [
                this.grid[pos1.row][pos1.col].cell,
                this.grid[pos2.row][pos2.col].cell
            ];
        }
        
        // 如果两点在同一列
        if (pos1.col === pos2.col) {
            const col = pos1.col;
            const startRow = Math.min(pos1.row, pos2.row);
            const endRow = Math.max(pos1.row, pos2.row);
            
            // 检查中间是否有障碍物
            for (let row = startRow + 1; row < endRow; row++) {
                if (this.grid[row][col] && !this.grid[row][col].matched && !this.grid[row][col].obstacle) {
                    return null; // 有障碍物，不能直线连接
                }
            }
            
            // 可以直线连接，返回路径
            return [
                this.grid[pos1.row][pos1.col].cell,
                this.grid[pos2.row][pos2.col].cell
            ];
        }
        
        // 不在同一行也不在同一列，不能直线连接
        return null;
    }
    
    /**
     * 检查两点之间是否可以单折线连接
     */
    checkOneTurnPath(pos1, pos2) {
        // 尝试通过拐点 (pos1.row, pos2.col) 连接
        const corner1 = { row: pos1.row, col: pos2.col };
        
        // 检查拐点是否为空或已匹配或是障碍物
        if (!this.grid[corner1.row][corner1.col] || 
            this.grid[corner1.row][corner1.col].matched || 
            this.grid[corner1.row][corner1.col].obstacle) {
            
            // 检查从pos1到拐点的直线路径
            const path1 = this.checkDirectPath(pos1, corner1);
            // 检查从拐点到pos2的直线路径
            const path2 = this.checkDirectPath(corner1, pos2);
            
            if (path1 && path2) {
                // 可以通过拐点连接，返回路径
                return [
                    this.grid[pos1.row][pos1.col].cell,
                    this.grid[corner1.row][corner1.col].cell,
                    this.grid[pos2.row][pos2.col].cell
                ];
            }
        }
        
        // 尝试通过拐点 (pos2.row, pos1.col) 连接
        const corner2 = { row: pos2.row, col: pos1.col };
        
        // 检查拐点是否为空或已匹配或是障碍物
        if (!this.grid[corner2.row][corner2.col] || 
            this.grid[corner2.row][corner2.col].matched || 
            this.grid[corner2.row][corner2.col].obstacle) {
            
            // 检查从pos1到拐点的直线路径
            const path1 = this.checkDirectPath(pos1, corner2);
            // 检查从拐点到pos2的直线路径
            const path2 = this.checkDirectPath(corner2, pos2);
            
            if (path1 && path2) {
                // 可以通过拐点连接，返回路径
                return [
                    this.grid[pos1.row][pos1.col].cell,
                    this.grid[corner2.row][corner2.col].cell,
                    this.grid[pos2.row][pos2.col].cell
                ];
            }
        }
        
        // 不能单折线连接
        return null;
    }
    
    /**
     * 检查两点之间是否可以双折线连接
     */
    checkTwoTurnPath(pos1, pos2) {
        // 尝试所有可能的中间点
        for (let row = 0; row < this.rows; row++) {
            // 尝试通过 (row, pos1.col) 和 (row, pos2.col) 连接
            if (row !== pos1.row && row !== pos2.row) {
                const mid1 = { row, col: pos1.col };
                const mid2 = { row, col: pos2.col };
                
                // 检查两个中间点是否为空或已匹配
                const isMid1Empty = !this.grid[mid1.row][mid1.col] || 
                                   this.grid[mid1.row][mid1.col].matched || 
                                   this.grid[mid1.row][mid1.col].obstacle;
                                   
                const isMid2Empty = !this.grid[mid2.row][mid2.col] || 
                                   this.grid[mid2.row][mid2.col].matched || 
                                   this.grid[mid2.row][mid2.col].obstacle;
                
                if (isMid1Empty && isMid2Empty) {
                    // 检查三段路径是否都可以直线连接
                    const path1 = this.checkDirectPath(pos1, mid1);
                    const path2 = this.checkDirectPath(mid1, mid2);
                    const path3 = this.checkDirectPath(mid2, pos2);
                    
                    if (path1 && path2 && path3) {
                        // 可以通过两个拐点连接，返回路径
                        return [
                            this.grid[pos1.row][pos1.col].cell,
                            this.grid[mid1.row][mid1.col].cell,
                            this.grid[mid2.row][mid2.col].cell,
                            this.grid[pos2.row][pos2.col].cell
                        ];
                    }
                }
            }
        }
        
        for (let col = 0; col < this.cols; col++) {
            // 尝试通过 (pos1.row, col) 和 (pos2.row, col) 连接
            if (col !== pos1.col && col !== pos2.col) {
                const mid1 = { row: pos1.row, col };
                const mid2 = { row: pos2.row, col };
                
                // 检查两个中间点是否为空或已匹配
                const isMid1Empty = !this.grid[mid1.row][mid1.col] || 
                                   this.grid[mid1.row][mid1.col].matched || 
                                   this.grid[mid1.row][mid1.col].obstacle;
                                   
                const isMid2Empty = !this.grid[mid2.row][mid2.col] || 
                                   this.grid[mid2.row][mid2.col].matched || 
                                   this.grid[mid2.row][mid2.col].obstacle;
                
                if (isMid1Empty && isMid2Empty) {
                    // 检查三段路径是否都可以直线连接
                    const path1 = this.checkDirectPath(pos1, mid1);
                    const path2 = this.checkDirectPath(mid1, mid2);
                    const path3 = this.checkDirectPath(mid2, pos2);
                    
                    if (path1 && path2 && path3) {
                        // 可以通过两个拐点连接，返回路径
                        return [
                            this.grid[pos1.row][pos1.col].cell,
                            this.grid[mid1.row][mid1.col].cell,
                            this.grid[mid2.row][mid2.col].cell,
                            this.grid[pos2.row][pos2.col].cell
                        ];
                    }
                }
            }
        }
        
        // 不能双折线连接
        return null;
    }
    
    /**
     * 检查是否还有可以连接的对子
     */
    checkForPossibleMatches() {
        const cells = Array.from(this.boardElement.querySelectorAll('.cell:not(.matched):not(.obstacle)'));
        
        // 按照pokemonId分组
        const groupedCells = {};
        cells.forEach(cell => {
            const pokemonId = cell.dataset.pokemonId;
            if (!groupedCells[pokemonId]) {
                groupedCells[pokemonId] = [];
            }
            groupedCells[pokemonId].push(cell);
        });
        
        // 检查每组中的对子是否可以连接
        for (const pokemonId in groupedCells) {
            const cellsOfType = groupedCells[pokemonId];
            
            // 如果这种类型的元素少于2个，跳过
            if (cellsOfType.length < 2) continue;
            
            // 检查所有可能的对子
            for (let i = 0; i < cellsOfType.length - 1; i++) {
                for (let j = i + 1; j < cellsOfType.length; j++) {
                    const path = this.findPath(cellsOfType[i], cellsOfType[j]);
                    if (path) {
                        // 找到一对可以连接的对子
                        return {
                            cell1: cellsOfType[i],
                            cell2: cellsOfType[j],
                            path: path
                        };
                    }
                }
            }
        }
        
        // 没有找到可以连接的对子
        return null;
    }
    
    /**
     * 重新排列棋盘
     */
    shuffleBoard() {
        // 获取所有未匹配的格子
        const unmatchedCells = Array.from(this.boardElement.querySelectorAll('.cell:not(.matched):not(.obstacle)'));
        
        // 获取所有未匹配的元素ID
        const pokemonIds = unmatchedCells.map(cell => cell.dataset.pokemonId);
        
        // 打乱元素ID
        this.shuffleArray(pokemonIds);
        
        // 重新分配元素ID
        unmatchedCells.forEach((cell, index) => {
            cell.dataset.pokemonId = pokemonIds[index];
            
            // 更新元素图标
            const elementIcon = cell.querySelector('.element-icon');
            if (elementIcon) {
                elementIcon.className = `element-icon element-${pokemonIds[index]}`;
            }
        });
        
        // 重新初始化网格
        this.initGrid();
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