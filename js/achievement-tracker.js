/**
 * 成就追踪器
 * 监听游戏事件并更新成就进度
 */
class AchievementTracker {
    constructor() {
        // 初始化
        this.init();
    }

    /**
     * 初始化追踪器
     */
    init() {
        // 设置事件监听器
        this.setupEventListeners();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 游戏开始事件
        document.addEventListener('gameStarted', this.onGameStarted.bind(this));
        
        // 游戏结束事件
        document.addEventListener('gameEnded', this.onGameEnded.bind(this));
        
        // 匹配成功事件
        document.addEventListener('matchSuccess', this.onMatchSuccess.bind(this));
        
        // 匹配失败事件
        document.addEventListener('matchFailed', this.onMatchFailed.bind(this));
    }

    /**
     * 游戏开始事件处理
     * @param {Event} event - 事件对象
     */
    onGameStarted(event) {
        console.log('游戏开始，开始追踪成就');
        
        // 重置连击计数器
        this.comboCount = 0;
        
        // 记录开始时间
        this.gameStartTime = Date.now();
    }

    /**
     * 游戏结束事件处理
     * @param {Event} event - 事件对象
     */
    onGameEnded(event) {
        console.log('游戏结束，检查成就');
        
        const { isWin, score, timeLeft } = event.detail;
        
        // 如果游戏胜利
        if (isWin) {
            // 检查首次完成成就
            this.checkFirstCompletionAchievement();
            
            // 检查高分成就
            this.checkHighScoreAchievement(score);
            
            // 检查速度成就
            const gameTime = (Date.now() - this.gameStartTime) / 1000;
            this.checkSpeedAchievement(gameTime);
        }
    }

    /**
     * 匹配成功事件处理
     * @param {Event} event - 事件对象
     */
    onMatchSuccess(event) {
        // 增加连击计数
        this.comboCount = (this.comboCount || 0) + 1;
        
        // 检查连击成就
        this.checkComboAchievement(this.comboCount);
    }

    /**
     * 匹配失败事件处理
     * @param {Event} event - 事件对象
     */
    onMatchFailed(event) {
        // 重置连击计数
        this.comboCount = 0;
    }

    /**
     * 检查首次完成成就
     */
    checkFirstCompletionAchievement() {
        if (!window.achievementSystem) return;
        
        window.achievementSystem.updateAchievementProgress('first_completion', 1);
    }

    /**
     * 检查高分成就
     * @param {number} score - 游戏分数
     */
    checkHighScoreAchievement(score) {
        if (!window.achievementSystem) return;
        
        // 更新高分成就进度
        if (score >= 500) {
            window.achievementSystem.updateAchievementProgress('high_score_500', 1);
        }
        
        if (score >= 1000) {
            window.achievementSystem.updateAchievementProgress('high_score_1000', 1);
        }
    }

    /**
     * 检查速度成就
     * @param {number} gameTime - 游戏时间（秒）
     */
    checkSpeedAchievement(gameTime) {
        if (!window.achievementSystem) return;
        
        // 30秒内完成
        if (gameTime <= 30) {
            window.achievementSystem.updateAchievementProgress('speed_30', 1);
        }
        
        // 60秒内完成
        if (gameTime <= 60) {
            window.achievementSystem.updateAchievementProgress('speed_60', 1);
        }
    }

    /**
     * 检查连击成就
     * @param {number} comboCount - 连击次数
     */
    checkComboAchievement(comboCount) {
        if (!window.achievementSystem) return;
        
        // 3连击
        if (comboCount >= 3) {
            window.achievementSystem.updateAchievementProgress('combo_3', 1);
        }
        
        // 5连击
        if (comboCount >= 5) {
            window.achievementSystem.updateAchievementProgress('combo_5', 1);
        }
        
        // 10连击
        if (comboCount >= 10) {
            window.achievementSystem.updateAchievementProgress('combo_10', 1);
        }
    }
}

// 创建全局实例
window.achievementTracker = new AchievementTracker();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementTracker;
}