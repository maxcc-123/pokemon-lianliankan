// 游戏初始化和事件绑定
// 在游戏初始化脚本中修改按钮ID引用
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化游戏...');
    
    // 获取DOM元素 - 修改这里以匹配HTML中的ID
    const startGameBtn = document.getElementById('start-game-btn');
    const difficultySelect = document.getElementById('difficulty-select');
    const gameContainer = document.querySelector('.game-container');
    
    // 绑定开始游戏按钮事件
    if (startGameBtn) {
        console.log('找到开始游戏按钮，绑定点击事件');
        
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
        
        // 创建游戏区域
        if (!document.querySelector('.game-board-container')) {
            const boardContainer = document.createElement('div');
            boardContainer.className = 'game-board-container';
            
            const board = document.createElement('div');
            board.className = 'game-board';
            
            boardContainer.appendChild(board);
            gameContainer.appendChild(boardContainer);
        }
        
        // 获取游戏面板
        const gameBoard = document.querySelector('.game-board');
        
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
        
        // 创建宠物ID数组
        const totalCells = rows * cols;
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
        shuffleArray(pokemonIds);
        
        // 设置网格列数
        gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        
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
            
            // 创建宠物图标 - 完全重写这部分
            const elementIcon = document.createElement('div');
            elementIcon.className = `element-icon element-${pokemonIds[i]}`;
            
            // 直接设置背景图片，不使用CSS类
            const imgPath = `assets/images/pokemon/${pokemonIds[i]}.png`;
            elementIcon.style.backgroundImage = `url('${imgPath}')`;
            elementIcon.style.backgroundSize = 'contain';
            elementIcon.style.backgroundPosition = 'center';
            elementIcon.style.backgroundRepeat = 'no-repeat';
            elementIcon.style.width = '80%';
            elementIcon.style.height = '80%';
            
            // 确保没有文本内容
            elementIcon.textContent = '';
            
            // 设置备用背景色，但不显示数字
            const colors = [
                '#ff9999', '#99ff99', '#9999ff', '#ffff99', 
                '#ff99ff', '#99ffff', '#ffcc99', '#cc99ff',
                '#99ffcc', '#ff9966', '#66ff99', '#9966ff', 
                '#ffff66', '#ff66ff', '#66ffff', '#ffcc66'
            ];
            elementIcon.style.backgroundColor = colors[(pokemonIds[i] - 1) % colors.length];
            elementIcon.style.borderRadius = '8px';
            
            cell.appendChild(elementIcon);
            
            // 添加点击事件
            cell.addEventListener('click', handleCellClick);
            
            // 添加到游戏面板
            gameBoard.appendChild(cell);
        }
        
        // 更新游戏状态
        gameContainer.classList.add('game-started');
        
        // 开始计时
        startTimer(timeLimit);
    }
    
    // 处理格子点击事件
    function handleCellClick(event) {
        const cell = event.currentTarget;
        
        // 如果已经匹配或已经选中，则忽略
        if (cell.classList.contains('matched') || cell.classList.contains('selected')) {
            return;
        }
        
        // 添加选中状态
        cell.classList.add('selected');
        
        // 获取所有选中的格子
        const selectedCells = document.querySelectorAll('.cell.selected:not(.matched)');
        
        // 如果选中了两个格子，检查是否匹配
        if (selectedCells.length === 2) {
            const [cell1, cell2] = selectedCells;
            
            // 检查是否是相同的宠物
            if (cell1.dataset.pokemonId === cell2.dataset.pokemonId) {
                // 匹配成功
                setTimeout(() => {
                    cell1.classList.add('matched');
                    cell2.classList.add('matched');
                    
                    // 清除选中状态
                    cell1.classList.remove('selected');
                    cell2.classList.remove('selected');
                    
                    // 检查游戏是否结束
                    checkGameEnd();
                }, 500);
            } else {
                // 不匹配
                setTimeout(() => {
                    cell1.classList.remove('selected');
                    cell2.classList.remove('selected');
                }, 500);
            }
        }
    }
    
    // 检查游戏是否结束
    function checkGameEnd() {
        const unmatchedCells = document.querySelectorAll('.cell:not(.matched)');
        
        if (unmatchedCells.length === 0) {
            alert('恭喜你，游戏胜利！');
            clearInterval(timerInterval);
        }
    }
    
    // 开始计时器
    let timerInterval = null;
    function startTimer(timeLimit) {
        // 清除之前的计时器
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // 获取计时器元素
        const timerElement = document.getElementById('timer');
        if (!timerElement) return;
        
        // 设置初始时间
        let timeLeft = timeLimit;
        timerElement.textContent = timeLeft;
        
        // 开始计时
        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            
            // 检查时间是否用完
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert('游戏结束，时间用完了！');
            }
        }, 1000);
    }
    
    // 打乱数组
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    // 创建游戏核心实例
    const gameCore = new GameCore();
    
    // 创建游戏UI实例
    const gameUI = new GameUI(gameCore);
    
    // 创建游戏事件处理实例
    const gameEvents = new GameEvents(gameCore, gameUI);
    
    // 初始化UI
    gameUI.init();
    
    // 初始化事件
    gameEvents.init();
    
    // 更新UI初始状态
    gameUI.updateUI();
    
    // 添加成就系统
    initAchievements(gameCore);
});

