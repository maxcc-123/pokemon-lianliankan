// 游戏事件处理
class GameEvents {
    constructor(gameCore, gameUI) {
        this.gameCore = gameCore;
        this.gameUI = gameUI;
        this.gameTimer = null;
        this.operationCheckTimer = null;
    }
    
    // 初始化事件
    init() {
        // 绑定单元格点击事件
        this.gameUI.boardElement.addEventListener('click', (e) => {
            const cellElement = e.target.closest('.cell');
            if (!cellElement) return;
            
            const row = parseInt(cellElement.dataset.row);
            const col = parseInt(cellElement.dataset.col);
            
            const result = this.gameCore.selectCell(row, col);
            this.gameUI.handleCellSelection(result);
        });
        
        // 绑定开始游戏按钮
        this.gameUI.startButton.addEventListener('click', () => {
            this.startGame();
        });
        
        // 绑定提示按钮
        this.gameUI.hintButton.addEventListener('click', () => {
            const hintPair = this.gameCore.useHint();
            this.gameUI.showHint(hintPair);
            this.gameUI.updateUI();
        });
        
        // 绑定洗牌按钮
        this.gameUI.shuffleButton.addEventListener('click', () => {
            if (this.gameCore.shuffleBoard()) {
                this.gameUI.renderBoard();
            }
        });
        
        // 绑定重置按钮
        this.gameUI.resetButton.addEventListener('click', () => {
            if (confirm('确定要重置游戏吗？')) {
                this.resetGame();
            }
        });
        
        // 绑定难度选择
        this.gameUI.difficultySelect.addEventListener('change', () => {
            if (!this.gameCore.gameStarted || confirm('更改难度将重新开始游戏，确定吗？')) {
                this.startGame();
            } else {
                // 恢复之前的选择
                this.gameUI.difficultySelect.value = this.gameCore.difficulty;
            }
        });
        
        // 绑定窗口大小变化事件
        window.addEventListener('resize', () => {
            this.gameUI.adjustCellSize();
            if (this.gameCore.gameStarted) {
                this.gameUI.renderBoard();
            }
        });
    }
    
    // 开始游戏
    startGame() {
        // 清除之前的定时器
        this.clearTimers();
        
        // 获取难度
        const difficulty = this.gameUI.difficultySelect.value;
        
        // 初始化游戏
        this.gameCore.startGame(difficulty);
        
        // 渲染游戏板
        this.gameUI.renderBoard();
        
        // 更新UI
        this.gameUI.updateUI();
        
        // 启动游戏定时器
        this.startTimers();
    }
    
    // 重置游戏
    resetGame() {
        // 清除定时器
        this.clearTimers();
        
        // 结束当前游戏
        this.gameCore.endGame();
        
        // 更新UI
        this.gameUI.updateUI();
    }
    
    // 启动定时器
    startTimers() {
        // 游戏计时器
        this.gameTimer = setInterval(() => {
            if (this.gameCore.timeLeft > 0) {
                this.gameCore.timeLeft--;
                this.gameUI.timerElement.textContent = this.gameCore.timeLeft;
                
                // 时间不多时改变颜色
                if (this.gameCore.timeLeft <= 30) {
                    this.gameUI.timerElement.style.color = 'red';
                }
            } else {
                // 时间用完，游戏结束
                this.gameUI.showGameLost('时间用完了！');
                this.clearTimers();
            }
        }, 1000);
        
        // 操作超时检查定时器
        this.operationCheckTimer = setInterval(() => {
            if (this.gameCore.checkOperationTimeout()) {
                this.gameUI.showGameLost('操作超时！30秒内未完成一次匹配。');
                this.clearTimers();
            }
        }, 1000);
    }
    
    // 清除定时器
    clearTimers() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.operationCheckTimer) {
            clearInterval(this.operationCheckTimer);
            this.operationCheckTimer = null;
        }
        
        // 重置计时器颜色
        if (this.gameUI.timerElement) {
            this.gameUI.timerElement.style.color = '';
        }
    }
}

// 导出GameEvents类
if (typeof module !== 'undefined') {
    module.exports = { GameEvents };
}