@echo off
echo 正在拆分CSS文件...

set CSS_DIR=css
if not exist %CSS_DIR% mkdir %CSS_DIR%

echo 创建base.css...
type nul > %CSS_DIR%\base.css
echo /* 基础样式 - 变量、重置和通用布局 */ > %CSS_DIR%\base.css

echo 创建game-board.css...
type nul > %CSS_DIR%\game-board.css
echo /* 游戏板相关样式 */ > %CSS_DIR%\game-board.css

echo 创建animations.css...
type nul > %CSS_DIR%\animations.css
echo /* 动画效果 */ > %CSS_DIR%\animations.css

echo 创建enhanced-animations.css...
type nul > %CSS_DIR%\enhanced-animations.css
echo /* 增强动画效果 */ > %CSS_DIR%\enhanced-animations.css

echo 创建modals.css...
type nul > %CSS_DIR%\modals.css
echo /* 模态框和弹窗样式 */ > %CSS_DIR%\modals.css

echo 创建achievements.css...
type nul > %CSS_DIR%\achievements.css
echo /* 成就系统样式 */ > %CSS_DIR%\achievements.css

echo 创建leaderboard.css...
type nul > %CSS_DIR%\leaderboard.css
echo /* 排行榜系统样式 */ > %CSS_DIR%\leaderboard.css

echo 创建themes.css...
type nul > %CSS_DIR%\themes.css
echo /* 主题相关样式 */ > %CSS_DIR%\themes.css

echo 创建layout.css...
type nul > %CSS_DIR%\layout.css
echo /* 布局优化样式 */ > %CSS_DIR%\layout.css

echo CSS文件拆分完成，请手动将style1.css中的内容复制到相应的文件中。
pause