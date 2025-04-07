/**
 * 成就UI组件
 * 处理成就界面的交互和动画
 */
class AchievementUI {
    constructor() {
        // 成就面板DOM元素
        this.achievementsPanel = null;
        // 成就详情模态框
        this.detailModal = null;
        // 初始化
        this.init();
    }

    /**
     * 初始化UI组件
     */
    init() {
        // 创建成就详情模态框
        this.createDetailModal();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 增强成就面板
        this.enhanceAchievementsPanel();
    }

    /**
     * 创建成就详情模态框
     */
    createDetailModal() {
        // 创建模态框元素
        const modal = document.createElement('div');
        modal.className = 'achievement-detail-modal';
        modal.style.display = 'none';
        
        // 创建模态框内容
        modal.innerHTML = `
            <div class="achievement-detail-content">
                <span class="close-modal">&times;</span>
                <div class="achievement-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <h3 class="achievement-title">成就标题</h3>
                <p class="achievement-description">成就描述</p>
                <div class="achievement-status">
                    <span class="status-label">状态:</span>
                    <span class="status-value">未解锁</span>
                </div>
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-text">0/1</div>
                </div>
            </div>
        `;
        
        // 添加到文档
        document.body.appendChild(modal);
        
        // 保存引用
        this.detailModal = modal;
        
        // 添加关闭按钮事件
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            this.hideDetailModal();
        });
        
        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideDetailModal();
            }
        });
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听成就解锁事件
        document.addEventListener('achievementUnlocked', this.onAchievementUnlocked.bind(this));
        
        // 监听成就项点击事件
        document.addEventListener('click', (e) => {
            const achievementItem = e.target.closest('.achievements li');
            if (achievementItem) {
                const achievementId = achievementItem.dataset.achievementId;
                if (achievementId) {
                    this.showAchievementDetail(achievementId);
                }
            }
        });
        
        // 添加成就标签切换事件
        document.addEventListener('click', (e) => {
            const tab = e.target.closest('.achievement-tab');
            if (tab) {
                const tabType = tab.dataset.tabType;
                if (tabType) {
                    this.switchAchievementTab(tabType);
                }
            }
        });
    }

    /**
     * 增强成就面板
     */
    enhanceAchievementsPanel() {
        // 获取成就面板
        const achievementsPanel = document.querySelector('.achievements');
        if (!achievementsPanel) return;
        
        // 保存引用
        this.achievementsPanel = achievementsPanel;
        
        // 添加标签栏
        const tabsHtml = `
            <div class="achievement-tabs">
                <div class="achievement-tab active" data-tab-type="all">全部</div>
                <div class="achievement-tab" data-tab-type="unlocked">已解锁</div>
                <div class="achievement-tab" data-tab-type="locked">未解锁</div>
            </div>
        `;
        
        // 在标题后插入标签栏
        const title = achievementsPanel.querySelector('h2');
        if (title) {
            title.insertAdjacentHTML('afterend', tabsHtml);
        }
        
        // 添加进度统计
        const progressHtml = `
            <div class="achievement-progress-summary">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="progress-text">已解锁: 0/0 (0%)</div>
            </div>
        `;
        
        // 在列表前插入进度统计
        const list = achievementsPanel.querySelector('ul');
        if (list) {
            list.insertAdjacentHTML('beforebegin', progressHtml);
        }
        
        // 更新进度统计
        this.updateProgressSummary();
    }

    /**
     * 更新进度统计
     */
    updateProgressSummary() {
        const achievementSystem = window.achievementSystem;
        if (!achievementSystem || !this.achievementsPanel) return;
        
        const totalAchievements = achievementSystem.getAllAchievements().length;
        const unlockedAchievements = achievementSystem.getUnlockedAchievements().length;
        const percentage = totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0;
        
        // 更新进度条
        const progressFill = this.achievementsPanel.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        // 更新文本
        const progressText = this.achievementsPanel.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `已解锁: ${unlockedAchievements}/${totalAchievements} (${percentage}%)`;
        }
    }

    /**
     * 切换成就标签
     * @param {string} tabType - 标签类型
     */
    switchAchievementTab(tabType) {
        // 获取所有标签
        const tabs = document.querySelectorAll('.achievement-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tabType === tabType);
        });
        
        // 获取成就系统
        const achievementSystem = window.achievementSystem;
        if (!achievementSystem) return;
        
        // 获取成就列表
        let achievements = [];
        switch (tabType) {
            case 'unlocked':
                achievements = achievementSystem.getUnlockedAchievements();
                break;
            case 'locked':
                achievements = achievementSystem.getLockedAchievements();
                break;
            case 'all':
            default:
                achievements = achievementSystem.getAllAchievements();
                break;
        }
        
        // 更新UI
        this.updateAchievementList(achievements);
    }

    /**
     * 更新成就列表
     * @param {Array} achievements - 成就列表
     */
    updateAchievementList(achievements) {
        const achievementSystem = window.achievementSystem;
        if (!achievementSystem) return;
        
        const achievementsContainer = document.querySelector('.achievements ul');
        if (!achievementsContainer) return;
        
        // 清空容器
        achievementsContainer.innerHTML = '';
        
        // 添加成就
        achievements.forEach(achievement => {
            const isUnlocked = achievementSystem.isAchievementUnlocked(achievement.id);
            
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
     * 显示成就详情
     * @param {string} achievementId - 成就ID
     */
    showAchievementDetail(achievementId) {
        const achievementSystem = window.achievementSystem;
        if (!achievementSystem || !this.detailModal) return;
        
        // 获取成就
        const achievement = achievementSystem.getAchievementById(achievementId);
        if (!achievement) return;
        
        // 获取解锁状态
        const isUnlocked = achievementSystem.isAchievementUnlocked(achievementId);
        
        // 更新模态框内容
        const iconElement = this.detailModal.querySelector('.achievement-icon i');
        iconElement.className = `fas ${achievement.icon}`;
        
        const titleElement = this.detailModal.querySelector('.achievement-title');
        titleElement.textContent = achievement.name;
        
        const descElement = this.detailModal.querySelector('.achievement-description');
        descElement.textContent = achievement.description;
        
        const statusElement = this.detailModal.querySelector('.status-value');
        statusElement.textContent = isUnlocked ? '已解锁' : '未解锁';
        statusElement.className = 'status-value ' + (isUnlocked ? 'unlocked' : 'locked');
        
        // 显示模态框
        this.detailModal.style.display = 'flex';
        
        // 添加动画类
        setTimeout(() => {
            this.detailModal.classList.add('show');
        }, 10);
    }

    /**
     * 隐藏成就详情模态框
     */
    hideDetailModal() {
        if (!this.detailModal) return;
        
        // 移除动画类
        this.detailModal.classList.remove('show');
        
        // 延迟隐藏
        setTimeout(() => {
            this.detailModal.style.display = 'none';
        }, 300);
    }

    /**
     * 成就解锁事件处理
     * @param {Event} event - 事件对象
     */
    onAchievementUnlocked(event) {
        // 获取成就
        const achievement = event.detail.achievement;
        
        // 更新进度统计
        this.updateProgressSummary();
        
        // 更新成就列表
        const activeTab = document.querySelector('.achievement-tab.active');
        if (activeTab) {
            this.switchAchievementTab(activeTab.dataset.tabType);
        }
        
        // 创建成就解锁动画
        this.createUnlockAnimation(achievement);
    }

    /**
     * 创建成就解锁动画
     * @param {Object} achievement - 成就对象
     */
    createUnlockAnimation(achievement) {
        // 查找成就项
        const achievementItem = document.querySelector(`.achievements li[data-achievement-id="${achievement.id}"]`);
        if (!achievementItem) return;
        
        // 添加解锁动画类
        achievementItem.classList.add('unlocking');
        
        // 创建闪光效果
        const shine = document.createElement('div');
        shine.className = 'achievement-shine';
        achievementItem.appendChild(shine);
        
        // 动画结束后移除
        setTimeout(() => {
            achievementItem.classList.remove('unlocking');
            shine.remove();
        }, 2000);
    }
}

// 创建全局实例
window.achievementUI = new AchievementUI();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementUI;
}