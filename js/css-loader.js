// CSS加载器
(function() {
    // 要加载的CSS文件列表
    const cssFiles = [
        'css/reset.css',
        'css/game-board.css',
        'css/enhanced-animations.css',
        'css/netease-theme.css' // 添加网易云风格主题
    ];
    
    // 动态加载CSS文件
    cssFiles.forEach(file => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = file;
        document.head.appendChild(link);
    });
})();