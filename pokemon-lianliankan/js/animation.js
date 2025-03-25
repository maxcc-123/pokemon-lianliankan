/**
 * 动画效果
 * 实现连连看游戏中的各种动画效果
 */
class AnimationManager {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置画布样式
        this.canvas.style.position = 'absolute';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '100';
        
        // 添加到文档
        document.body.appendChild(this.canvas);
        
        // 调整画布大小
        this.resizeCanvas();
        
        // 监听窗口大小变化
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }
    
    /**
     * 调整画布大小
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    /**
     * 创建消除特效
     */
    createMatchEffect(cell, pokemonId) {
        const rect = cell.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 创建粒子
        const particleCount = 30;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const size = 3 + Math.random() * 5;
            
            particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: this.getPokemonColor(pokemonId),
                alpha: 1,
                rotation: Math.random() * 360,
                rotationSpeed: -5 + Math.random() * 10
            });
        }
        
        // 动画循环
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            let isAnimationDone = true;
            
            particles.forEach(particle => {
                if (particle.alpha > 0) {
                    isAnimationDone = false;
                    
                    // 更新粒子位置
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.alpha -= 0.02;
                    particle.rotation += particle.rotationSpeed;
                    
                    // 绘制粒子
                    this.ctx.save();
                    this.ctx.translate(particle.x, particle.y);
                    this.ctx.rotate(particle.rotation * Math.PI / 180);
                    this.ctx.globalAlpha = particle.alpha;
                    
                    // 根据宠物ID绘制不同形状
                    if (pokemonId % 3 === 0) {
                        // 星形
                        this.drawStar(0, 0, particle.size);
                    } else if (pokemonId % 3 === 1) {
                        // 圆形
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                        this.ctx.fillStyle = particle.color;
                        this.ctx.fill();
                    } else {
                        // 方形
                        this.ctx.fillStyle = particle.color;
                        this.ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
                    }
                    
                    this.ctx.restore();
                }
            });
            
            if (!isAnimationDone) {
                requestAnimationFrame(animate);
            }
        };
        
        // 开始动画
        animate();
    }
    
    /**
     * 绘制星形
     */
    drawStar(x, y, size) {
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
            const outerX = x + size * Math.cos(angle);
            const outerY = y + size * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(outerX, outerY);
            } else {
                this.ctx.lineTo(outerX, outerY);
            }
            
            const innerAngle = angle + Math.PI / 5;
            const innerSize = size / 2.5;
            const innerX = x + innerSize * Math.cos(innerAngle);
            const innerY = y + innerSize * Math.sin(innerAngle);
            
            this.ctx.lineTo(innerX, innerY);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = '#ffeb3b';
        this.ctx.fill();
    }
    
    /**
     * 根据宠物ID获取颜色
     */
    getPokemonColor(pokemonId) {
        const colors = [
            '#ffeb3b', // 黄色 - 皮卡丘
            '#2196f3', // 蓝色 - 杰尼龟
            '#f44336', // 红色 - 小火龙
            '#4caf50', // 绿色 - 妙蛙种子
            '#03a9f4', // 浅蓝 - 可达鸭
            '#e91e63', // 粉色 - 胖丁
            '#795548', // 棕色 - 卡比兽
            '#9c27b0', // 紫色 - 伊布
            '#ffc107', // 琥珀色 - 喵喵
            '#ff80ab', // 粉红 - 可爱伊布
            '#b39ddb', // 淡紫 - 梦幻
            '#7e57c2', // 深紫 - 超梦
            '#ff9800', // 橙色 - 鲤鱼王
            '#3f51b5', // 靛蓝 - 暴鲤龙
            '#00bcd4', // 青色 - 呆呆兽
            '#8bc34a'  // 浅绿 - 快龙
        ];
        
        // 确保ID在有效范围内
        const index = ((pokemonId - 1) % colors.length);
        return colors[index];
    }
    
    /**
     * 创建闪光效果
     * 用于提示和特殊事件
     */
    createFlashEffect(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 创建闪光粒子
        const particleCount = 20;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 10 + Math.random() * 30;
            const delay = Math.random() * 500;
            
            particles.push({
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                size: 2 + Math.random() * 3,
                alpha: 0,
                delay: delay,
                duration: 500 + Math.random() * 500
            });
        }
        
        // 动画开始时间
        const startTime = performance.now();
        
        // 动画循环
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            let isAnimationDone = true;
            
            particles.forEach(particle => {
                const particleElapsed = elapsed - particle.delay;
                
                if (particleElapsed > 0 && particleElapsed < particle.duration) {
                    isAnimationDone = false;
                    
                    // 计算不透明度 (0->1->0)
                    const progress = particleElapsed / particle.duration;
                    particle.alpha = progress < 0.5 ? progress * 2 : 2 - progress * 2;
                    
                    // 绘制闪光粒子
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.globalAlpha = particle.alpha;
                    this.ctx.fill();
                }
            });
            
            if (!isAnimationDone) {
                requestAnimationFrame(animate);
            }
        };
        
        // 开始动画
        requestAnimationFrame(animate);
    }
    
    /**
     * 创建胜利庆祝效果
     */
    createVictoryEffect() {
        // 创建彩色粒子
        const particleCount = 100;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = this.canvas.height + 10;
            const size = 5 + Math.random() * 10;
            const speed = 3 + Math.random() * 5;
            
            particles.push({
                x: x,
                y: y,
                size: size,
                color: this.getRandomColor(),
                speed: speed,
                alpha: 1,
                rotation: Math.random() * 360
            });
        }
        
        // 动画循环
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            let isAnimationDone = true;
            
            particles.forEach(particle => {
                if (particle.y > -particle.size) {
                    isAnimationDone = false;
                    
                    // 更新粒子位置
                    particle.y -= particle.speed;
                    particle.rotation += 2;
                    
                    // 绘制粒子
                    this.ctx.save();
                    this.ctx.translate(particle.x, particle.y);
                    this.ctx.rotate(particle.rotation * Math.PI / 180);
                    this.ctx.globalAlpha = particle.alpha;
                    
                    // 绘制星形
                    this.drawStar(0, 0, particle.size);
                    
                    this.ctx.restore();
                }
            });
            
            if (!isAnimationDone) {
                requestAnimationFrame(animate);
            }
        };
        
        // 开始动画
        animate();
    }
    
    /**
     * 获取随机颜色
     */
    getRandomColor() {
        const colors = [
            '#f44336', // 红色
            '#e91e63', // 粉色
            '#9c27b0', // 紫色
            '#673ab7', // 深紫色
            '#3f51b5', // 靛蓝色
            '#2196f3', // 蓝色
            '#03a9f4', // 浅蓝色
            '#00bcd4', // 青色
            '#009688', // 蓝绿色
            '#4caf50', // 绿色
            '#8bc34a', // 浅绿色
            '#cddc39', // 酸橙色
            '#ffeb3b', // 黄色
            '#ffc107', // 琥珀色
            '#ff9800', // 橙色
            '#ff5722'  // 深橙色
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * 创建皮卡丘电击效果
     * 特殊效果：当匹配皮卡丘时触发
     */
    createPikachuEffect(cell) {
        const rect = cell.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 创建闪电粒子
        const particleCount = 40;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const size = 2 + Math.random() * 4;
            
            particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: '#ffeb3b', // 皮卡丘黄色
                alpha: 1,
                zigzag: Math.random() > 0.5
            });
        }
        
        // 动画循环
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            let isAnimationDone = true;
            
            particles.forEach(particle => {
                if (particle.alpha > 0) {
                    isAnimationDone = false;
                    
                    // 更新粒子位置（闪电效果）
                    if (particle.zigzag) {
                        particle.vx += (Math.random() - 0.5) * 0.5;
                    }
                    
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.alpha -= 0.02;
                    
                    // 绘制闪电粒子
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fillStyle = particle.color;
                    this.ctx.globalAlpha = particle.alpha;
                    this.ctx.fill();
                    
                    // 有时绘制闪电线
                    if (particle.zigzag && Math.random() > 0.7) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(particle.x, particle.y);
                        this.ctx.lineTo(
                            particle.x + (Math.random() - 0.5) * 20,
                            particle.y + (Math.random() - 0.5) * 20
                        );
                        this.ctx.strokeStyle = '#ffffff';
                        this.ctx.lineWidth = 1;
                        this.ctx.globalAlpha = particle.alpha * 0.7;
                        this.ctx.stroke();
                    }
                }
            });
            
            if (!isAnimationDone) {
                requestAnimationFrame(animate);
            }
        };
        
        // 开始动画
        animate();
    }
}

