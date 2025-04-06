/**
 * 游戏特效脚本
 * 提供各种视觉效果和动画
 */
class GameEffects {
    constructor() {
        this.colors = [
            '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', 
            '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', 
            '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', 
            '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'
        ];
    }
    
    /**
     * 创建点击波纹效果
     * @param {Event} event - 点击事件
     */
    createRipple(event) {
        const element = event.currentTarget;
        
        // 创建波纹元素
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        // 设置波纹位置
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        element.appendChild(ripple);
        
        // 动画结束后移除波纹
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    /**
     * 创建分数增加动画
     * @param {HTMLElement} element - 显示分数的元素
     * @param {number} score - 增加的分数
     */
    createScoreIncrement(element, score) {
        const rect = element.getBoundingClientRect();
        const scoreElement = document.createElement('div');
        scoreElement.className = 'score-increment';
        scoreElement.textContent = `+${score}`;
        
        // 随机位置偏移
        const offsetX = Math.random() * 40 - 20;
        
        scoreElement.style.left = `${rect.left + rect.width / 2 + offsetX}px`;
        scoreElement.style.top = `${rect.top}px`;
        
        document.body.appendChild(scoreElement);
        
        // 动画结束后移除元素
        setTimeout(() => {
            scoreElement.remove();
        }, 1500);
    }
    
    /**
     * 创建洗牌按钮动画
     * @param {HTMLElement} button - 洗牌按钮
     */
    createShuffleButtonAnimation(button) {
        button.classList.add('shuffle-btn-active');
        
        // 动画结束后移除类
        setTimeout(() => {
            button.classList.remove('shuffle-btn-active');
        }, 500);
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
     * 创建胜利烟花效果
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
     * 创建连击效果
     * @param {number} combo - 连击数
     * @param {HTMLElement} gameBoard - 游戏板元素
     */
    createComboEffect(combo, gameBoard) {
        if (combo < 2) return;
        
        const comboDisplay = document.createElement('div');
        comboDisplay.className = 'combo-display';
        comboDisplay.textContent = `${combo} 连击!`;
        comboDisplay.style.display = 'block';
        
        // 根据连击数调整样式
        if (combo >= 5) {
            comboDisplay.style.fontSize = '60px';
            comboDisplay.style.color = '#FF5252';
        } else if (combo >= 3) {
            comboDisplay.style.fontSize = '52px';
            comboDisplay.style.color = '#FFD740';
        }
        
        gameBoard.appendChild(comboDisplay);
        
        // 添加动画
        comboDisplay.style.animation = 'combo-enhanced-animation 1.2s ease-out';
        
        // 动画结束后移除
        setTimeout(() => {
            comboDisplay.remove();
        }, 1200);
    }
    
    /**
     * 创建卡片匹配动画
     * @param {HTMLElement} cell1 - 第一张卡片
     * @param {HTMLElement} cell2 - 第二张卡片
     */
    createMatchAnimation(cell1, cell2) {
        // 添加匹配动画类
        cell1.classList.add('matched');
        cell2.classList.add('matched');
        
        // 创建连接线
        this.createConnectionLine(cell1, cell2);
        
        // 创建粒子效果
        this.createParticles(cell1);
        this.createParticles(cell2);
    }
    
    /**
     * 创建卡片之间的连接线
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
        svg.style.position = 'fixed';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '100';
        
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
     * 创建粒子效果
     * @param {HTMLElement} element - 元素
     */
    createParticles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 创建多个粒子
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // 随机颜色
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            
            // 设置样式
            particle.style.position = 'fixed';
            particle.style.width = '5px';
            particle.style.height = '5px';
            particle.style.backgroundColor = color;
            particle.style.borderRadius = '50%';
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '200';
            
            // 随机角度和距离
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 50;
            const duration = 500 + Math.random() * 500;
            
            // 设置动画
            particle.style.transition = `all ${duration}ms ease-out`;
            
            document.body.appendChild(particle);
            
            // 开始动画
            setTimeout(() => {
                particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
                particle.style.opacity = '0';
            }, 10);
            
            // 动画结束后移除
            setTimeout(() => {
                particle.remove();
            }, duration);
        }
    }
    
    /**
     * 创建倒计时动画
     * @param {number} number - 倒计时数字
     */
    createCountdownAnimation(number) {
        const countdown = document.createElement('div');
        countdown.className = 'ending-countdown pulse';
        countdown.textContent = number;
        
        document.body.appendChild(countdown);
        
        // 动画结束后移除
        setTimeout(() => {
            countdown.remove();
        }, 900);
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
     * 创建游戏胜利动画
     */
    createWinAnimation() {
        // 创建烟花效果
        this.createFireworks(15);
        
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
        winText.style.textShadow = '0 0 20px rgba(255, 215, 64, 0.8)';
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
    }
    
    /**
     * 创建游戏失败动画
     */
    createLoseAnimation() {
        // 创建失败文字
        const loseText = document.createElement('div');
        loseText.className = 'lose-text';
        loseText.textContent = '游戏结束';
        loseText.style.position = 'fixed';
        loseText.style.top = '50%';
        loseText.style.left = '50%';
        loseText.style.transform = 'translate(-50%, -50%)';
        loseText.style.fontSize = '70px';
        loseText.style.fontWeight = 'bold';
        loseText.style.color = '#FF5252';
        loseText.style.textShadow = '0 0 20px rgba(255, 82, 82, 0.8)';
        loseText.style.zIndex = '1000';
        loseText.style.opacity = '0';
        loseText.style.transition = 'all 1s ease';
        
        document.body.appendChild(loseText);
        
        // 显示文字
        setTimeout(() => {
            loseText.style.opacity = '1';
            loseText.style.transform = 'translate(-50%, -50%) scale(1.2)';
        }, 100);
        
        // 移除文字
        setTimeout(() => {
            loseText.style.opacity = '0';
            loseText.style.transform = 'translate(-50%, -50%) scale(0.8)';
            
            setTimeout(() => {
                loseText.remove();
            }, 1000);
        }, 3000);
    }
    
    /**
     * 创建成就解锁动画
     * @param {string} achievementName - 成就名称
     * @param {string} description - 成就描述
     */
    createAchievementAnimation(achievementName, description) {
        // 创建成就通知
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        
        // 设置内容
        notification.innerHTML = `
            <div class="achievement-notification-icon">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="achievement-notification-content">
                <div class="achievement-notification-title">成就解锁!</div>
                <div class="achievement-notification-name">${achievementName}</div>
                <div class="achievement-notification-description">${description}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
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
}

// 导出GameEffects类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEffects;
}