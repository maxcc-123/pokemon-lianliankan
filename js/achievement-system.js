/**
 * 成就系统核心
 * 管理游戏成就的定义、解锁和存储
 */
class AchievementSystem {
    constructor() {
        // 成就列表
        this.achievements = [];
        // 已解锁的成就ID
        this.unlockedAchievements = new Set();
        // 成就进度数据
        this.progressData = {};
        // 初始化
        this.init();
    }

    /**
     * 初始化成就系统
     */
    init() {
        // 从本地存储加载已解锁的成就
        this.loadUnlockedAchievements();
        // 注册成就
        this.registerAchievements();
        // 更新UI
        this.updateAchievementUI();
    }

    /**
     * 注册所有成就
     */
    registerAchievements() {
        // 基础成就
        this.registerAchievement({
            id: 'first_game',
            name: '初次尝试',
            description: '完成第一局游戏',
            icon: 'fa-gamepad',
            condition: () => this.progressData.gamesCompleted >= 1
        });

        this.registerAchievement({
            id: 'combo_master',
            name: '连击大师',
            description: '连续匹配5对宠物',
            icon: 'fa-bolt',
            condition: () => this.progressData.maxCombo >= 5
        });

        this.registerAchievement({
            id: 'lightning_speed',
            name: '闪电速度',
            description: '30秒内完成一局游戏',
            icon: 'fa-tachometer-alt',
            condition: () => this.progressData.fastestGame <= 30 && this.progressData.fastestGame > 0
        });

        // 进阶成就
        this.registerAchievement({
            id: 'perfect_game',
            name: '完美游戏',
            description: '不使用提示和洗牌完成一局游戏',
            icon: 'fa-award',
            condition: () => this.progressData.perfectGames >= 1
        });

        this.registerAchievement({
            id: 'high_scorer',
            name: '高分达人',
            description: '单局游戏获得1000分以上',
            icon: 'fa-star',
            condition: () => this.progressData.highestScore >= 1000
        });

        this.registerAchievement({
            id: 'persistent',
            name: '坚持不懈',
            description: '完成10局游戏',
            icon: 'fa-medal',
            condition: () => this.progressData.gamesCompleted >= 10
        });

        // 大师级成就
        this.registerAchievement({
            id: 'pokemon_master',
            name: '宝可梦大师',
            description: '解锁所有其他成就',
            icon: 'fa-crown',
            condition: () => {
                const otherAchievements = this.achievements.filter(a => a.id !== 'pokemon_master');
                return otherAchievements.every(a => this.isAchievementUnlocked(a.id));
            }
        });

        this.registerAchievement({
            id: 'speed_demon',
            name: '速度恶魔',
            description: '15秒内完成一局游戏',
            icon: 'fa-fire',
            condition: () => this.progressData.fastestGame <= 15 && this.progressData.fastestGame > 0
        });

        this.registerAchievement({
            id: 'combo_king',
            name: '连击之王',
            description: '连续匹配10对宠物',
            icon: 'fa-dragon',
            condition: () => this.progressData.maxCombo >= 10
        });
    }

    /**
     * 注册单个成就
     * @param {Object} achievement - 成就对象
     */
    registerAchievement(achievement) {
        this.achievements.push(achievement);
    }

    /**
     * 更新成就进度
     * @param {Object} data - 进度数据
     */
    updateProgress(data) {
        // 合并进度数据
        this.progressData = { ...this.progressData, ...data };
        
        // 检查所有成就
        this.checkAchievements();
        
        // 保存进度
        this.saveProgress();
    }

    /**
     * 检查所有成就是否达成
     */
    checkAchievements() {
        this.achievements.forEach(achievement => {
            // 如果成就已解锁，跳过检查
            if (this.isAchievementUnlocked(achievement.id)) return;
            
            // 检查成就条件
            if (achievement.condition()) {
                this.unlockAchievement(achievement.id);
            }
        });
    }

    /**
     * 解锁成就
     * @param {string} achievementId - 成就ID
     */
    unlockAchievement(achievementId) {
        // 如果成就已解锁，直接返回
        if (this.isAchievementUnlocked(achievementId)) return;
        
        // 获取成就对象
        const achievement = this.getAchievementById(achievementId);
        if (!achievement) return;
        
        // 添加到已解锁集合
        this.unlockedAchievements.add(achievementId);
        
        // 保存到本地存储
        this.saveUnlockedAchievements();
        
        // 更新UI
        this.updateAchievementUI();
        
        // 显示解锁通知
        this.showAchievementNotification(achievement);
        
        // 触发成就解锁事件
        this.triggerAchievementEvent(achievement);
    }

    /**
     * 显示成就解锁通知
     * @param {Object} achievement - 成就对象
     */
    showAchievementNotification(achievement) {
        // 如果有视觉效果模块，使用它来显示通知
        if (window.visualEffects) {
            window.visualEffects.createAchievementNotification(
                achievement.name,
                achievement.description
            );
        } else {
            // 简单的通知
            console.log(`成就解锁: ${achievement.name} - ${achievement.description}`);
            alert(`成就解锁: ${achievement.name} - ${achievement.description}`);
        }
    }