// 创建动画管理器实例
const animationManager = new AnimationManager();

// 导出动画管理器，供游戏主逻辑使用
window.animationManager = animationManager;

/**
 * 游戏动画效果
 */
class GameAnimation {
    constructor() {
        this.connectionContainer = document.getElementById('connection-container');
    }
    
    /**
     * 显示连接路径
     * @param {Array} path - 连接路径上的单元格
     */
    showConnectionPath(path) {
        // 清除之前的连接线
        this.connectionContainer.innerHTML = '';
        
        if (!path || path.length < 2) return;
        
        // 创建连接线段
        for (let i = 0; i < path.length - 1; i++) {
            const start = this.getCellCenter(path[i]);
            const end = this.getCellCenter(path[i + 1]);
            
            // 创建线段
            const line = this.createLine(start, end);
            this.connectionContainer.appendChild(line);
        }
        
        // 添加动画效果，2秒后移除连接线
        setTimeout(() => {
            this.connectionContainer.innerHTML = '';
        }, 800);
    }
    
    /**
     * 获取单元格中心点坐标
     * @param {HTMLElement} cell - 单元格元素
     * @returns {Object} - 中心点坐标
     */
    getCellCenter(cell) {
        const rect = cell.getBoundingClientRect();
        const containerRect = this.connectionContainer.getBoundingClientRect();
        
        return {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top
        };
    }
    
