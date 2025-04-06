/**
 * 游戏视觉效果增强脚本
 * 提供丰富的视觉效果和动画
 */
class VisualEffects {
    constructor() {
        this.colors = [
            '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', 
            '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', 
            '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', 
            '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'
        ];
        this.init();
    }
    
    /**
     * 初始化视觉效果
     */
    init() {
        // 添加按钮波纹效果
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', this.createRipple.bind(this));
        });
        
        // 监听计时器变化
        this.setupTimerWarning();
    }
    
    /**
     * 设置计时器警告效果
     */
    setupTimerWarning() {
        const timerElement = document.getElementById('timer');
        if (!timerElement) return;
        
        // 创建一个观察器来监视计时器的变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'characterData' || mutation.type === 'childList') {
                    const time = parseInt(timerElement.textContent);
                    if (time <= 30) {
                        timerElement.classList.add('timer-warning');
                    } else {
                        timerElement.classList.remove('timer-warning');
                    }
                }
            });
        });
        
        // 配置观察器
        observer.observe(timerElement, { 
            characterData: true, 
            childList: true,
            subtree: true
        });
    }
    
    /**
     * 创建按钮点击波纹效果
     * @param {Event} event - 点击事件
     */
    createRipple(event) {
        const button = event.currentTarget;
        
        // 创建波纹元素
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        // 计算波纹位置
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        // 设置波纹样式
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        // 添加到按钮
        button.appendChild(ripple);
        
        // 动画结束后移除波纹
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    /**
     * 创建卡片匹配粒子效果
     * @param {HTMLElement} cell - 卡片元素
     */
    createMatchParticles(cell) {
        const rect = cell.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 创建多个粒子
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // 随机颜色
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            
            // 随机大小
            const size = 3 + Math.random() * 5;
            
            // 随机方向
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 80;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            // 设置粒子样式
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.backgroundColor = color;
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.animation = `particle-explosion 0.8s forwards`;
            
            document.body.appendChild(particle);
            
            // 动画结束后移除粒子
            setTimeout(() => {
                particle.remove();
            }, 800);
        }
    }
    
    /**
     * 创建胜利彩带效果
     */
    createVictoryRibbons() {
        // 创建多个彩带
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const ribbon = document.createElement('div');
                ribbon.className = 'ribbon';
                
                // 随机位置和颜色
                const x = Math.random() * window.innerWidth;
                const color = this.colors[Math.floor(Math.random() * this.colors.length)];
                const delay = Math.random() * 2;
                
                ribbon.style.left = `${x}px`;
                ribbon.style.backgroundColor = color;
                ribbon.style.animationDelay = `${delay}s`;
                
                document.body.appendChild(ribbon);
                
                // 动画结束后移除彩带
                setTimeout(() => {
                    ribbon.remove();
                }, 4000 + delay * 1000);
            }, i * 100);
        }
    }
    
    /**
     * 创建成就解锁星星效果
     * @param {HTMLElement} element - 成就元素
     */
    createAchievementStars(element) {
        const rect = element.getBoundingClientRect();
        
        // 创建多个星星
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const star = document.createElement('div');
                star.className = 'achievement-star';
                
                // 随机位置
                const x = rect.left + Math.random() * rect.width;
                const y = rect.top + Math.random() * rect.height;
                
                // 随机大小
                const size = 5 + Math.random() * 10;
                
                star.style.left = `${x}px`;
                star.style.top = `${y}px`;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                
                document.body.appendChild(star);
                
                // 动画结束后移除星星
                setTimeout(() => {
                    star.remove();
                }, 1000);
            }, i * 100);
        }
    }
    
    /**
     * 创建游戏结束震动效果
     * @param {HTMLElement} element - 需要震动的元素
     */
    createShakeEffect(element) {
        element.classList.add('shake');
        
        // 震动结束后移除类
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
    
    /**
     * 创建连击效果
     * @param {number} combo - 连击数
     * @param {HTMLElement} gameBoard - 游戏板元素
     */
    createComboEffect(combo, gameBoard) {
        if (combo < 2) return;
        
        const comboDisplay = document.createElement('div');
        comboDisplay.className = 'combo-display';
        comboDisplay.textContent = `${combo} 连击!`;
        
        // 根据连击数调整样式
        if (combo >= 5) {
            comboDisplay.style.fontSize = '60px';
            comboDisplay.style.color = '#FF5252';
        } else if (combo >= 3) {
            comboDisplay.style.fontSize = '52px';
            comboDisplay.style.color = '#FFD740';
        }
        
        // 设置位置
        const rect = gameBoard.getBoundingClientRect();
        comboDisplay.style.position = 'absolute';
        comboDisplay.style.left = '50%';
        comboDisplay.style.top = '50%';
        comboDisplay.style.transform = 'translate(-50%, -50%)';
        comboDisplay.style.zIndex = '1000';
        comboDisplay.style.pointerEvents = 'none';
        
        document.body.appendChild(comboDisplay);
        
        // 动画结束后移除
        setTimeout(() => {
            comboDisplay.remove();
        }, 1200);
    }
    
    /**
     * 创建卡片匹配连接线
     * @param {HTMLElement} cell1 - 第一张卡片
     * @param {HTMLElement} cell2 - 第二张卡片
     */
    createConnectionLine(cell1, cell2) {
        // 获取两个卡片的位置
        const rect1 = cell1.getBoundingClientRect();
        const rect2 = cell2.getBoundingClientRect();
        
        // 计算中心点
        const x1 = rect1.left + rect1.width / 2;
        const y1 = rect1.top + rect1.height / 2;
        const x2 = rect2.left + rect2.width / 2;
        const y2 = rect2.top + rect2.height / 2;
        
        // 创建SVG元素
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'connection-line');
        
        // 创建线条
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#4e73df');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('stroke-linecap', 'round');
        
        // 添加动画
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        line.style.strokeDasharray = length;
        line.style.strokeDashoffset = length;
        line.style.animation = 'dash-animation 0.5s linear forwards';
        
        svg.appendChild(line);
        document.body.appendChild(svg);
        
        // 动画结束后移除
        setTimeout(() => {
            svg.remove();
        }, 500);
    }
    
    /**
     * 创建倒计时动画
     * @param {number} number - 倒计时数字
     */
    createCountdownAnimation(number) {
        const countdown = document.createElement('div');
        countdown.className = 'ending-countdown pulse';
        countdown.textContent = number;
        countdown.style.position = 'fixed';
        countdown.style.top = '50%';
        countdown.style.left = '50%';
        countdown.style.transform = 'translate(-50%, -50%)';
        countdown.style.fontSize = '120px';
        countdown.style.fontWeight = 'bold';
        countdown.style.color = '#4e73df';
        countdown.style.zIndex = '1000';
        countdown.style.pointerEvents = 'none';
        
        document.body.appendChild(countdown);
        
        // 动画结束后移除
        setTimeout(() => {
            countdown.remove();
        }, 900);
    }
    
    /**
     * 创建分数增加动画
     * @param {number} score - 增加的分数
     * @param {HTMLElement} cell - 卡片元素
     */
    createScoreAnimation(score, cell) {
        const rect = cell.getBoundingClientRect();
        const scoreElement = document.createElement('div');
        scoreElement.className = 'score-increment';
        scoreElement.textContent = `+${score}`;
        
        // 随机位置偏移
        const offsetX = Math.random() * 40 - 20;
        
        scoreElement.style.left = `${rect.left + rect.width / 2 + offsetX}px`;
        scoreElement.style.top = `${rect.top}px`;
        
        document.body.appendChild(scoreElement);
        
        // 动画结束后移除
        setTimeout(() => {
            scoreElement.remove();
        }, 1500);
    }
    
    /**
     * 创建游戏胜利动画
     */
    createWinAnimation() {
        // 创建彩带效果
        this.createVictoryRibbons();
        
        // 创建胜利文字
        const winText = document.createElement('div');
        winText.className = 'win-text';
        winText.textContent = '胜利!';
        winText.style.position = 'fixed';
        winText.style.top = '50%';
        winText.style.left = '50%';
        winText.style.transform = 'translate(-50%, -50%)';
        winText.style.fontSize = '80px';
        winText.style.fontWeight = 'bold';
        winText.style.color = '#FFD740';
        winText.style.zIndex = '1000';
        winText.style.opacity = '0';
        winText.style.transition = 'all 1s ease';
        
        document.body.appendChild(winText);
        
        // 显示文字
        setTimeout(() => {
            winText.style.opacity = '1';
            winText.style.transform = 'translate(-50%, -50%) scale(1.2)';
        }, 100);
        
        // 移除文字
        setTimeout(() => {
            winText.style.opacity = '0';
            winText.style.transform = 'translate(-50%, -50%) scale(0.8)';
            
            setTimeout(() => {
                winText.remove();
            }, 1000);
        }, 3000);
        
        // 创建烟花效果
        this.createFireworks(15);
    }
    
    /**
     * 创建烟花效果
     * @param {number} count - 烟花数量
     */
    createFireworks(count = 10) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createFirework();
            }, i * 300);
        }
    }
    
    /**
     * 创建单个烟花
     */
    createFirework() {
        const firework = document.createElement('div');
        firework.className = 'firework';
        
        // 随机位置
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        // 随机颜色
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        firework.style.left = `${x}px`;
        firework.style.top = `${y}px`;
        firework.style.backgroundColor = color;
        firework.style.boxShadow = `0 0 10px 2px ${color}`;
        
        document.body.appendChild(firework);
        
        // 动画结束后移除
        setTimeout(() => {
            firework.remove();
        }, 2000);
    }
    
    /**
     * 创建提示动画
     * @param {HTMLElement} cell1 - 第一张卡片
     * @param {HTMLElement} cell2 - 第二张卡片
     */
    createHintAnimation(cell1, cell2) {
        // 添加提示类
        cell1.classList.add('hint');
        cell2.classList.add('hint');
        
        // 一段时间后移除提示类
        setTimeout(() => {
            cell1.classList.remove('hint');
            cell2.classList.remove('hint');
        }, 2000);
    }
    
    /**
     * 创建洗牌动画
     * @param {Array<HTMLElement>} cells - 所有卡片元素
     */
    createShuffleAnimation(cells) {
        cells.forEach(cell => {
            cell.classList.add('shuffling');
            
            // 随机位置
            const randomX = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 20;
            const randomRotate = (Math.random() - 0.5) * 40;
            
            cell.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
            
            // 恢复原位
            setTimeout(() => {
                cell.style.transform = '';
                
                // 动画结束后移除类
                setTimeout(() => {
                    cell.classList.remove('shuffling');
                }, 500);
            }, 500);
        });
    }
    
    /**
     * 创建成就解锁通知
     * @param {string} title - 成就标题
     * @param {string} description - 成就描述
     */
    createAchievementNotification(title, description) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        
        // 设置内容
        notification.innerHTML = `
            <div class="achievement-notification-icon">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="achievement-notification-content">
                <div class="achievement-notification-title">成就解锁!</div>
                <div class="achievement-notification-name">${title}</div>
                <div class="achievement-notification-description">${description}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
            
            // 创建星星效果
            this.createAchievementStars(notification);
        }, 100);
        
        // 一段时间后隐藏通知
        setTimeout(() => {
            notification.classList.remove('show');
            
            // 动画结束后移除
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }
    
    /**
     * 创建游戏开始动画
     * @param {HTMLElement} gameBoard - 游戏板元素
     */
    createGameStartAnimation(gameBoard) {
        gameBoard.classList.add('game-start-animation');
        
        // 动画结束后移除类
        setTimeout(() => {
            gameBoard.classList.remove('game-start-animation');
        }, 1500);
    }
    
    /**
     * 创建游戏加载动画
     * @param {HTMLElement} element - 需要添加加载动画的元素
     * @param {boolean} isLoading - 是否正在加载
     */
    createLoadingAnimation(element, isLoading) {
        if (isLoading) {
            element.classList.add('loading-board');
        } else {
            element.classList.remove('loading-board');
        }
    }
}

// 导出VisualEffects类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualEffects;
} else {
    // 创建全局实例
    window.visualEffects = new VisualEffects();
}