    /**
     * 触发成就解锁事件
     * @param {Object} achievement - 成就对象
     */
    triggerAchievementEvent(achievement) {
        // 创建自定义事件
        const event = new CustomEvent('achievementUnlocked', {
            detail: {
                achievement: achievement
            }
        });
        
        // 触发事件
        document.dispatchEvent(event);
    }

    /**
     * 判断成就是否已解锁
     * @param {string} achievementId - 成就ID
     * @returns {boolean} 是否已解锁
     */
    isAchievementUnlocked(achievementId) {
        return this.unlockedAchievements.has(achievementId);
    }

    /**
     * 根据ID获取成就对象
     * @param {string} achievementId - 成就ID
     * @returns {Object|null} 成就对象
     */
    getAchievementById(achievementId) {
        return this.achievements.find(a => a.id === achievementId) || null;
    }

    /**
     * 获取所有成就
     * @returns {Array} 成就列表
     */
    getAllAchievements() {
        return this.achievements;
    }

    /**
     * 获取已解锁的成就
     * @returns {Array} 已解锁的成就列表
     */
    getUnlockedAchievements() {
        return this.achievements.filter(a => this.isAchievementUnlocked(a.id));
    }

    /**
     * 获取未解锁的成就
     * @returns {Array} 未解锁的成就列表
     */
    getLockedAchievements() {
        return this.achievements.filter(a => !this.isAchievementUnlocked(a.id));
    }

    /**
     * 保存已解锁的成就到本地存储
     */
    saveUnlockedAchievements() {
        try {
            localStorage.setItem('pokemon_lianliankan_achievements', 
                JSON.stringify(Array.from(this.unlockedAchievements)));
        } catch (e) {
            console.error('保存成就失败:', e);
        }
    }

    /**
     * 从本地存储加载已解锁的成就
     */
    loadUnlockedAchievements() {
        try {
            const saved = localStorage.getItem('pokemon_lianliankan_achievements');
            if (saved) {
                const achievements = JSON.parse(saved);
                this.unlockedAchievements = new Set(achievements);
            } else {
                this.unlockedAchievements = new Set();
            }
        } catch (e) {
            console.error('加载成就失败:', e);
            this.unlockedAchievements = new Set();
        }
    }

    /**
     * 保存进度数据到本地存储
     */
    saveProgress() {
        try {
            localStorage.setItem('pokemon_lianliankan_progress', 
                JSON.stringify(this.progressData));
        } catch (e) {
            console.error('保存进度失败:', e);
        }
    }

    /**
     * 从本地存储加载进度数据
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem('pokemon_lianliankan_progress');
            if (saved) {
                this.progressData = JSON.parse(saved);
            } else {
                this.initializeProgressData();
            }
        } catch (e) {
            console.error('加载进度失败:', e);
            this.initializeProgressData();
        }
    }

    /**
     * 初始化进度数据
     */
    initializeProgressData() {
        this.progressData = {
            gamesCompleted: 0,
            gamesWon: 0,
            gamesLost: 0,
            totalScore: 0,
            highestScore: 0,
            fastestGame: 0,
            totalTimePlayed: 0,
            maxCombo: 0,
            hintsUsed: 0,
            shufflesUsed: 0,
            perfectGames: 0
        };
    }

    /**
     * 更新成就UI
     */
    updateAchievementUI() {
        const achievementsContainer = document.querySelector('.achievements ul');
        if (!achievementsContainer) return;
        
        // 清空容器
        achievementsContainer.innerHTML = '';
        
        // 添加所有成就
        this.achievements.forEach(achievement => {
            const isUnlocked = this.isAchievementUnlocked(achievement.id);
            
            const li = document.createElement('li');
            li.className = isUnlocked ? 'unlocked' : '';
            li.dataset.achievementId = achievement.id;
            
            // 添加图标
            const icon = document.createElement('i');
            icon.className = `fas ${achievement.icon}`;
            li.appendChild(icon);
            
            // 添加名称和描述
            const nameSpan = document.createElement('span');
            nameSpan.className = 'achievement-name';
            nameSpan.textContent = achievement.name;
            li.appendChild(nameSpan);
            
            const descSpan = document.createElement('span');
            descSpan.className = 'achievement-description';
            descSpan.textContent = ` - ${achievement.description}`;
            li.appendChild(descSpan);
            
            // 添加到容器
            achievementsContainer.appendChild(li);
        });
    }

    /**
     * 重置成就系统
     */
    reset() {
        // 清空已解锁成就
        this.unlockedAchievements = new Set();
        
        // 重置进度数据
        this.initializeProgressData();
        
        // 保存到本地存储
        this.saveUnlockedAchievements();
        this.saveProgress();
        
        // 更新UI
        this.updateAchievementUI();
    }
}

// 创建全局实例
window.achievementSystem = new AchievementSystem();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementSystem;
}