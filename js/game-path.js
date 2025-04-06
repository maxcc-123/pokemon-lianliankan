// 路径查找算法
class PathFinder {
    // 查找两个单元格之间的连接路径
    static findPath(board, cell1, cell2) {
        // 直接路径
        if (this.canConnectDirect(board, cell1, cell2)) {
            return [
                { row: cell1.row, col: cell1.col },
                { row: cell2.row, col: cell2.col }
            ];
        }
        
        // 一次拐弯
        const oneCornerPath = this.findOneCornerPath(board, cell1, cell2);
        if (oneCornerPath) {
            return oneCornerPath;
        }
        
        // 两次拐弯
        return this.findTwoCornerPath(board, cell1, cell2);
    }
    
    // 检查两点是否可以直接连接
    static canConnectDirect(board, cell1, cell2) {
        // 如果在同一行
        if (cell1.row === cell2.row) {
            const row = cell1.row;
            const startCol = Math.min(cell1.col, cell2.col);
            const endCol = Math.max(cell1.col, cell2.col);
            
            // 检查中间是否有障碍
            for (let col = startCol + 1; col < endCol; col++) {
                if (!board[row][col].matched) {
                    return false;
                }
            }
            
            return true;
        }
        
        // 如果在同一列
        if (cell1.col === cell2.col) {
            const col = cell1.col;
            const startRow = Math.min(cell1.row, cell2.row);
            const endRow = Math.max(cell1.row, cell2.row);
            
            // 检查中间是否有障碍
            for (let row = startRow + 1; row < endRow; row++) {
                if (!board[row][col].matched) {
                    return false;
                }
            }
            
            return true;
        }
        
        return false;
    }
    
    // 查找一次拐弯的路径
    static findOneCornerPath(board, cell1, cell2) {
        // 尝试通过拐角点连接
        const corner1 = { row: cell1.row, col: cell2.col };
        const corner2 = { row: cell2.row, col: cell1.col };
        
        // 检查拐角点是否为空或已匹配
        const isCorner1Empty = board[corner1.row][corner1.col].matched || 
                              (corner1.row === cell1.row && corner1.col === cell1.col) || 
                              (corner1.row === cell2.row && corner1.col === cell2.col);
                              
        const isCorner2Empty = board[corner2.row][corner2.col].matched || 
                              (corner2.row === cell1.row && corner2.col === cell1.col) || 
                              (corner2.row === cell2.row && corner2.col === cell2.col);
        
        // 检查路径是否通畅
        if (isCorner1Empty && 
            this.canConnectDirect(board, cell1, { row: corner1.row, col: corner1.col }) && 
            this.canConnectDirect(board, { row: corner1.row, col: corner1.col }, cell2)) {
            return [
                { row: cell1.row, col: cell1.col },
                { row: corner1.row, col: corner1.col },
                { row: cell2.row, col: cell2.col }
            ];
        }
        
        if (isCorner2Empty && 
            this.canConnectDirect(board, cell1, { row: corner2.row, col: corner2.col }) && 
            this.canConnectDirect(board, { row: corner2.row, col: corner2.col }, cell2)) {
            return [
                { row: cell1.row, col: cell1.col },
                { row: corner2.row, col: corner2.col },
                { row: cell2.row, col: cell2.col }
            ];
        }
        
        return null;
    }
    
    // 查找两次拐弯的路径
    static findTwoCornerPath(board, cell1, cell2) {
        const rows = board.length;
        const cols = board[0].length;
        
        // 尝试所有可能的中间点
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // 跳过非空点
                if (!board[row][col].matched && 
                    !(row === cell1.row && col === cell1.col) && 
                    !(row === cell2.row && col === cell2.col)) {
                    continue;
                }
                
                // 检查两个拐角是否都可以连接
                const corner1 = { row: cell1.row, col };
                const corner2 = { row, col: cell2.col };
                
                if (this.canConnectDirect(board, cell1, corner1) && 
                    this.canConnectDirect(board, corner1, { row, col }) && 
                    this.canConnectDirect(board, { row, col }, corner2) && 
                    this.canConnectDirect(board, corner2, cell2)) {
                    return [
                        { row: cell1.row, col: cell1.col },
                        { row: cell1.row, col },
                        { row, col },
                        { row, col: cell2.col },
                        { row: cell2.row, col: cell2.col }
                    ];
                }
                
                // 尝试另一种拐角组合
                const corner3 = { row, col: cell1.col };
                const corner4 = { row: cell2.row, col };
                
                if (this.canConnectDirect(board, cell1, corner3) && 
                    this.canConnectDirect(board, corner3, { row, col }) && 
                    this.canConnectDirect(board, { row, col }, corner4) && 
                    this.canConnectDirect(board, corner4, cell2)) {
                    return [
                        { row: cell1.row, col: cell1.col },
                        { row, col: cell1.col },
                        { row, col },
                        { row: cell2.row, col },
                        { row: cell2.row, col: cell2.col }
                    ];
                }
            }
        }
        
        return null;
    }
}

// 导出PathFinder类
if (typeof module !== 'undefined') {
    module.exports = { PathFinder };
}