// 初始化成就系统
function initAchievements(gameCore) {
    // 成就列表
    const achievements = {
        firstGame: {
            id: 'first-game',
            title: '初次尝试',
            description: '完成第一局游戏',
            unlocked: false
        },
        comboMaster: {
            id: 'combo-master',
            title: '连击大师',
            description: '连续匹配5对宠物',
            unlocked: false
        },
        speedRun: {
            id: 'speed-run',
            title: '闪电速度',
            description: '30秒内完成一局',
            unlocked: false
        }
    };
    
    // 从本地存储加载成就
    loadAchievements();
    
    // 更新成就显示
    updateAchievementsUI();
    
    // 监听游戏事件以解锁成就
    document.addEventListener('game-end', (e) => {
        const gameResult = e.detail;
        
        // 初次尝试成就
        if (!achievements.firstGame.unlocked) {
            achievements.firstGame.unlocked = true;
            showAchievementNotification(achievements.firstGame);
        }
        
        // 闪电速度成就
        if (!achievements.speedRun.unlocked && gameResult.timeUsed <= 30) {
            achievements.speedRun.unlocked = true;
            showAchievementNotification(achievements.speedRun);
        }
        
        // 保存成就
        saveAchievements();
        
        // 更新成就显示
        updateAchievementsUI();
    });
    
    document.addEventListener('combo-achieved', (e) => {
        const comboCount = e.detail.count;
        
        // 连击大师成就
        if (!achievements.comboMaster.unlocked && comboCount >= 5) {
            achievements.comboMaster.unlocked = true;
            showAchievementNotification(achievements.comboMaster);
            
            // 保存成就
            saveAchievements();
            
            // 更新成就显示
            updateAchievementsUI();
        }
    });
    
    // 从本地存储加载成就
    function loadAchievements() {
        const savedAchievements = localStorage.getItem('pokemon-achievements');
        if (savedAchievements) {
            const parsed = JSON.parse(savedAchievements);
            for (const key in parsed) {
                if (achievements[key]) {
                    achievements[key].unlocked = parsed[key].unlocked;
                }
            }
        }
    }
    
    // 保存成就到本地存储
    function saveAchievements() {
        localStorage.setItem('pokemon-achievements', JSON.stringify(achievements));
    }
    
    // 更新成就UI
    function updateAchievementsUI() {
        const achievementsList = document.querySelector('.achievements ul');
        if (!achievementsList) return;
        
        achievementsList.innerHTML = '';
        
        for (const key in achievements) {
            const achievement = achievements[key];
            const li = document.createElement('li');
            li.textContent = `${achievement.title} - ${achievement.description}`;
            
            if (achievement.unlocked) {
                li.classList.add('unlocked');
                li.innerHTML = `✅ ${li.innerHTML}`;
            }
            
            achievementsList.appendChild(li);
        }
    }
    
    // 显示成就解锁通知
    function showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <h3>成就解锁！</h3>
                <p>${achievement.title} - ${achievement.description}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 添加CSS
        const style = document.createElement('style');
        style.textContent = `
            .achievement-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #4e73df;
                color: white;
                padding: 15px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                z-index: 1000;
                animation: slide-in 0.5s ease-out, fade-out 0.5s ease-in 4.5s forwards;
            }
            
            .achievement-icon {
                font-size: 30px;
                margin-right: 15px;
            }
            
            .achievement-content h3 {
                margin: 0 0 5px 0;
            }
            
            .achievement-content p {
                margin: 0;
            }
            
            @keyframes slide-in {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes fade-out {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            .achievements .unlocked {
                color: #4e73df;
                font-weight: bold;
            }
        `;
        
        document.head.appendChild(style);
        
        // 5秒后移除通知
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}