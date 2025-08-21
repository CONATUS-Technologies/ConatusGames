class DesktopSnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.miniMapCanvas = document.getElementById('miniMap');
        this.miniMapCtx = this.miniMapCanvas.getContext('2d');
        
        // Game settings
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.miniMapScale = this.miniMapCanvas.width / this.canvas.width;
        
        // Responsive settings
        this.isMobile = this.detectMobile();
        this.canvasSize = this.getOptimalCanvasSize();
        
        // Game state
        this.snake = [{x: 15, y: 15}];
        this.food = {};
        this.specialFood = null;
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.speed = 1;
        this.highScore = this.getStoredHighScore();
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = 150;
        this.gameStartTime = 0;
        this.gameTime = 0;
        
        // Game statistics
        this.foodEaten = 0;
        this.maxLength = 1;
        
        // Settings
        this.soundEnabled = true;
        this.gridVisible = true;
        this.difficulty = 'normal';
        
        // FPS tracking
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = 0;
        
        // Touch controls
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 30;
        
        // Achievements
        this.achievements = {
            firstApple: { unlocked: false, name: 'Primeira Maçã', desc: 'Coma sua primeira maçã' },
            speedster: { unlocked: false, name: 'Velocista', desc: 'Alcance velocidade 5x' },
            giant: { unlocked: false, name: 'Gigante', desc: 'Tenha 50 segmentos' },
            survivor: { unlocked: false, name: 'Sobrevivente', desc: 'Jogue por 5 minutos' },
            scorer: { unlocked: false, name: 'Pontuador', desc: 'Alcance 1000 pontos' }
        };
             
        // Leaderboard
        this.leaderboard = this.getStoredLeaderboard();
        
        // DOM elements
        this.initializeElements();
        this.setupCanvas();
        this.setupEventListeners();
        this.init();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
               window.innerWidth <= 768;
    }
    
    getOptimalCanvasSize() {
        const maxWidth = Math.min(600, window.innerWidth - 40);
        const maxHeight = Math.min(600, window.innerHeight - 200);
        const size = Math.min(maxWidth, maxHeight);
        
        // Ensure size is divisible by gridSize for clean grid
        return Math.floor(size / this.gridSize) * this.gridSize;
    }
    
    setupCanvas() {
        const size = this.canvasSize;
        this.canvas.width = size;
        this.canvas.height = size;
        this.tileCount = size / this.gridSize;
        this.miniMapScale = this.miniMapCanvas.width / size;
        
        // Handle high DPI displays
        const devicePixelRatio = window.devicePixelRatio || 1;
        if (devicePixelRatio > 1) {
            this.canvas.style.width = size + 'px';
            this.canvas.style.height = size + 'px';
            this.canvas.width = size * devicePixelRatio;
            this.canvas.height = size * devicePixelRatio;
            this.ctx.scale(devicePixelRatio, devicePixelRatio);
        }
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.levelElement = document.getElementById('level');
        this.speedElement = document.getElementById('speed');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.fpsCounterElement = document.getElementById('fpsCounter');
        
        // Control buttons
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Mobile control buttons
        this.mobileStartBtn = document.getElementById('mobileStartBtn');
        this.mobilePauseBtn = document.getElementById('mobilePauseBtn');
        this.mobileResetBtn = document.getElementById('mobileResetBtn');
        this.mobileCenterBtn = document.getElementById('mobileCenterBtn');
        
        // Settings
        this.soundToggle = document.getElementById('soundToggle');
        this.gridToggle = document.getElementById('gridToggle');
        this.difficultySelect = document.getElementById('difficultySelect');
        
        // Modals
        this.gameOverModal = document.getElementById('gameOverModal');
        this.pauseMenu = document.getElementById('pauseMenu');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalLevelElement = document.getElementById('finalLevel');
        this.gameTimeElement = document.getElementById('gameTime');
        this.newRecordElement = document.getElementById('newRecord');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.mainMenuBtn = document.getElementById('mainMenuBtn');
        this.modalClose = document.getElementById('modalClose');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.pauseResetBtn = document.getElementById('pauseResetBtn');
        
        // Lists
        this.leaderboardElement = document.getElementById('leaderboard');
        this.achievementsListElement = document.getElementById('achievementsList');
        this.achievementsEarnedElement = document.getElementById('achievementsEarned');
        
        // Pause stats
        this.pauseScoreElement = document.getElementById('pauseScore');
        this.pauseLevelElement = document.getElementById('pauseLevel');
        this.pauseTimeElement = document.getElementById('pauseTime');
        
        // Mobile controls container
        this.mobileControls = document.getElementById('mobileControls');
    }
    
    setupEventListeners() {
        // Control buttons (desktop)
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        
        // Mobile control buttons
        if (this.mobileStartBtn) {
            this.mobileStartBtn.addEventListener('click', () => this.startGame());
            this.mobilePauseBtn.addEventListener('click', () => this.togglePause());
            this.mobileResetBtn.addEventListener('click', () => this.resetGame());
            this.mobileCenterBtn.addEventListener('click', () => this.togglePause());
        }
        
        // Modal controls
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        this.mainMenuBtn.addEventListener('click', () => this.resetGame());
        this.resumeBtn.addEventListener('click', () => this.togglePause());
        this.pauseResetBtn.addEventListener('click', () => this.resetGame());
        this.modalClose.addEventListener('click', () => this.closeAllModals());
        
        // Modal click outside to close
        this.gameOverModal.addEventListener('click', (e) => {
            if (e.target === this.gameOverModal) this.closeAllModals();
        });
        this.pauseMenu.addEventListener('click', (e) => {
            if (e.target === this.pauseMenu) this.togglePause();
        });
        
        // Settings
        this.soundToggle.addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });
        this.gridToggle.addEventListener('change', (e) => {
            this.gridVisible = e.target.checked;
            this.draw();
        });
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.adjustDifficulty();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Mobile touch controls
        this.setupMobileControls();
        
        // Touch/swipe controls on canvas
        this.setupTouchControls();
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Window events
        window.addEventListener('blur', () => {
            if (this.gameRunning && !this.gamePaused) {
                this.togglePause();
            }
        });
        
        // Resize handler
        window.addEventListener('resize', () => this.handleResize());
        
        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 500);
        });
        
        // Button hover effects
        this.addButtonEffects();
    }
    
    setupMobileControls() {
        if (!this.isMobile) return;
        
        // Mobile directional buttons
        const mobileButtons = document.querySelectorAll('.mobile-btn[data-direction]');
        mobileButtons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleMobileDirection(direction);
                this.addTouchFeedback(btn);
            });
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleMobileDirection(direction);
            });
        });
    }
    
    setupTouchControls() {
        if (!this.isMobile) return;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!e.changedTouches[0]) return;
            
            const touch = e.changedTouches[0];
            this.touchEndX = touch.clientX;
            this.touchEndY = touch.clientY;
            this.handleSwipe();
        }, { passive: false });
        
        // Prevent scrolling on canvas
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        if (Math.max(absDeltaX, absDeltaY) < this.minSwipeDistance) {
            return; // Swipe too short
        }
        
        if (absDeltaX > absDeltaY) {
            // Horizontal swipe
            if (deltaX > 0) {
                this.changeDirection(1, 0); // Right
            } else {
                this.changeDirection(-1, 0); // Left
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                this.changeDirection(0, 1); // Down
            } else {
                this.changeDirection(0, -1); // Up
            }
        }
    }
    
    handleMobileDirection(direction) {
        switch(direction) {
            case 'up':
                this.changeDirection(0, -1);
                break;
            case 'down':
                this.changeDirection(0, 1);
                break;
            case 'left':
                this.changeDirection(-1, 0);
                break;
            case 'right':
                this.changeDirection(1, 0);
                break;
        }
    }
    
    addTouchFeedback(element) {
        element.style.transform = 'scale(0.9)';
        element.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 100);
        
        if (this.soundEnabled) {
            this.playSound('click');
        }
    }
    
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = this.detectMobile();
        
        // Update canvas size if needed
        const newSize = this.getOptimalCanvasSize();
        if (newSize !== this.canvasSize) {
            this.canvasSize = newSize;
            this.setupCanvas();
            this.draw();
        }
        
        // Show/hide mobile controls
        if (this.isMobile && this.mobileControls) {
            this.mobileControls.style.display = 'block';
        } else if (this.mobileControls) {
            this.mobileControls.style.display = 'none';
        }
        
        // Re-setup touch controls if mobile state changed
        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                this.setupTouchControls();
            }
        }
    }
    
    addButtonEffects() {
        const buttons = document.querySelectorAll('.btn, .mobile-btn, .mobile-action-btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (!btn.disabled && this.soundEnabled && !this.isMobile) {
                    this.playSound('hover');
                }
            });
            
            btn.addEventListener('click', () => {
                if (!btn.disabled) {
                    if (this.soundEnabled) this.playSound('click');
                    this.addClickEffect(btn);
                }
            });
        });
    }
    
    addClickEffect(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }
    
    init() {
        this.updateUI();
        this.generateFood();
        this.updateLeaderboard();
        this.updateAchievements();
        this.draw();
        this.updateGameStatus('Pressione INICIAR para começar');
        this.startFPSCounter();
        
        // Show mobile controls if on mobile
        if (this.isMobile && this.mobileControls) {
            this.mobileControls.style.display = 'block';
        }
    }
    
    startFPSCounter() {
        const updateFPS = (timestamp) => {
            this.frameCount++;
            if (timestamp - this.lastTime >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastTime = timestamp;
                if (this.fpsCounterElement) {
                    this.fpsCounterElement.textContent = `FPS: ${this.fps}`;
                }
            }
            requestAnimationFrame(updateFPS);
        };
        requestAnimationFrame(updateFPS);
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch(type) {
                case 'eat':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
                    break;
                case 'specialEat':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
                    break;
                case 'gameOver':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.8);
                    break;
                case 'levelUp':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.3);
                    break;
                case 'achievement':
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.2);
                    break;
                case 'click':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    break;
                case 'hover':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    break;
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (type === 'gameOver' ? 0.8 : 0.2));
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + (type === 'gameOver' ? 0.8 : 0.2));
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }
    
    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                this.changeDirection(0, -1);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                this.changeDirection(0, 1);
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.changeDirection(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.changeDirection(1, 0);
                break;
            case ' ':
                e.preventDefault();
                if (this.gameRunning) {
                    this.togglePause();
                } else {
                    this.startGame();
                }
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                this.resetGame();
                break;
            case 'Escape':
                e.preventDefault();
                if (this.gameRunning) {
                    this.togglePause();
                }
                break;
        }
    }
    
    changeDirection(newDx, newDy) {
        // Prevent reverse direction
        if (this.dx === -newDx && this.dy === -newDy) return;
        // Prevent changing direction if not moving
        if (this.dx === 0 && this.dy === 0 && !this.gameRunning) return;
        
        this.dx = newDx;
        this.dy = newDy;
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameStartTime = Date.now();
        
        // Update both desktop and mobile buttons
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        if (this.mobileStartBtn) {
            this.mobileStartBtn.disabled = true;
            this.mobilePauseBtn.disabled = false;
        }
        
        // Start moving right if no direction is set
        if (this.dx === 0 && this.dy === 0) {
            this.dx = 1;
            this.dy = 0;
        }
        
        this.updateGameStatus('Jogo em andamento...');
        this.updateButtonText();
        this.closeAllModals();
        this.gameLoop();
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        this.updateButtonText();
        
        if (this.gamePaused) {
            this.updateGameStatus('Jogo pausado');
            this.showPauseMenu();
            this.clearGameLoop();
        } else {
            this.updateGameStatus('Jogo em andamento...');
            this.closeAllModals();
            this.gameLoop();
        }
    }
    
    resetGame() {
        this.clearGameLoop();
        this.gameRunning = false;
        this.gamePaused = false;
        this.snake = [{x: Math.floor(this.tileCount/2), y: Math.floor(this.tileCount/2)}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.speed = 1;
        this.gameSpeed = this.getDifficultySpeed();
        this.gameTime = 0;
        this.foodEaten = 0;
        this.maxLength = 1;
        this.specialFood = null;
        
        this.updateUI();
        this.generateFood();
        this.draw();
        this.updateGameStatus(this.isMobile ? 'Toque INICIAR para começar' : 'Pressione INICIAR para começar');
        
        // Update both desktop and mobile buttons
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        if (this.mobileStartBtn) {
            this.mobileStartBtn.disabled = false;
            this.mobilePauseBtn.disabled = true;
        }
        
        this.updateButtonText();
        this.closeAllModals();
    }
    
    restartGame() {
        this.resetGame();
        setTimeout(() => this.startGame(), 100);
    }
    
    adjustDifficulty() {
        if (this.gameRunning) {
            this.gameSpeed = this.getDifficultySpeed();
        }
    }
    
    getDifficultySpeed() {
        const speeds = {
            easy: 200,
            normal: 150,
            hard: 100,
            extreme: 80
        };
        return speeds[this.difficulty] || 150;
    }
    
    updateButtonText() {
        // Desktop buttons
        const pauseIcon = this.pauseBtn.querySelector('.btn-icon');
        const pauseText = this.pauseBtn.querySelector('.btn-text');
        
        if (this.gamePaused) {
            pauseIcon.textContent = '▶';
            pauseText.textContent = 'CONTINUAR';
        } else {
            pauseIcon.textContent = '⏸';
            pauseText.textContent = 'PAUSAR';
        }
        
        // Mobile buttons
        if (this.mobilePauseBtn) {
            const mobilePauseIcon = this.mobilePauseBtn.querySelector('.btn-icon');
            if (this.gamePaused) {
                mobilePauseIcon.textContent = '▶';
                this.mobilePauseBtn.innerHTML = '<span class="btn-icon">▶</span>CONTINUAR';
            } else {
                mobilePauseIcon.textContent = '⏸';
                this.mobilePauseBtn.innerHTML = '<span class="btn-icon">⏸</span>PAUSAR';
            }
        }
        
        // Update center mobile button
        if (this.mobileCenterBtn) {
            this.mobileCenterBtn.textContent = this.gamePaused ? '▶' : '⏸';
        }
    }
    
    updateGameStatus(message) {
        this.gameStatusElement.textContent = message;
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.highScoreElement.textContent = this.highScore;
        this.levelElement.textContent = this.level;
        this.speedElement.textContent = this.speed + 'x';
        
        // Update game time
        if (this.gameRunning && !this.gamePaused) {
            this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
        
        // Ensure food doesn't spawn on snake
        for (let segment of this.snake) {
            if (segment.x === this.food.x && segment.y === this.food.y) {
                this.generateFood();
                return;
            }
        }
        
        // 10% chance to generate special food
        if (Math.random() < 0.1 && !this.specialFood) {
            this.generateSpecialFood();
        }
    }
    
    generateSpecialFood() {
        this.specialFood = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount),
            type: Math.random() < 0.5 ? 'bonus' : 'speed',
            timeLeft: 100 // frames
        };
        
        // Ensure special food doesn't spawn on snake or regular food
        for (let segment of this.snake) {
            if (segment.x === this.specialFood.x && segment.y === this.specialFood.y) {
                this.generateSpecialFood();
                return;
            }
        }
        
        if (this.specialFood.x === this.food.x && this.specialFood.y === this.food.y) {
            this.generateSpecialFood();
            return;
        }
    }
    
    update() {
        if (this.gamePaused) return;
        
        this.updateUI();
        
        const head = {
            x: this.snake[0].x + this.dx,
            y: this.snake[0].y + this.dy
        };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.eatFood();
        } else if (this.specialFood && head.x === this.specialFood.x && head.y === this.specialFood.y) {
            this.eatSpecialFood();
        } else {
            this.snake.pop();
        }
        
        // Update special food timer
        if (this.specialFood) {
            this.specialFood.timeLeft--;
            if (this.specialFood.timeLeft <= 0) {
                this.specialFood = null;
            }
        }
        
        // Check achievements
        this.checkAchievements();
    }
    
    eatFood() {
        this.score += 10 * this.level;
        this.foodEaten++;
        this.maxLength = Math.max(this.maxLength, this.snake.length);
        
        this.updateLevel();
        this.generateFood();
        this.playSound('eat');
        this.checkAchievements();
        
        // Add visual effect
        this.addFoodEffect(this.food);
    }
    
    eatSpecialFood() {
        if (this.specialFood.type === 'bonus') {
            this.score += 50 * this.level;
        } else if (this.specialFood.type === 'speed') {
            // Temporary speed boost
            const originalSpeed = this.gameSpeed;
            this.gameSpeed = Math.max(50, this.gameSpeed - 30);
            setTimeout(() => {
                this.gameSpeed = originalSpeed;
            }, 5000);
        }
        
        this.playSound('specialEat');
        this.addFoodEffect(this.specialFood, true);
        this.specialFood = null;
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.foodEaten / 5) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.speed = Math.min(10, Math.floor(this.level / 2) + 1);
            this.gameSpeed = Math.max(50, this.getDifficultySpeed() - (this.level * 5));
            this.playSound('levelUp');
        }
    }
    
    addFoodEffect(foodPos, isSpecial = false) {
        const canvas = this.canvas;
        const rect = canvas.getBoundingClientRect();
        
        // Create particle effect
        for (let i = 0; i < (isSpecial ? 12 : 6); i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.background = isSpecial ? '#00d4ff' : '#ff6b35';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            const startX = rect.left + (foodPos.x * this.gridSize) + (this.gridSize / 2);
            const startY = rect.top + (foodPos.y * this.gridSize) + (this.gridSize / 2);
            
            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            
            document.body.appendChild(particle);
            
            // Animate particle
            const angle = (i / (isSpecial ? 12 : 6)) * Math.PI * 2;
            const distance = isSpecial ? 80 : 50;
            const endX = startX + Math.cos(angle) * distance;
            const endY = startY + Math.sin(angle) * distance;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0)`, opacity: 0 }
            ], {
                duration: isSpecial ? 800 : 500,
                easing: 'ease-out'
            }).onfinish = () => {
                document.body.removeChild(particle);
            };
        }
    }
    checkAchievements() {
        const newAchievements = [];
        
        // First Apple
        if (!this.achievements.firstApple.unlocked && this.foodEaten >= 1) {
            this.achievements.firstApple.unlocked = true;
            newAchievements.push('firstApple');
        }
        
        // Speedster
        if (!this.achievements.speedster.unlocked && this.speed >= 5) {
            this.achievements.speedster.unlocked = true;
            newAchievements.push('speedster');
        }
        
        // Giant
        if (!this.achievements.giant.unlocked && this.snake.length >= 50) {
            this.achievements.giant.unlocked = true;
            newAchievements.push('giant');
        }
        
        // Survivor
        if (!this.achievements.survivor.unlocked && this.gameTime >= 300) {
            this.achievements.survivor.unlocked = true;
            newAchievements.push('survivor');
        }
        
        // Scorer
        if (!this.achievements.scorer.unlocked && this.score >= 1000) {
            this.achievements.scorer.unlocked = true;
            newAchievements.push('scorer');
        }
        
        if (newAchievements.length > 0) {
            this.showAchievements(newAchievements);
            this.updateAchievements();
            this.playSound('achievement');
        }
    }
    
    showAchievements(achievements) {
        achievements.forEach(key => {
            const achievement = this.achievements[key];
            const notification = document.createElement('div');
            notification.className = 'achievement-notification';
            notification.textContent = `🏆 ${achievement.name} desbloqueada!`;
            this.achievementsEarnedElement.appendChild(notification);
        });

        // Add special visual effects for achievements
        achievements.forEach((key, index) => {
            setTimeout(() => {
                // Create achievement popup
                const popup = document.createElement('div');
                popup.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(45deg, #ff8500, #ffff00);
                    color: #000;
                    padding: 15px 20px;
                    border-radius: 10px;
                    font-family: 'Orbitron', monospace;
                    font-weight: 700;
                    font-size: 14px;
                    box-shadow: 0 10px 30px rgba(255, 133, 0, 0.5);
                    z-index: 2000;
                    animation: slideInRight 0.5s ease-out, fadeOut 0.5s ease-in 3s forwards;
                    pointer-events: none;
                `;
                
                const achievement = this.achievements[key];
                popup.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">${this.getAchievementIcon(key)}</span>
                        <div>
                            <div style="font-size: 12px; opacity: 0.8;">CONQUISTA DESBLOQUEADA</div>
                            <div>${achievement.name}</div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(popup);
                
                // Remove popup after animation
                setTimeout(() => {
                    if (popup.parentNode) {
                        popup.parentNode.removeChild(popup);
                    }
                }, 3500);
                
            }, index * 500);
        });
    }
    
    updateAchievements() {
        this.achievementsListElement.innerHTML = '';
        Object.keys(this.achievements).forEach(key => {
            const achievement = this.achievements[key];
            const element = document.createElement('div');
            element.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            
            element.innerHTML = `
                <div class="achievement-icon">${this.getAchievementIcon(key)}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.desc}</div>
                </div>
            `;
            
            this.achievementsListElement.appendChild(element);
        });
    }

    
    getAchievementIcon(key) {
        const icons = {
            firstApple: '🥇',
            speedster: '🏃',
            giant: '📏',
            survivor: '⏰',
            scorer: '💯'
        };
        return icons[key] || '🏆';
    }
    
    updateLeaderboard() {
        this.leaderboardElement.innerHTML = '';
        
        if (this.leaderboard.length === 0) {
            const emptyEntry = document.createElement('div');
            emptyEntry.className = 'score-entry';
            emptyEntry.innerHTML = `
                <span class="rank">#1</span>
                <span class="points">0</span>
            `;
            this.leaderboardElement.appendChild(emptyEntry);
            return;
        }
        
        this.leaderboard.slice(0, 5).forEach((score, index) => {
            const entry = document.createElement('div');
            entry.className = 'score-entry';
            entry.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span class="points">${score}</span>
            `;
            this.leaderboardElement.appendChild(entry);
        });
    }
    
    draw() {
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.5, '#0a0a0a');
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw grid
        if (this.gridVisible) {
            this.drawGrid();
        }
        
        // Draw snake
        this.drawSnake();
        
        // Draw food
        this.drawFood();
        
        // Draw special food
        if (this.specialFood) {
            this.drawSpecialFood();
        }
        
        // Draw pause overlay
        if (this.gamePaused) {
            this.drawPauseOverlay();
        }
        
        // Update mini map
        this.drawMiniMap();
    }
    
    drawGrid() {
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.08)';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.tileCount; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, canvasHeight);
            this.ctx.stroke();
            
            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(canvasWidth, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (i === 0) {
                // Head with gradient and glow
                const headGradient = this.ctx.createRadialGradient(
                    x + this.gridSize/2, y + this.gridSize/2, 0,
                    x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2
                );
                headGradient.addColorStop(0, '#00ff88');
                headGradient.addColorStop(1, '#00cc70');
                
                this.ctx.fillStyle = headGradient;
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                
                // Head glow
                this.ctx.shadowColor = '#00ff88';
                this.ctx.shadowBlur = 15;
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                this.ctx.shadowBlur = 0;
                
                // Eyes based on direction
                this.ctx.fillStyle = '#000';
                const eyeSize = Math.max(2, this.gridSize / 8);
                let eyeOffset = this.gridSize / 4;
                
                if (this.dx === 1) { // Moving right
                    this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                } else if (this.dx === -1) { // Moving left
                    this.ctx.fillRect(x + eyeOffset, y + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                } else if (this.dy === -1) { // Moving up
                    this.ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
                } else { // Moving down
                    this.ctx.fillRect(x + eyeOffset, y + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                }
                
            } else {
                // Body with gradient and fading effect
                const alpha = Math.max(0.4, 1 - (i / this.snake.length) * 0.6);
                const bodyGradient = this.ctx.createRadialGradient(
                    x + this.gridSize/2, y + this.gridSize/2, 0,
                    x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2
                );
                bodyGradient.addColorStop(0, `rgba(0, 255, 136, ${alpha})`);
                bodyGradient.addColorStop(1, `rgba(0, 204, 112, ${alpha * 0.7})`);
                
                this.ctx.fillStyle = bodyGradient;
                const padding = Math.min(4, i * 0.2 + 3);
                this.ctx.fillRect(x + padding, y + padding, this.gridSize - padding * 2, this.gridSize - padding * 2);
            }
        }
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Food glow effect
        this.ctx.shadowColor = '#ff0080';
        this.ctx.shadowBlur = 20;
        
        // Food gradient with pulsing effect
        const pulseScale = 0.9 + Math.sin(Date.now() * 0.01) * 0.1;
        const foodGradient = this.ctx.createRadialGradient(
            x + this.gridSize/2, y + this.gridSize/2, 0,
            x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2 * pulseScale
        );
        foodGradient.addColorStop(0, '#ff6b35');
        foodGradient.addColorStop(0.7, '#ff0080');
        foodGradient.addColorStop(1, '#cc0066');
        
        this.ctx.fillStyle = foodGradient;
        this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
        
        // Food highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fillRect(x + 6, y + 6, this.gridSize - 12, this.gridSize - 12);
        
        this.ctx.shadowBlur = 0;
    }
    
    drawSpecialFood() {
        const x = this.specialFood.x * this.gridSize;
        const y = this.specialFood.y * this.gridSize;
        
        // Special food colors based on type
        const colors = {
            bonus: { primary: '#ffd700', secondary: '#ffea00', glow: '#ffd700' },
            speed: { primary: '#00d4ff', secondary: '#0099cc', glow: '#00d4ff' }
        };
        
        const color = colors[this.specialFood.type];
        
        // Animated glow
        this.ctx.shadowColor = color.glow;
        this.ctx.shadowBlur = 25;
        
        // Rotating effect
        const rotation = Date.now() * 0.005;
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(rotation);
        this.ctx.translate(-centerX, -centerY);
        
        // Special food gradient
        const specialGradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, this.gridSize/2
        );
        specialGradient.addColorStop(0, color.primary);
        specialGradient.addColorStop(1, color.secondary);
        
        this.ctx.fillStyle = specialGradient;
        this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
        
        this.ctx.restore();
        this.ctx.shadowBlur = 0;
        
        // Timer indicator
        const timerProgress = this.specialFood.timeLeft / 100;
        this.ctx.strokeStyle = color.primary;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.gridSize/2 + 3, 0, Math.PI * 2 * timerProgress);
        this.ctx.stroke();
    }
    
    drawPauseOverlay() {
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Pause text with glow
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = `bold ${Math.min(48, canvasWidth / 12)}px Orbitron`;
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 30;
        this.ctx.fillText('PAUSADO', canvasWidth / 2, canvasHeight / 2);
        this.ctx.shadowBlur = 0;
        
        // Instructions
        this.ctx.fillStyle = '#ccc';
        this.ctx.font = `${Math.min(16, canvasWidth / 25)}px Orbitron`;
        const instructionText = this.isMobile ? 'Toque para continuar' : 'Pressione ESC ou ESPAÇO para continuar';
        this.ctx.fillText(instructionText, canvasWidth / 2, canvasHeight / 2 + 40);
    }
    
    drawMiniMap() {
        const ctx = this.miniMapCtx;
        const scale = this.miniMapScale;
        
        // Clear mini map
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.miniMapCanvas.width, this.miniMapCanvas.height);
        
        // Draw border
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, this.miniMapCanvas.width, this.miniMapCanvas.height);
        
        // Draw snake
        ctx.fillStyle = '#00ff88';
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const size = Math.max(1, this.gridSize * scale * (i === 0 ? 1 : 0.8));
            ctx.fillRect(
                segment.x * this.gridSize * scale,
                segment.y * this.gridSize * scale,
                size,
                size
            );
        }
        
        // Draw food
        ctx.fillStyle = '#ff0080';
        ctx.fillRect(
            this.food.x * this.gridSize * scale,
            this.food.y * this.gridSize * scale,
            this.gridSize * scale,
            this.gridSize * scale
        );
        
        // Draw special food
        if (this.specialFood) {
            ctx.fillStyle = this.specialFood.type === 'bonus' ? '#ffd700' : '#00d4ff';
            ctx.fillRect(
                this.specialFood.x * this.gridSize * scale,
                this.specialFood.y * this.gridSize * scale,
                this.gridSize * scale,
                this.gridSize * scale
            );
        }
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.update();
        this.draw();
        
        this.gameLoopTimeout = setTimeout(() => this.gameLoop(), this.gameSpeed);
    }
    
    clearGameLoop() {
        if (this.gameLoopTimeout) {
            clearTimeout(this.gameLoopTimeout);
            this.gameLoopTimeout = null;
        }
    }
    
    gameOver() {
        this.clearGameLoop();
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.playSound('gameOver');
        this.updateGameStatus('Game Over!');
        
        // Update both desktop and mobile buttons
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        if (this.mobileStartBtn) {
            this.mobileStartBtn.disabled = false;
            this.mobilePauseBtn.disabled = true;
        }
        
        this.updateButtonText();
        
        // Check for new high score
        let isNewRecord = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            isNewRecord = true;
        }
        
        // Update leaderboard
        this.updateLeaderboardWithScore(this.score);
        
        // Show game over modal
        this.showGameOverModal(isNewRecord);
    }
    
    updateLeaderboardWithScore(score) {
        this.leaderboard.push(score);
        this.leaderboard.sort((a, b) => b - a);
        this.leaderboard = this.leaderboard.slice(0, 10); // Keep top 10
        this.saveLeaderboard();
        this.updateLeaderboard();
    }
    
    showGameOverModal(isNewRecord) {
        this.finalScoreElement.textContent = this.score;
        this.finalLevelElement.textContent = this.level;
        this.gameTimeElement.textContent = this.formatTime(this.gameTime);
        this.newRecordElement.style.display = isNewRecord ? 'block' : 'none';
        
        // Clear previous achievements
        this.achievementsEarnedElement.innerHTML = '';
        
        this.gameOverModal.style.display = 'block';
    }
    
    showPauseMenu() {
        this.pauseScoreElement.textContent = this.score;
        this.pauseLevelElement.textContent = this.level;
        this.pauseTimeElement.textContent = this.formatTime(this.gameTime);
        this.pauseMenu.style.display = 'block';
    }
    
    closeAllModals() {
        this.gameOverModal.style.display = 'none';
        this.pauseMenu.style.display = 'none';
    }
    
    getStoredHighScore() {
        // For Claude.ai compatibility, use in-memory storage
        return this.highScore || 0;
    }
    
    saveHighScore() {
        // In a real environment, this would use localStorage
        // localStorage.setItem('snakeHighScore', this.highScore);
    }
    
    getStoredLeaderboard() {
        // For Claude.ai compatibility, use in-memory storage
        return this.leaderboard || [];
    }
    
    saveLeaderboard() {
        // In a real environment, this would use localStorage
        // localStorage.setItem('snakeLeaderboard', JSON.stringify(this.leaderboard));
    }
}

 // Button back
    document.addEventListener('DOMContentLoaded', function() {
        const voltarBtn = document.getElementById('solveBtn');
        
        if (voltarBtn) {
            voltarBtn.addEventListener('click', function() {
                // Detectar se estamos em um subdiretório de jogos
                const currentPath = window.location.pathname;
                let homePath;
                
                if (currentPath.includes('/jogos/')) {
                    // Estamos em um jogo, subir dois níveis
                    homePath = '../../index.html';
                } else {
                    // Estamos em uma página de primeiro nível
                    homePath = '../index.html';
                }
                
                window.location.href = homePath;
            });
        }
    });

    // =========================================

    // Usando history.back() se quiser voltar à página anterior
    document.addEventListener('DOMContentLoaded', function() {
        const voltarBtn = document.getElementById('solveBtn');
        
        if (voltarBtn) {
            voltarBtn.addEventListener('click', function() {
                // Voltar à página anterior no histórico
                window.history.back();
            });
        }
    }); 

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new DesktopSnakeGame();
    
    // Add extra visual effects for desktop
    const canvas = document.getElementById('gameCanvas');
    
    // Only add hover effects on non-mobile devices
    if (!game.isMobile) {
        canvas.addEventListener('mouseenter', () => {
            canvas.style.transform = 'scale(1.01)';
            canvas.style.transition = 'transform 0.3s ease';
        });
        
        canvas.addEventListener('mouseleave', () => {
            canvas.style.transform = 'scale(1)';
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Redraw canvas on resize with debouncing
        clearTimeout(game.resizeTimeout);
        game.resizeTimeout = setTimeout(() => {
            game.handleResize();
        }, 250);
    });
    
    // Prevent browser zoom affecting game
    document.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Prevent pull-to-refresh on mobile
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Add performance monitoring for desktop only
    if (!game.isMobile) {
        let lastFrameTime = performance.now();
        function monitorPerformance() {
            const currentTime = performance.now();
            const frameDelta = currentTime - lastFrameTime;
            
            if (frameDelta > 20) { // If frame takes longer than 20ms (50fps)
                console.warn('Performance warning: Frame took', frameDelta.toFixed(2), 'ms');
            }
            
            lastFrameTime = currentTime;
            requestAnimationFrame(monitorPerformance);
        }
        monitorPerformance();
    }
    
    // Add keyboard shortcuts help
    console.log('🐍 Snake Game - Responsive Edition');
    console.log('Controles:');
    if (game.isMobile) {
        console.log('  Toque: Use os botões na tela');
        console.log('  Deslize: Deslize na tela do jogo para mover');
    } else {
        console.log('  ↑↓←→ ou WASD: Mover');
        console.log('  ESPAÇO: Pausar/Continuar');
        console.log('  R: Reiniciar');
        console.log('  ESC: Menu de pausa');
    }
    
    // Add service worker registration for PWA capabilities (if available)
    if ('serviceWorker' in navigator && !game.isMobile) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker not available, ignore
        });
    }
    
    // Add visibility change handler to auto-pause
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && game.gameRunning && !game.gamePaused) {
            game.togglePause();
        }
    });
    
    // Add focus/blur handlers for better mobile experience
    window.addEventListener('focus', () => {
        if (game.isMobile && game.gamePaused && game.gameRunning) {
            // Don't auto-resume on mobile, let user decide
        }
    });
    
    // Prevent accidental navigation on mobile
    if (game.isMobile) {
        let prevent = false;
        document.addEventListener('touchmove', (e) => {
            if (prevent) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Only prevent when touching the game area
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            gameArea.addEventListener('touchstart', () => {
                prevent = true;
            });
            
            gameArea.addEventListener('touchend', () => {
                prevent = false;
            });
        }
    }
});
        