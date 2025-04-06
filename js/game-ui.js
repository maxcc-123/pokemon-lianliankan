// 游戏用户界面
class GameUI {
    constructor(gameCore) {
        this.gameCore = gameCore;
        this.boardElement = document.querySelector('.game-board');
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.hintsElement = document.getElementById('hints');
        this.difficultySelect = document.getElementById('difficulty-select');
        this.startButton = document.getElementById('start-game-btn');
        this.hintButton = document.getElementById('hint-btn');
        this.shuffleButton = document.getElementById('shuffle-btn');
        this.resetButton = document.getElementById('reset-btn');
        
        this.cellSize = 60; // 默认单元格大小
        this.hintTimeout = null;
        this.pathLines = [];
        this.resizeTimeout = null; // 添加resize事件的防抖定时器
        this.animationQueue = []; // 添加动画队列
        this.soundEnabled = true; // 声音开关
        this.comboCount = 0; // 连击计数
        this.lastMatchTime = 0; // 上次匹配时间
    }
    
    // 初始化UI
    init() {
        // 调整单元格大小
        this.adjustCellSize();
        
        // 绑定按钮事件
        this.bindEvents();
        
        // 添加窗口大小变化监听
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // 初始化音效
        this.initSounds();
        
        // 添加主题切换按钮
        this.addThemeToggle();
        
        // 添加声音开关
        this.addSoundToggle();
        
        // 添加进度条
        this.addProgressBar();
        
        // 添加连击显示
        this.addComboDisplay();
    }
    
    // 初始化音效
    initSounds() {
        this.sounds = {
            select: new Audio('./assets/sounds/select.mp3'),
            match: new Audio('./assets/sounds/match.mp3'),
            noMatch: new Audio('./assets/sounds/no-match.mp3'),
            hint: new Audio('./assets/sounds/hint.mp3'),
            shuffle: new Audio('./assets/sounds/shuffle.mp3'),
            win: new Audio('./assets/sounds/win.mp3'),
            lose: new Audio('./assets/sounds/lose.mp3'),
            bgm: new Audio('./assets/sounds/bgm.mp3'),
            combo: new Audio('./assets/sounds/combo.mp3')
        };
        
        // 设置背景音乐循环播放
        this.sounds.bgm.loop = true;
        this.sounds.bgm.volume = 0.3;
        
        // 错误处理
        for (const key in this.sounds) {
            this.sounds[key].onerror = () => {
                console.log(`音效 ${key} 加载失败`);
                // 禁用声音以避免错误
                this.soundEnabled = false;
            };
        }
    }
    
