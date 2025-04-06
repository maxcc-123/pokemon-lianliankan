/**
 * 成就系统
 */
class AchievementSystem {
    constructor(game) {
        this.game = game;
        this.achievements = {
            firstGame: { id: 'first-game', title: '初次尝试', description: '完成第一局游戏', unlocked: false },
            comboMaster: { id: 'combo-master', title: '连击大师', description: '连续匹配5对', unlocked: false },
            speedRun: { id: 'speed-run', title: '闪电速度', description: '在30秒内完成一局游戏', unlocked: false }
        };
        
        // 从本地存储加载成就
        this.loadAchievements();
        
        // 初始化成就显示
        this.updateAchievementDisplay();
    }
    
    /**
     * 从本地存储加载成就
     */
    loadAchievements() {
        const savedAchievements = localStorage.getItem('pokemon-achievements');
        if (savedAchievements) {
            const parsed = JSON.parse(savedAchievements);
            // 更新成就解锁状态
            Object.keys(parsed).forEach(key => {
                if (this.achievements[key]) {
                    this.achievements[key].unlocked = parsed[key].unlocked;
                }
            });
        }
    }
    
    /**
     * 保存成就到本地存储
     */
    saveAchievements() {
        localStorage.setItem('pokemon-achievements', JSON.stringify(this.achievements));
    }
    
    /**
     * 更新成就显示
     */
    updateAchievementDisplay() {
        const achievementGrid = document.getElementById('achievement-grid');
        if (!achievementGrid) return;
        
        // 更新初次尝试成就
        const firstGameAchievement = achievementGrid.querySelector('.achievement[title="完成第一局游戏"]');
        if (firstGameAchievement && this.achievements.firstGame.unlocked) {
            firstGameAchievement.classList.remove('locked');
            firstGameAchievement.querySelector('i').className = 'fas fa-check-circle';
        }
        
        // 更新连击大师成就
        const comboMasterAchievement = achievementGrid.querySelector('.achievement[title="连续匹配5对"]');
        if (comboMasterAchievement && this.achievements.comboMaster.unlocked) {
            comboMasterAchievement.classList.remove('locked');
            comboMasterAchievement.querySelector('i').className = 'fas fa-check-circle';
        }
        
        // 更新闪电速度成就
        const speedRunAchievement = achievementGrid.querySelector('.achievement[title="在30秒内完成一局游戏"]');
        if (speedRunAchievement && this.achievements.speedRun.unlocked) {
            speedRunAchievement.classList.remove('locked');
            speedRunAchievement.querySelector('i').className = 'fas fa-check-circle';
        }
    }
    
    /**
     * 检查成就
     * @param {Object} gameStats - 游戏统计数据
     */
    checkAchievements(gameStats) {
        let newAchievements = [];
        
        // 检查初次尝试成就
        if (!this.achievements.firstGame.unlocked && gameStats.gameCompleted) {
            this.achievements.firstGame.unlocked = true;
            newAchievements.push(this.achievements.firstGame.title);
        }
        
        // 检查连击大师成就
        if (!this.achievements.comboMaster.unlocked && gameStats.maxCombo >= 5) {
            this.achievements.comboMaster.unlocked = true;
            newAchievements.push(this.achievements.comboMaster.title);
        }
        
        // 检查闪电速度成就
        if (!this.achievements.speedRun.unlocked && gameStats.gameCompleted && gameStats.gameTime <= 30) {
            this.achievements.speedRun.unlocked = true;
            newAchievements.push(this.achievements.speedRun.title);
        }
        
        // 如果有新成就，显示通知并播放音效
        if (newAchievements.length > 0) {
            this.showAchievementNotification(newAchievements);
            this.saveAchievements();
            this.updateAchievementDisplay();
            
            // 播放成就音效
            if (this.game.achievementSound) {
                this.game.achievementSound.currentTime = 0;
                this.game.achievementSound.play().catch(e => console.log("音频播放失败:", e));
            }
        }
    }
    
    /**
     * 显示成就通知
     * @param {Array} achievements - 成就标题数组
     */
    showAchievementNotification(achievements) {
        const achievementText = `恭喜获得成就: ${achievements.join('、')}！`;
        
        // 在游戏结束时显示成就文本
        if (this.game.achievementTextElement) {
            this.game.achievementTextElement.textContent = achievementText;
        }
        
        // 创建一个临时通知
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <i class="fas fa-medal"></i>
            <span>${achievementText}</span>
        `;
        
        document.body.appendChild(notification);
        
        // 2秒后移除通知
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 2000);
    }
}