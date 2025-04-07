// CSS加载器
(function() {
    // 要加载的CSS文件列表
    const cssFiles = [
        'css/reset.css',
        'css/game-board.css',
        'css/enhanced-animations.css',
        'css/netease-theme.css',
        'css/achievement-system.css' // 添加成就系统样式
    ];
    
    // 动态加载CSS文件
    cssFiles.forEach(file => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = file;
        document.head.appendChild(link);
    });
})();