    /**
     * 创建连接线段
     * @param {Object} start - 起点坐标
     * @param {Object} end - 终点坐标
     * @returns {HTMLElement} - 线段元素
     */
    createLine(start, end) {
        const line = document.createElement('div');
        line.className = 'connection-line';
        
        // 计算线段长度和角度
        const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
        
        // 设置线段样式
        line.style.width = `${length}px`;
        line.style.height = '4px';
        line.style.left = `${start.x}px`;
        line.style.top = `${start.y - 2}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 50%';
        
        // 添加动画效果
        line.style.animation = 'fadeIn 0.2s forwards';
        
        return line;
    }
    
    /**
     * 创建匹配成功动画
     * @param {HTMLElement} cell - 匹配成功的单元格
     */
    createMatchAnimation(cell) {
        // 创建粒子效果
        const particles = [];
        const particleCount = 10;
        const colors = ['#ff6b6b', '#4ecdc4', '#ffd166', '#06d6a0'];
        
        const rect = cell.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            
            // 随机方向和速度
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            const size = 5 + Math.random() * 5;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // 设置动画
            particle.style.animation = `particle-fade 0.5s forwards`;
            particle.style.transform = `translate(${Math.cos(angle) * 50}px, ${Math.sin(angle) * 50}px)`;
            
            document.body.appendChild(particle);
            particles.push(particle);
        }
        
        // 移除粒子
        setTimeout(() => {
            particles.forEach(p => p.remove());
        }, 500);
    }
    
    /**
     * 创建胜利动画
     */
    createVictoryEffect() {
        // 创建烟花效果
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createFirework();
            }, i * 300);
        }
    }
    
    /**
     * 创建烟花效果
     */
    createFirework() {
        const firework = document.createElement('div');
        firework.className = 'firework';
        
        // 随机位置
        const x = 100 + Math.random() * (window.innerWidth - 200);
        const y = 100 + Math.random() * (window.innerHeight - 200);
        
        firework.style.left = `${x}px`;
        firework.style.top = `${y}px`;
        
        document.body.appendChild(firework);
        
        // 创建爆炸效果
        setTimeout(() => {
            firework.classList.add('explode');
            
            // 创建粒子
            const particleCount = 30;
            const colors = ['#ff6b6b', '#4ecdc4', '#ffd166', '#06d6a0', '#e53935', '#4caf50'];
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'firework-particle';
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                
                // 随机方向和速度
                const angle = Math.random() * Math.PI * 2;
                const distance = 30 + Math.random() * 70;
                
                particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
                
                firework.appendChild(particle);
            }
            
            // 移除烟花
            setTimeout(() => {
                firework.remove();
            }, 1000);
        }, 300);
    }
    
    /**
     * 创建提示动画
     * @param {HTMLElement} cell - 需要提示的单元格
     */
    createHintAnimation(cell) {
        // 添加脉冲动画
        cell.classList.add('pulse');
        
        // 添加高亮边框
        const originalBorder = cell.style.border;
        cell.style.border = '3px solid #ffd166';
        
        // 移除动画
        setTimeout(() => {
            cell.classList.remove('pulse');
            cell.style.border = originalBorder;
        }, 1500);
    }
}

// 创建全局动画管理器
window.animationManager = new GameAnimation();