    // 播放音效
    playSound(soundName) {
        if (!this.soundEnabled) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('音效播放失败:', e));
        }
    }
    
    // 添加主题切换按钮
    addThemeToggle() {
        const themeToggle = document.createElement('button');
        themeToggle.id = 'theme-toggle';
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<i class="fas fa-palette"></i>';
        themeToggle.title = '切换主题';
        
        // 添加到控制区域
        const controlsContainer = this.startButton.parentElement;
        controlsContainer.appendChild(themeToggle);
        
        // 绑定事件
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            this.playSound('select');
            
            // 保存主题设置
            const isDarkTheme = document.body.classList.contains('dark-theme');
            localStorage.setItem('pokemon-theme', isDarkTheme ? 'dark' : 'light');
        });
        
        // 加载保存的主题设置
        const savedTheme = localStorage.getItem('pokemon-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }
    
    // 添加声音开关
    addSoundToggle() {
        const soundToggle = document.createElement('button');
        soundToggle.id = 'sound-toggle';
        soundToggle.className = 'sound-toggle';
        soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        soundToggle.title = '声音开关';
        
        // 添加到控制区域
        const controlsContainer = this.startButton.parentElement;
        controlsContainer.appendChild(soundToggle);
        
        // 绑定事件
        soundToggle.addEventListener('click', () => {
            this.soundEnabled = !this.soundEnabled;
            
            if (this.soundEnabled) {
                soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                this.sounds.bgm.play().catch(e => console.log('背景音乐播放失败:', e));
            } else {
                soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                this.sounds.bgm.pause();
            }
            
            // 保存声音设置
            localStorage.setItem('pokemon-sound', this.soundEnabled ? 'on' : 'off');
        });
        
        // 加载保存的声音设置
        const savedSound = localStorage.getItem('pokemon-sound');
        if (savedSound === 'off') {
            this.soundEnabled = false;
            soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    }
    
    // 添加进度条
    addProgressBar() {
        // 创建进度条容器
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.id = 'progress-bar';
        
        progressContainer.appendChild(progressBar);
        
        // 添加到游戏信息区域
        const gameInfo = document.querySelector('.game-info');
        if (gameInfo) {
            gameInfo.appendChild(progressContainer);
        }
    }
    
    // 添加连击显示
    addComboDisplay() {
        const comboDisplay = document.createElement('div');
        comboDisplay.id = 'combo-display';
        comboDisplay.className = 'combo-display';
        comboDisplay.style.display = 'none';
        comboDisplay.style.position = 'absolute';
        comboDisplay.style.top = '50%';
        comboDisplay.style.left = '50%';
        comboDisplay.style.transform = 'translate(-50%, -50%)';
        comboDisplay.style.fontSize = '36px';
        comboDisplay.style.fontWeight = 'bold';
        comboDisplay.style.color = '#e94560';
        comboDisplay.style.textShadow = '0 0 10px rgba(255,255,255,0.8)';
        comboDisplay.style.zIndex = '300';
        
        this.boardElement.appendChild(comboDisplay);
        this.comboDisplay = comboDisplay;
    }
    
    // 处理窗口大小变化
    handleResize() {
        // 使用防抖技术避免频繁调整
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = setTimeout(() => {
            this.adjustCellSize();
            this.renderBoard();
        }, 200);
    }
    
    // 根据屏幕大小调整单元格大小
    adjustCellSize() {
        const containerWidth = this.boardElement.parentElement.clientWidth;
        const containerHeight = window.innerHeight * 0.6; // 使用视口高度的60%作为最大高度
        
        // 根据屏幕方向自动选择布局
        const isPortrait = window.innerHeight > window.innerWidth;
        
        // 竖版布局：调整列数为较小值（通常为4-6列）
        const verticalCols = isPortrait ? Math.min(4, this.gameCore.cols) : Math.min(8, this.gameCore.cols);
        
        // 计算基于宽度的单元格大小
        const widthBasedSize = Math.floor((containerWidth - 20) / verticalCols);
        
        // 计算基于高度的单元格大小
        const heightBasedSize = Math.floor((containerHeight - 20) / Math.ceil(this.gameCore.rows * this.gameCore.cols / verticalCols));
        
        // 使用较小的值确保完全适应屏幕
        this.cellSize = Math.min(widthBasedSize, heightBasedSize);
        
        // 设置游戏板的最大宽度，确保居中显示
        const boardWidth = this.cellSize * verticalCols + (verticalCols - 1) * 8; // 8px是单元格间距
        this.boardElement.style.maxWidth = `${boardWidth}px`;
        this.boardElement.style.margin = '0 auto';
        
        // 保存布局的列数，供渲染使用
        this.verticalCols = verticalCols;
    }
    
    // 渲染游戏板
    renderBoard() {
        this.boardElement.innerHTML = '';
        // 设置列数
        this.boardElement.style.gridTemplateColumns = `repeat(${this.verticalCols}, 1fr)`;
        this.boardElement.style.gridGap = '8px'; // 确保间距一致
        
        // 重新添加连击显示
        this.addComboDisplay();
        
        // 创建所有单元格但先不显示
        const cellElements = [];
        
        for (let row = 0; row < this.gameCore.rows; row++) {
            for (let col = 0; col < this.gameCore.cols; col++) {
                const cell = this.gameCore.board[row][col];
                // 使用新的创建单元格方法
                const cellElement = this.createCellElement(row, col, cell.type);
                
                if (cell.matched) {
                    cellElement.classList.add('matched');
                }
                
                // 先隐藏单元格
                cellElement.style.opacity = '0';
                cellElement.style.transform = 'scale(0.5)';
                
                this.boardElement.appendChild(cellElement);
                cellElements.push(cellElement);
            }
        }
        
        // 使用动画依次显示单元格
        cellElements.forEach((cellElement, index) => {
            setTimeout(() => {
                cellElement.style.transition = 'all 0.3s ease';
                cellElement.style.opacity = '1';
                cellElement.style.transform = 'scale(1)';
            }, index * 20); // 每个单元格延迟20ms出现
        });
    }
    
    // 创建单元格元素
    createCellElement(row, col, pokemonType) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        // 设置单元格大小
        cell.style.width = `${this.cellSize}px`;
        cell.style.height = `${this.cellSize}px`;
        
        // 创建宝可梦图标容器（用于翻转动画）
        const iconContainer = document.createElement('div');
        iconContainer.className = 'icon-container';
        
        // 创建宝可梦图标
        const icon = document.createElement('img');
        icon.className = 'element-icon';
        
        // 检查是否使用在线图片
        if (window.usePokemonAPI) {
            // 使用PokeAPI的图片
            icon.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonType}.png`;
        } else {
            // 使用本地图片
            icon.src = `./assets/images/pokemon/${pokemonType}.png`;
        }
        
        // 添加错误处理
        icon.onerror = function() {
            // 如果图片加载失败，使用备用图片
            this.onerror = null;
            this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonType}.png`;
        };
        
        // 添加卡片背面
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.innerHTML = '<img src="./assets/images/pokeball.png" alt="Pokeball">';
        
        // 将图标和背面添加到容器
        iconContainer.appendChild(icon);
        iconContainer.appendChild(cardBack);
        cell.appendChild(iconContainer);
        
        // 添加点击波纹效果
        cell.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            this.appendChild(ripple);
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size/2}px`;
            ripple.style.top = `${e.clientY - rect.top - size/2}px`;
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        return cell;
    }
    
    // 更新UI状态
    updateUI() {
        // 更新分数
        this.scoreElement.textContent = this.gameCore.score;
        
        // 更新提示数量
        this.hintsElement.textContent = this.gameCore.hintsLeft;
        
        // 更新时间
        this.timerElement.textContent = this.gameCore.timeLeft;
        
        // 更新按钮状态
        this.hintButton.disabled = !this.gameCore.gameStarted || this.gameCore.hintsLeft <= 0;
        this.shuffleButton.disabled = !this.gameCore.gameStarted;
        this.startButton.textContent = this.gameCore.gameStarted ? '重新开始' : '开始游戏';
        
        // 更新进度条
        this.updateProgressBar();
    }
    
    // 更新进度条
    updateProgressBar() {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            const totalCells = this.gameCore.rows * this.gameCore.cols;
            const matchedCells = totalCells - this.gameCore.remainingPairs * 2;
            const progressPercent = (matchedCells / totalCells) * 100;
            
            progressBar.style.width = `${progressPercent}%`;
            
            // 根据进度更改颜色
            if (progressPercent < 30) {
                progressBar.style.backgroundColor = '#f6c23e'; // 黄色
            } else if (progressPercent < 70) {
                progressBar.style.backgroundColor = '#4e73df'; // 蓝色
            } else {
                progressBar.style.backgroundColor = '#1cc88a'; // 绿色
            }
        }
    }
    
    // 处理单元格选择
    handleCellSelection(result) {
        if (!result) return;
        
        switch (result.action) {
            case 'select':
                this.highlightCell(result.cell, 'selected');
                this.playSound('select');
                break;
                
            case 'deselect':
                this.unhighlightCell(result.cell, 'selected');
                this.playSound('select');
                break;
                
            case 'switch':
                this.unhighlightCell(result.previousCell, 'selected');
                this.highlightCell(result.newCell, 'selected');
                this.playSound('select');
                break;
                
            case 'match':
                // 检查连击
                const now = Date.now();
                if (now - this.lastMatchTime < 3000) { // 3秒内算连击
                    this.comboCount++;
                    if (this.comboCount >= 2) {
                        this.showCombo(this.comboCount);
                    }
                } else {
                    this.comboCount = 1;
                }
                this.lastMatchTime = now;
                
                // 播放匹配音效
                if (this.comboCount >= 3) {
                    this.playSound('combo');
                } else {
                    this.playSound('match');
                }
                
                // 显示连接路径
                this.showPath(result.path);
                
                // 标记匹配的单元格
                for (const cell of result.cells) {
                    this.markCellAsMatched(cell);
                }
                
                // 更新分数
                this.scoreElement.textContent = this.gameCore.score;
                
                // 更新进度条
                this.updateProgressBar();
                
                // 显示得分动画
                this.showScoreAnimation(result.score);
                
                // 检查游戏是否胜利
                if (result.gameWon) {
                    this.showGameWon();
                }
                break;
                
            case 'nomatch':
                // 播放不匹配音效
                this.playSound('noMatch');
                
                // 重置连击
                this.comboCount = 0;
                
                // 显示晃动动画
                for (const cell of result.cells) {
                    this.shakeCell(cell);
                }
                break;
        }
    }
    
    // 显示连击
    showCombo(count) {
        this.comboDisplay.textContent = `连击 x${count}!`;
        this.comboDisplay.style.display = 'block';
        this.comboDisplay.style.animation = 'none';
        
        // 触发重排
        this.comboDisplay.offsetHeight;
        
        // 添加动画
        this.comboDisplay.style.animation = 'combo-animation 1s forwards';
        
        // 设置动画
        if (!document.querySelector('#combo-animation-style')) {
            const style = document.createElement('style');
            style.id = 'combo-animation-style';
            style.textContent = `
                @keyframes combo-animation {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // 3秒后隐藏
        setTimeout(() => {
            this.comboDisplay.style.display = 'none';
        }, 1000);
    }
    
    // 显示得分动画
    showScoreAnimation(score) {
        if (!score) return;
        
        const scoreAnim = document.createElement('div');
        scoreAnim.className = 'score-animation';
        scoreAnim.textContent = `+${score}`;
        
        // 添加到游戏板
        this.boardElement.appendChild(scoreAnim);
        
        // 设置动画
        setTimeout(() => {
            scoreAnim.style.opacity = '0';
            scoreAnim.style.transform = 'translateY(-50px)';
        }, 10);
        
        // 移除元素
        setTimeout(() => {
            scoreAnim.remove();
        }, 1000);
    }
    
    // 晃动单元格
    shakeCell(cell) {
        const cellElement = this.getCellElement(cell.row, cell.col);
        if (cellElement) {
            cellElement.classList.add('shake');
            setTimeout(() => {
                cellElement.classList.remove('shake');
            }, 500);
        }
    }
    
    // 高亮单元格
    highlightCell(cell, className) {
        const cellElement = this.getCellElement(cell.row, cell.col);
        if (cellElement) {
            cellElement.classList.add(className);
            
            // 添加翻转动画
            const iconContainer = cellElement.querySelector('.icon-container');
            if (iconContainer) {
                iconContainer.classList.add('flipped');
            }
        }
    }
    
    // 取消高亮单元格
    unhighlightCell(cell, className) {
        const cellElement = this.getCellElement(cell.row, cell.col);
        if (cellElement) {
            cellElement.classList.remove(className);
            
            // 移除翻转动画
            const iconContainer = cellElement.querySelector('.icon-container');
            if (iconContainer) {
                iconContainer.classList.remove('flipped');
            }
        }
    }
    
    // 标记单元格为已匹配
    markCellAsMatched(cell) {
        const cellElement = this.getCellElement(cell.row, cell.col);
        if (cellElement) {
            cellElement.classList.add('matched');
            cellElement.classList.remove('selected');
            
            // 添加动画效果，使匹配的单元格逐渐消失
            const iconContainer = cellElement.querySelector('.icon-container');
            if (iconContainer) {
                iconContainer.style.transition = 'all 0.5s';
                iconContainer.style.opacity = '0';
                iconContainer.style.transform = 'scale(0.1) rotate(360deg)';
            }
        }
    }
    
    // 获取单元格元素
    getCellElement(row, col) {
        return this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }
    
    // 显示连接路径
    showPath(path) {
        if (!path || path.length < 2) return;
        
        // 清除之前的路径
        this.clearPath();
        
        // 创建SVG覆盖层
        const overlay = document.createElement('div');
        overlay.className = 'path-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '100';
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        
        overlay.appendChild(svg);
        this.boardElement.appendChild(overlay);
        
        // 绘制路径
        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            
            const startCell = this.getCellElement(start.row, start.col);
            const endCell = this.getCellElement(end.row, end.col);
            
            if (!startCell || !endCell) continue;
            
            const startRect = startCell.getBoundingClientRect();
            const endRect = endCell.getBoundingClientRect();
            const boardRect = this.boardElement.getBoundingClientRect();
            
            const startX = startRect.left + startRect.width / 2 - boardRect.left;
            const startY = startRect.top + startRect.height / 2 - boardRect.top;
            const endX = endRect.left + endRect.width / 2 - boardRect.left;
            const endY = endRect.top + endRect.height / 2 - boardRect.top;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', startX);
            line.setAttribute('y1', startY);
            line.setAttribute('x2', endX);
            line.setAttribute('y2', endY);
            line.setAttribute('stroke', '#4e73df');
            line.setAttribute('stroke-width', '3');
            line.setAttribute('stroke-linecap', 'round');
            
            // 添加动画效果
            line.style.strokeDasharray = '10';
            line.style.animation = 'dash 0.5s linear';
            
            svg.appendChild(line);
            this.pathLines.push(line);
        }
        
        // 设置定时器清除路径
        setTimeout(() => this.clearPath(), 500);
    }
    
    // 清除连接路径
    clearPath() {
        const overlay = this.boardElement.querySelector('.path-overlay');
        if (overlay) {
            overlay.remove();
        }
        this.pathLines = [];
    }
    
    // 显示提示
    showHint(hintPair) {
        if (!hintPair) return;
        
        // 清除之前的提示
        this.clearHint();
        
        // 播放提示音效
        this.playSound('hint');
        
        // 高亮提示的单元格
        this.highlightCell(hintPair.cell1, 'hint');
        this.highlightCell(hintPair.cell2, 'hint');
        
        // 设置定时器清除提示
        this.hintTimeout = setTimeout(() => this.clearHint(), 2000);
    }
    
    // 清除提示
    clearHint() {
        if (this.hintTimeout) {
            clearTimeout(this.hintTimeout);
            this.hintTimeout = null;
        }
        
        const hintCells = this.boardElement.querySelectorAll('.hint');
        hintCells.forEach(cell => {
            cell.classList.remove('hint');
            
            // 移除翻转动画
            const iconContainer = cell.querySelector('.icon-container');
            if (iconContainer) {
                iconContainer.classList.remove('flipped');
            }
        });
    }
    
    // 显示游戏胜利
    showGameWon() {
        // 播放胜利音效
        this.playSound('win');
        
        setTimeout(() => {
            // 创建胜利弹窗
            const modal = document.createElement('div');
            modal.className = 'game-modal win-modal';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            modalContent.innerHTML = `
                <h2>恭喜你赢了！</h2>
                <div class="win-stars">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                </div>
                <p>你的得分: <span class="final-score">${this.gameCore.score}</span></p>
                <button class="play-again-btn">再玩一次</button>
                <button class="share-btn">分享成绩</button>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // 添加动画
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
            
            // 绑定按钮事件
            const playAgainBtn = modal.querySelector('.play-again-btn');
            playAgainBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                    this.gameCore.startGame();
                }, 300);
            });
            
            const shareBtn = modal.querySelector('.share-btn');
            shareBtn.addEventListener('click', () => {
                this.shareScore(this.gameCore.score);
            });
            
            this.gameCore.endGame();
            this.updateUI();
        }, 500);
    }
    
    // 分享成绩
    shareScore(score) {
        const text = `我在宠物小精灵连连看游戏中获得了${score}分！来挑战我吧！`;
        
        // 检查是否支持分享API
        if (navigator.share) {
            navigator.share({
                title: '宠物小精灵连连看',
                text: text,
                url: window.location.href
            }).catch(err => {
                console.log('分享失败:', err);
                this.copyToClipboard(text);
            });
        } else {
            this.copyToClipboard(text);
        }
    }
    
    // 复制到剪贴板
    copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        alert('成绩已复制到剪贴板，可以粘贴分享给好友！');
    }
    
    // 显示游戏失败
    showGameLost(reason) {
        // 播放失败音效
        this.playSound('lose');
        
        // 创建失败弹窗
        const modal = document.createElement('div');
        modal.className = 'game-modal lose-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        modalContent.innerHTML = `
            <h2>游戏结束</h2>
            <p>${reason}</p>
            <p>你的得分: <span class="final-score">${this.gameCore.score}</span></p>
            <button class="play-again-btn">再玩一次</button>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // 添加动画
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // 绑定按钮事件
        const playAgainBtn = modal.querySelector('.play-again-btn');
        playAgainBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                this.gameCore.startGame();
            }, 300);
        });
        
        this.gameCore.endGame();
        this.updateUI();
    }
    
    // 显示洗牌动画
    showShuffleAnimation() {
        // 播放洗牌音效
        this.playSound('shuffle');
        
        // 获取所有未匹配的单元格
        const cells = Array.from(this.boardElement.querySelectorAll('.cell:not(.matched)'));
        
        // 添加洗牌动画类
        cells.forEach(cell => {
            cell.classList.add('shuffling');
            
            // 随机位置
            const randomX = Math.random() * 40 - 20; // -20px 到 20px
            const randomY = Math.random() * 40 - 20; // -20px 到 20px
            const randomRotate = Math.random() * 180 - 90; // -90deg 到 90deg
            
            cell.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
        });
        
        // 动画结束后恢复位置并重新渲染
        setTimeout(() => {
            cells.forEach(cell => {
                cell.classList.remove('shuffling');
                cell.style.transform = '';
            });
            
            // 重新渲染游戏板
            setTimeout(() => {
                this.renderBoard();
            }, 300);
        }, 500);
    }
    
    // 显示游戏结束倒计时
    showEndingCountdown(seconds) {
        if (seconds <= 10) { // 只在最后10秒显示倒计时
            // 创建或更新倒计时元素
            let countdownElement = document.getElementById('ending-countdown');
            if (!countdownElement) {
                countdownElement = document.createElement('div');
                countdownElement.id = 'ending-countdown';
                countdownElement.className = 'ending-countdown';
                document.body.appendChild(countdownElement);
            }
            
            // 更新倒计时内容
            countdownElement.textContent = seconds;
            
            // 添加动画效果
            countdownElement.classList.remove('pulse');
            void countdownElement.offsetWidth; // 触发重排
            countdownElement.classList.add('pulse');
            
            // 根据剩余时间改变颜色
            if (seconds <= 3) {
                countdownElement.style.color = '#e74a3b'; // 红色
            } else if (seconds <= 5) {
                countdownElement.style.color = '#f6c23e'; // 黄色
            } else {
                countdownElement.style.color = '#4e73df'; // 蓝色
            }
            
            // 播放倒计时音效
            if (seconds <= 5) {
                this.playSound('select');
            }
        } else {
            // 移除倒计时元素
            const countdownElement = document.getElementById('ending-countdown');
            if (countdownElement) {
                countdownElement.remove();
            }
        }
    }
    
    // 添加成就系统
    addAchievementSystem() {
        // 创建成就容器
        const achievementsContainer = document.createElement('div');
        achievementsContainer.className = 'achievements-container';
        achievementsContainer.style.display = 'none';
        
        // 添加成就标题
        const achievementsTitle = document.createElement('h3');
        achievementsTitle.textContent = '成就';
        achievementsContainer.appendChild(achievementsTitle);
        
        // 添加成就列表
        const achievementsList = document.createElement('ul');
        achievementsList.className = 'achievements-list';
        
        // 定义成就
        const achievements = [
            { id: 'first_win', name: '初次胜利', description: '完成第一场游戏', icon: '🏆' },
            { id: 'speed_demon', name: '闪电速度', description: '在60秒内完成一场游戏', icon: '⚡' },
            { id: 'combo_master', name: '连击大师', description: '达成5连击', icon: '🔥' },
            { id: 'perfect_game', name: '完美游戏', description: '不使用提示完成游戏', icon: '✨' },
            { id: 'pokemon_fan', name: '宝可梦迷', description: '累计匹配100对宝可梦', icon: '❤️' }
        ];
        
        // 从本地存储加载已解锁的成就
        const unlockedAchievements = JSON.parse(localStorage.getItem('pokemon-achievements') || '[]');
        
        // 创建成就元素
        achievements.forEach(achievement => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            
            const achievementItem = document.createElement('li');
            achievementItem.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            achievementItem.dataset.id = achievement.id;
            
            achievementItem.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
                <div class="achievement-status">${isUnlocked ? '已解锁' : '未解锁'}</div>
            `;
            
            achievementsList.appendChild(achievementItem);
        });
        
        achievementsContainer.appendChild(achievementsList);
        
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'close-achievements-btn';
        closeButton.textContent = '关闭';
        closeButton.addEventListener('click', () => {
            achievementsContainer.style.display = 'none';
        });
        
        achievementsContainer.appendChild(closeButton);
        
        // 添加到文档
        document.body.appendChild(achievementsContainer);
        
        // 添加成就按钮到控制区域
        const achievementsButton = document.createElement('button');
        achievementsButton.id = 'achievements-btn';
        achievementsButton.className = 'achievements-btn';
        achievementsButton.innerHTML = '<i class="fas fa-trophy"></i>';
        achievementsButton.title = '成就';
        
        // 添加到控制区域
        const controlsContainer = this.startButton.parentElement;
        controlsContainer.appendChild(achievementsButton);
        
        // 绑定事件
        achievementsButton.addEventListener('click', () => {
            achievementsContainer.style.display = 'block';
            this.playSound('select');
        });
        
        // 保存成就容器引用
        this.achievementsContainer = achievementsContainer;
    }
    
    // 解锁成就
    unlockAchievement(achievementId) {
        // 从本地存储加载已解锁的成就
        const unlockedAchievements = JSON.parse(localStorage.getItem('pokemon-achievements') || '[]');
        
        // 检查成就是否已解锁
        if (unlockedAchievements.includes(achievementId)) {
            return;
        }
        
        // 添加新解锁的成就
        unlockedAchievements.push(achievementId);
        
        // 保存到本地存储
        localStorage.setItem('pokemon-achievements', JSON.stringify(unlockedAchievements));
        
        // 更新UI
        const achievementItem = this.achievementsContainer.querySelector(`.achievement-item[data-id="${achievementId}"]`);
        if (achievementItem) {
            achievementItem.classList.remove('locked');
            achievementItem.classList.add('unlocked');
            achievementItem.querySelector('.achievement-status').textContent = '已解锁';
        }
        
        // 显示成就通知
        this.showAchievementNotification(achievementId);
    }
    
    // 显示成就通知
    showAchievementNotification(achievementId) {
        // 获取成就信息
        const achievements = [
            { id: 'first_win', name: '初次胜利', description: '完成第一场游戏', icon: '🏆' },
            { id: 'speed_demon', name: '闪电速度', description: '在60秒内完成一场游戏', icon: '⚡' },
            { id: 'combo_master', name: '连击大师', description: '达成5连击', icon: '🔥' },
            { id: 'perfect_game', name: '完美游戏', description: '不使用提示完成游戏', icon: '✨' },
            { id: 'pokemon_fan', name: '宝可梦迷', description: '累计匹配100对宝可梦', icon: '❤️' }
        ];
        
        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement) return;
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-icon">${achievement.icon}</div>
            <div class="achievement-notification-content">
                <div class="achievement-notification-title">成就解锁！</div>
                <div class="achievement-notification-name">${achievement.name}</div>
                <div class="achievement-notification-description">${achievement.description}</div>
            </div>
        `;
        
        // 添加到文档
        document.body.appendChild(notification);
        
        // 播放成就解锁音效
        this.playSound('win');
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // 5秒后隐藏通知
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }
    
    // 添加排行榜系统
    addLeaderboardSystem() {
        // 创建排行榜容器
        const leaderboardContainer = document.createElement('div');
        leaderboardContainer.className = 'leaderboard-container';
        leaderboardContainer.style.display = 'none';
        
        // 添加排行榜标题
        const leaderboardTitle = document.createElement('h3');
        leaderboardTitle.textContent = '排行榜';
        leaderboardContainer.appendChild(leaderboardTitle);
        
        // 添加难度选择
        const difficultySelector = document.createElement('div');
        difficultySelector.className = 'leaderboard-difficulty-selector';
        
        ['简单', '中等', '困难'].forEach((difficulty, index) => {
            const button = document.createElement('button');
            button.className = 'leaderboard-difficulty-btn';
            button.textContent = difficulty;
            button.dataset.difficulty = index;
            
            if (index === 0) {
                button.classList.add('active');
            }
            
            button.addEventListener('click', () => {
                // 移除所有按钮的active类
                difficultySelector.querySelectorAll('.leaderboard-difficulty-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // 添加active类到当前按钮
                button.classList.add('active');
                
                // 更新排行榜
                this.updateLeaderboard(index);
            });
            
            difficultySelector.appendChild(button);
        });
        
        leaderboardContainer.appendChild(difficultySelector);
        
        // 添加排行榜表格
        const leaderboardTable = document.createElement('table');
        leaderboardTable.className = 'leaderboard-table';
        
        // 添加表头
        const tableHeader = document.createElement('thead');
        tableHeader.innerHTML = `
            <tr>
                <th>排名</th>
                <th>玩家</th>
                <th>分数</th>
                <th>时间</th>
                <th>日期</th>
            </tr>
        `;
        leaderboardTable.appendChild(tableHeader);
        
        // 添加表体
        const tableBody = document.createElement('tbody');
        tableBody.id = 'leaderboard-body';
        leaderboardTable.appendChild(tableBody);
        
        leaderboardContainer.appendChild(leaderboardTable);
        
        // 添加玩家名称输入
        const playerNameInput = document.createElement('div');
        playerNameInput.className = 'player-name-input';
        playerNameInput.innerHTML = `
            <label for="player-name">你的名字:</label>
            <input type="text" id="player-name" maxlength="10" placeholder="输入你的名字">
            <button id="save-player-name">保存</button>
        `;
        
        leaderboardContainer.appendChild(playerNameInput);
        
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'close-leaderboard-btn';
        closeButton.textContent = '关闭';
        closeButton.addEventListener('click', () => {
            leaderboardContainer.style.display = 'none';
        });
        
        leaderboardContainer.appendChild(closeButton);
        
        // 添加到文档
        document.body.appendChild(leaderboardContainer);
        
        // 添加排行榜按钮到控制区域
        const leaderboardButton = document.createElement('button');
        leaderboardButton.id = 'leaderboard-btn';
        leaderboardButton.className = 'leaderboard-btn';
        leaderboardButton.innerHTML = '<i class="fas fa-crown"></i>';
        leaderboardButton.title = '排行榜';
        
        // 添加到控制区域
        const controlsContainer = this.startButton.parentElement;
        controlsContainer.appendChild(leaderboardButton);
        
        // 绑定事件
        leaderboardButton.addEventListener('click', () => {
            leaderboardContainer.style.display = 'block';
            this.playSound('select');
            
            // 更新排行榜
            const activeDifficulty = parseInt(difficultySelector.querySelector('.active').dataset.difficulty);
            this.updateLeaderboard(activeDifficulty);
        });
        
        // 绑定保存玩家名称事件
        const saveNameButton = document.getElementById('save-player-name');
        saveNameButton.addEventListener('click', () => {
            const playerName = document.getElementById('player-name').value.trim();
            if (playerName) {
                localStorage.setItem('pokemon-player-name', playerName);
                alert(`玩家名称已保存为: ${playerName}`);
            } else {
                alert('请输入有效的玩家名称');
            }
        });
        
        // 加载保存的玩家名称
        const savedPlayerName = localStorage.getItem('pokemon-player-name');
        if (savedPlayerName) {
            document.getElementById('player-name').value = savedPlayerName;
        }
        
        // 保存排行榜容器引用
        this.leaderboardContainer = leaderboardContainer;
        
        // 初始化排行榜
        this.updateLeaderboard(0);
    }
    
    // 更新排行榜
    updateLeaderboard(difficulty) {
        const tableBody = document.getElementById('leaderboard-body');
        if (!tableBody) return;
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 从本地存储加载排行榜数据
        const leaderboardKey = `pokemon-leaderboard-${difficulty}`;
        const leaderboardData = JSON.parse(localStorage.getItem(leaderboardKey) || '[]');
        
        // 如果没有数据，显示提示
        if (leaderboardData.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="5" class="empty-leaderboard">暂无记录</td>';
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // 排序数据（按分数降序，时间升序）
        leaderboardData.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.timeUsed - b.timeUsed;
        });
        
        // 限制显示前10名
        const topEntries = leaderboardData.slice(0, 10);
        
        // 添加数据到表格
        topEntries.forEach((entry, index) => {
            const row = document.createElement('tr');
            
            // 添加排名标记
            let rankClass = '';
            if (index === 0) rankClass = 'rank-first';
            else if (index === 1) rankClass = 'rank-second';
            else if (index === 2) rankClass = 'rank-third';
            
            row.innerHTML = `
                <td class="${rankClass}">${index + 1}</td>
                <td>${entry.playerName || '匿名'}</td>
                <td>${entry.score}</td>
                <td>${this.formatTime(entry.timeUsed)}</td>
                <td>${new Date(entry.date).toLocaleDateString()}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    // 格式化时间（秒转为分:秒）
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    // 添加分数到排行榜
    addScoreToLeaderboard(score, timeUsed) {
        // 获取当前难度
        const difficulty = this.gameCore.difficulty;
        
        // 获取玩家名称
        const playerName = localStorage.getItem('pokemon-player-name') || '匿名';
        
        // 创建新记录
        const newEntry = {
            playerName,
            score,
            timeUsed,
            date: Date.now()
        };
        
        // 从本地存储加载排行榜数据
        const leaderboardKey = `pokemon-leaderboard-${difficulty}`;
        const leaderboardData = JSON.parse(localStorage.getItem(leaderboardKey) || '[]');
        
        // 添加新记录
        leaderboardData.push(newEntry);
        
        // 排序数据（按分数降序，时间升序）
        leaderboardData.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.timeUsed - b.timeUsed;
        });
        
        // 限制最多保存50条记录
        const limitedData = leaderboardData.slice(0, 50);
        
        // 保存到本地存储
        localStorage.setItem(leaderboardKey, JSON.stringify(limitedData));
        
        // 检查是否进入前三名
        const rank = limitedData.findIndex(entry => 
            entry.playerName === newEntry.playerName && 
            entry.score === newEntry.score && 
            entry.timeUsed === newEntry.timeUsed
        );
        
        return rank < 3 ? rank + 1 : 0;
    }
    
    // 绑定事件
    bindEvents() {
        // 这个方法将在game-events.js中实现
    }
}

// 导出GameUI类
if (typeof module !== 'undefined') {
    module.exports = { GameUI };
}
