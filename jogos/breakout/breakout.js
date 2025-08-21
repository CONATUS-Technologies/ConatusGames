class BreakoutGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewCtx = this.previewCanvas.getContext('2d');
        
        // Game settings
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        
        // Responsive settings
        this.isMobile = this.detectMobile();
        this.setupCanvas();
        
        // Game objects
        this.paddle = {
            width: 100,
            height: 15,
            x: 0,
            y: 0,
            speed: 8,
            color: '#00ff88'
        };
        
        this.balls = [];
        this.bricks = [];
        this.powerUps = [];
        this.particles = [];
        this.lasers = [];
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.highScore = this.getStoredHighScore();
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameStartTime = 0;
        this.gameTime = 0;
        this.ballsLaunched = 0;
        this.ballsHit = 0;
        
        // Level data
        this.totalBricks = 0;
        this.bricksDestroyed = 0;
        
        // Power-up system
        this.activePowerUps = new Map();
        this.powerUpTypes = {
            WIDE_PADDLE: { duration: 10000, icon: '📏', name: 'Raquete Larga' },
            FAST_BALL: { duration: 8000, icon: '⚡', name: 'Bola Rápida' },
            FIRE_BALL: { duration: 12000, icon: '🔥', name: 'Bola de Fogo' },
            MULTI_BALL: { duration: 0, icon: '💥', name: 'Multi-Bola' },
            LASER: { duration: 15000, icon: '🎯', name: 'Laser' }
        };
        
        // Settings
        this.soundEnabled = true;
        this.particlesEnabled = true;
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
        this.paddleMoving = false;
        
        // Achievements
        this.achievements = {
            firstBreak: { unlocked: false, name: 'Primeira Quebra', desc: 'Destrua seu primeiro tijolo' },
            perfectLevel: { unlocked: false, name: 'Demolidor', desc: 'Complete um nível sem perder vidas' },
            sniper: { unlocked: false, name: 'Atirador Elite', desc: 'Mantenha 90% de precisão' },
            comboMaster: { unlocked: false, name: 'Combo Master', desc: 'Faça um combo de 10x' },
            survivor: { unlocked: false, name: 'Sobrevivente', desc: 'Chegue ao nível 10' }
        };
        
        // Leaderboard
        this.leaderboard = this.getStoredLeaderboard();
        
        // Brick colors by level
        this.brickColors = [
            '#ff0000', '#ff8500', '#ffff00', '#00ff00', 
            '#00f5ff', '#0080ff', '#9d4edd', '#ff0080'
        ];
        
        // DOM elements
        this.initializeElements();
        this.setupEventListeners();
        this.init();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
               window.innerWidth <= 768;
    }
    
    setupCanvas() {
        // Handle high DPI displays
        const devicePixelRatio = window.devicePixelRatio || 1;
        if (devicePixelRatio > 1) {
            this.canvas.style.width = this.canvas.width + 'px';
            this.canvas.style.height = this.canvas.height + 'px';
            this.canvas.width = this.canvas.width * devicePixelRatio;
            this.canvas.height = this.canvas.height * devicePixelRatio;
            this.ctx.scale(devicePixelRatio, devicePixelRatio);
            
            this.previewCanvas.style.width = this.previewCanvas.width + 'px';
            this.previewCanvas.style.height = this.previewCanvas.height + 'px';
            this.previewCanvas.width = this.previewCanvas.width * devicePixelRatio;
            this.previewCanvas.height = this.previewCanvas.height * devicePixelRatio;
            this.previewCtx.scale(devicePixelRatio, devicePixelRatio);
        }
        
        this.canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        this.canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.levelElement = document.getElementById('level');
        this.comboElement = document.getElementById('combo');
        this.highScoreElement = document.getElementById('highScore');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.fpsCounterElement = document.getElementById('fpsCounter');
        this.bricksLeftElement = document.getElementById('bricksLeft');
        this.progressFillElement = document.getElementById('progressFill');
        this.accuracyElement = document.getElementById('accuracy');
        this.activePowerUpsElement = document.getElementById('activePowerUps');
        
        // Control buttons
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Mobile control buttons
        this.mobileStartBtn = document.getElementById('mobileStartBtn');
        this.mobilePauseBtn = document.getElementById('mobilePauseBtn');
        this.mobileResetBtn = document.getElementById('mobileResetBtn');
        
        // Settings
        this.soundToggle = document.getElementById('soundToggle');
        this.particlesToggle = document.getElementById('particlesToggle');
        this.difficultySelect = document.getElementById('difficultySelect');
        
        // Modals
        this.gameOverModal = document.getElementById('gameOverModal');
        this.pauseMenu = document.getElementById('pauseMenu');
        this.levelCompleteModal = document.getElementById('levelCompleteModal');
        this.powerUpEffect = document.getElementById('powerUpEffect');
        
        // Final stats
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalLevelElement = document.getElementById('finalLevel');
        this.finalAccuracyElement = document.getElementById('finalAccuracy');
        this.gameTimeElement = document.getElementById('gameTime');
        this.newRecordElement = document.getElementById('newRecord');
        
        // Modal buttons
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.mainMenuBtn = document.getElementById('mainMenuBtn');
        this.modalClose = document.getElementById('modalClose');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.pauseResetBtn = document.getElementById('pauseResetBtn');
        this.nextLevelBtn = document.getElementById('nextLevelBtn');
        
        // Lists
        this.leaderboardElement = document.getElementById('leaderboard');
        this.achievementsListElement = document.getElementById('achievementsList');
        this.achievementsEarnedElement = document.getElementById('achievementsEarned');
        
        // Pause stats
        this.pauseScoreElement = document.getElementById('pauseScore');
        this.pauseLevelElement = document.getElementById('pauseLevel');
        this.pauseLivesElement = document.getElementById('pauseLives');
        this.pauseTimeElement = document.getElementById('pauseTime');
        
        // Level complete elements
        this.levelBonusElement = document.getElementById('levelBonus');
        this.livesBonusElement = document.getElementById('livesBonus');
        this.accuracyBonusElement = document.getElementById('accuracyBonus');
        this.nextLevelTitleElement = document.getElementById('nextLevelTitle');
        this.nextLevelDescriptionElement = document.getElementById('nextLevelDescription');
        this.nextLevelNameElement = document.getElementById('nextLevelName');
        this.nextLevelBonusElement = document.getElementById('nextLevelBonus');
        
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
        }
        
        // Modal controls
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        this.mainMenuBtn.addEventListener('click', () => this.resetGame());
        this.resumeBtn.addEventListener('click', () => this.togglePause());
        this.pauseResetBtn.addEventListener('click', () => this.resetGame());
        this.nextLevelBtn.addEventListener('click', () => this.nextLevel());
        this.modalClose.addEventListener('click', () => this.closeAllModals());
        
        // Modal click outside to close
        this.gameOverModal.addEventListener('click', (e) => {
            if (e.target === this.gameOverModal) this.closeAllModals();
        });
        this.pauseMenu.addEventListener('click', (e) => {
            if (e.target === this.pauseMenu) this.togglePause();
        });
        this.levelCompleteModal.addEventListener('click', (e) => {
            if (e.target === this.levelCompleteModal) this.nextLevel();
        });
        
        // Settings
        this.soundToggle.addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });
        this.particlesToggle.addEventListener('change', (e) => {
            this.particlesEnabled = e.target.checked;
        });
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.adjustDifficulty();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mouse controls
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
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
        
        // Mobile action buttons
        const mobileButtons = document.querySelectorAll('.mobile-btn[data-action]');
        mobileButtons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.handleMobileAction(action, true);
                this.addTouchFeedback(btn);
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.handleMobileAction(action, false);
            });
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.handleMobileAction(action, true);
                setTimeout(() => this.handleMobileAction(action, false), 100);
            });
        });
    }
    
    setupTouchControls() {
        if (!this.isMobile) return;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.touchStartX = touch.clientX - rect.left;
            this.touchStartY = touch.clientY - rect.top;
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const canvasX = (x / rect.width) * this.canvasWidth;
            this.paddle.x = Math.max(0, Math.min(this.canvasWidth - this.paddle.width, canvasX - this.paddle.width / 2));
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!e.changedTouches[0]) return;
            
            const touch = e.changedTouches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.touchEndX = touch.clientX - rect.left;
            this.touchEndY = touch.clientY - rect.top;
            
            // Check if it's a tap (not a swipe)
            const deltaX = Math.abs(this.touchEndX - this.touchStartX);
            const deltaY = Math.abs(this.touchEndY - this.touchStartY);
            
            if (deltaX < 10 && deltaY < 10) {
                this.launchBall();
            }
        }, { passive: false });
    }
    
    handleMobileAction(action, isPressed) {
        switch(action) {
            case 'left':
                if (isPressed) {
                    this.keys = this.keys || {};
                    this.keys['ArrowLeft'] = true;
                } else {
                    this.keys = this.keys || {};
                    this.keys['ArrowLeft'] = false;
                }
                break;
            case 'right':
                if (isPressed) {
                    this.keys = this.keys || {};
                    this.keys['ArrowRight'] = true;
                } else {
                    this.keys = this.keys || {};
                    this.keys['ArrowRight'] = false;
                }
                break;
            case 'launch':
                if (isPressed) {
                    this.launchBall();
                }
                break;
            case 'laser':
                if (isPressed) {
                    this.fireLaser();
                }
                break;
            case 'pause':
                if (isPressed) {
                    this.togglePause();
                }
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
        this.initializePaddle();
        this.createLevel(this.level);
        this.updateUI();
        this.updateLeaderboard();
        this.updateAchievements();
        this.drawPreview();
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
    
    initializePaddle() {
        this.paddle.x = this.canvasWidth / 2 - this.paddle.width / 2;
        this.paddle.y = this.canvasHeight - 30;
    }
    
    createLevel(level) {
        this.bricks = [];
        this.bricksDestroyed = 0;
        
        const rows = Math.min(6 + Math.floor(level / 3), 12);
        const cols = 10;
        const brickWidth = (this.canvasWidth - 40) / cols;
        const brickHeight = 25;
        const startY = 80;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Skip some bricks for interesting patterns
                if (level > 3 && Math.random() < 0.1) continue;
                
                const x = 20 + col * brickWidth;
                const y = startY + row * (brickHeight + 5);
                
                // Determine brick type based on row and level
                let hits = 1;
                if (level > 2 && row < 2) hits = 2;
                if (level > 5 && row < 1) hits = 3;
                
                const colorIndex = Math.min(row % this.brickColors.length, this.brickColors.length - 1);
                
                this.bricks.push({
                    x: x,
                    y: y,
                    width: brickWidth - 2,
                    height: brickHeight,
                    hits: hits,
                    maxHits: hits,
                    color: this.brickColors[colorIndex],
                    powerUp: Math.random() < 0.15 ? this.getRandomPowerUp() : null,
                    points: hits * 10
                });
            }
        }
        
        this.totalBricks = this.bricks.length;
        this.updateProgress();
    }
    
    getRandomPowerUp() {
        const types = Object.keys(this.powerUpTypes);
        return types[Math.floor(Math.random() * types.length)];
    }
    
    createBall() {
        const ball = {
            x: this.paddle.x + this.paddle.width / 2,
            y: this.paddle.y - 15,
            radius: 8,
            dx: 0,
            dy: 0,
            speed: 6,
            launched: false,
            color: '#ffffff',
            trail: []
        };
        
        this.adjustBallSpeed(ball);
        return ball;
    }
    
    adjustBallSpeed(ball) {
        const speeds = {
            easy: 5,
            normal: 6,
            hard: 7,
            extreme: 8
        };
        ball.speed = speeds[this.difficulty] || 6;
        
        // Apply fast ball power-up
        if (this.activePowerUps.has('FAST_BALL')) {
            ball.speed *= 1.5;
        }
    }
    
    launchBall() {
        const unlaunchedBalls = this.balls.filter(ball => !ball.launched);
        if (unlaunchedBalls.length === 0) return;
        
        unlaunchedBalls.forEach(ball => {
            const angle = (Math.random() - 0.5) * Math.PI / 3; // -30° to +30°
            ball.dx = Math.sin(angle) * ball.speed;
            ball.dy = -Math.cos(angle) * ball.speed;
            ball.launched = true;
        });
        
        this.ballsLaunched++;
        this.playSound('launch');
    }
    
    fireLaser() {
        if (!this.activePowerUps.has('LASER')) return;
        
        const laser = {
            x: this.paddle.x + this.paddle.width / 2 - 1.5,
            y: this.paddle.y,
            width: 3,
            height: 0,
            speed: 10,
            maxHeight: this.paddle.y
        };
        
        this.lasers.push(laser);
        this.playSound('laser');
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
                case 'bounce':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
                    break;
                case 'brickHit':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1);
                    break;
                case 'brickBreak':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
                    break;
                case 'powerUp':
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.3);
                    break;
                case 'launch':
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.2);
                    break;
                case 'laser':
                    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
                    break;
                case 'lifeLost':
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.8);
                    break;
                case 'gameOver':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 1.5);
                    break;
                case 'levelComplete':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.5);
                    break;
                case 'combo':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1400, audioContext.currentTime + 0.3);
                    break;
                case 'click':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    break;
                case 'hover':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    break;
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (type === 'gameOver' ? 1.5 : 0.3));
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + (type === 'gameOver' ? 1.5 : 0.3));
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }
    
    handleKeyDown(e) {
        this.keys = this.keys || {};
        this.keys[e.key] = true;
        
        switch(e.key) {
            case ' ':
                e.preventDefault();
                if (this.gameRunning && !this.gamePaused) {
                    this.launchBall();
                } else if (!this.gameRunning) {
                    this.startGame();
                } else {
                    this.togglePause();
                }
                break;
            case 'p':
            case 'P':
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
            case 'c':
            case 'C':
                e.preventDefault();
                this.fireLaser();
                break;
        }
    }
    
    handleKeyUp(e) {
        this.keys = this.keys || {};
        this.keys[e.key] = false;
    }
    
    handleMouseMove(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const canvasX = (x / rect.width) * this.canvasWidth;
        
        this.paddle.x = Math.max(0, Math.min(this.canvasWidth - this.paddle.width, canvasX - this.paddle.width / 2));
    }
    
    handleClick(e) {
        if (!this.gameRunning || this.gamePaused) return;
        this.launchBall();
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameStartTime = Date.now();
        
        // Create initial ball
        this.balls = [this.createBall()];
        
        // Update buttons
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        if (this.mobileStartBtn) {
            this.mobileStartBtn.disabled = true;
            this.mobilePauseBtn.disabled = false;
        }
        
        this.updateGameStatus('Jogo em andamento... Clique para lançar a bola!');
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
        } else {
            this.updateGameStatus('Jogo em andamento...');
            this.closeAllModals();
            this.gameLoop();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.balls = [];
        this.powerUps = [];
        this.particles = [];
        this.lasers = [];
        this.activePowerUps.clear();
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.gameTime = 0;
        this.ballsLaunched = 0;
        this.ballsHit = 0;
        
        this.initializePaddle();
        this.createLevel(this.level);
        this.updateUI();
        this.drawPreview();
        this.draw();
        this.updateGameStatus(this.isMobile ? 'Toque INICIAR para começar' : 'Pressione INICIAR para começar');
        
        // Update buttons
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        if (this.mobileStartBtn) {
            this.mobileStartBtn.disabled = false;
            this.mobilePauseBtn.disabled = true;
        }
        
        this.updateButtonText();
        this.closeAllModals();
        this.removeCssEffect();
    }
    
    restartGame() {
        this.resetGame();
        setTimeout(() => this.startGame(), 100);
    }
    
    nextLevel() {
        this.level++;
        this.lives++; // Bonus life for completing level
        this.createLevel(this.level);
        this.balls = [this.createBall()];
        this.powerUps = [];
        this.particles = [];
        this.lasers = [];
        
        this.updateUI();
        this.drawPreview();
        this.closeAllModals();
        this.gameLoop();
    }
    
    adjustDifficulty() {
        if (this.gameRunning) {
            this.balls.forEach(ball => this.adjustBallSpeed(ball));
        }
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
    }
    
    updateGameStatus(message) {
        this.gameStatusElement.textContent = message;
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.lives;
        this.levelElement.textContent = this.level;
        this.comboElement.textContent = this.combo;
        this.highScoreElement.textContent = this.highScore;
        
        // Update game time
        if (this.gameRunning && !this.gamePaused) {
            this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        }
        
        // Update accuracy
        const accuracy = this.ballsLaunched > 0 ? Math.round((this.ballsHit / this.ballsLaunched) * 100) : 100;
        this.accuracyElement.textContent = accuracy + '%';
        
        this.updateProgress();
        this.updateActivePowerUps();
    }
    
    updateProgress() {
        const remaining = this.bricks.length;
        const destroyed = this.totalBricks - remaining;
        const progress = this.totalBricks > 0 ? (destroyed / this.totalBricks) * 100 : 0;
        
        this.bricksLeftElement.textContent = remaining;
        this.progressFillElement.style.width = progress + '%';
    }
    
    updateActivePowerUps() {
        this.activePowerUpsElement.innerHTML = '';
        
        this.activePowerUps.forEach((timeLeft, type) => {
            const powerUp = this.powerUpTypes[type];
            if (!powerUp) return;
            
            const element = document.createElement('div');
            element.className = 'active-power-up';
            element.textContent = powerUp.icon;
            element.title = powerUp.name;
            
            this.activePowerUpsElement.appendChild(element);
        });
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    update() {
        if (this.gamePaused) return;
        
        this.updateUI();
        this.updatePaddle();
        this.updateBalls();
        this.updatePowerUps();
        this.updateParticles();
        this.updateLasers();
        this.updatePowerUpTimers();
        this.checkWinCondition();
        this.checkAchievements();
    }
    
    updatePaddle() {
        // Handle keyboard input
        if (this.keys) {
            if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
                this.paddle.x = Math.max(0, this.paddle.x - this.paddle.speed);
            }
            if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
                this.paddle.x = Math.min(this.canvasWidth - this.paddle.width, this.paddle.x + this.paddle.speed);
            }
        }
        
        // Update paddle appearance based on power-ups
        if (this.activePowerUps.has('WIDE_PADDLE')) {
            this.paddle.width = 150;
        } else {
            this.paddle.width = 100;
        }
    }
    
    updateBalls() {
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            
            if (!ball.launched) {
                // Ball follows paddle
                ball.x = this.paddle.x + this.paddle.width / 2;
                continue;
            }
            
            // Move ball
            ball.x += ball.dx;
            ball.y += ball.dy;
            
            // Update trail
            ball.trail.push({ x: ball.x, y: ball.y });
            if (ball.trail.length > 5) {
                ball.trail.shift();
            }
            
            // Wall collisions
            if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= this.canvasWidth) {
                ball.dx = -ball.dx;
                ball.x = Math.max(ball.radius, Math.min(this.canvasWidth - ball.radius, ball.x));
                this.playSound('bounce');
                this.createParticles(ball.x, ball.y, '#00f5ff', 3);
            }
            
            if (ball.y - ball.radius <= 0) {
                ball.dy = -ball.dy;
                ball.y = ball.radius;
                this.playSound('bounce');
                this.createParticles(ball.x, ball.y, '#00f5ff', 3);
            }
            
            // Paddle collision
            if (this.checkBallPaddleCollision(ball)) {
                this.handleBallPaddleCollision(ball);
            }
            
            // Brick collisions
            this.checkBallBrickCollisions(ball);
            
            // Ball falls off screen
            if (ball.y > this.canvasHeight) {
                this.balls.splice(i, 1);
                
                // Check if all balls are lost
                if (this.balls.length === 0) {
                    this.loseLife();
                }
            }
        }
    }
    
    checkBallPaddleCollision(ball) {
        return ball.x + ball.radius > this.paddle.x &&
               ball.x - ball.radius < this.paddle.x + this.paddle.width &&
               ball.y + ball.radius > this.paddle.y &&
               ball.y - ball.radius < this.paddle.y + this.paddle.height &&
               ball.dy > 0;
    }
    
    handleBallPaddleCollision(ball) {
        // Calculate hit position on paddle (0 to 1)
        const hitPos = (ball.x - this.paddle.x) / this.paddle.width;
        
        // Adjust angle based on hit position
        const angle = (hitPos - 0.5) * Math.PI / 3; // -60° to +60°
        
        ball.dx = Math.sin(angle) * ball.speed;
        ball.dy = -Math.abs(Math.cos(angle) * ball.speed);
        
        ball.y = this.paddle.y - ball.radius;
        
        this.playSound('bounce');
        this.createParticles(ball.x, this.paddle.y, '#00ff88', 5);
    }
    
    checkBallBrickCollisions(ball) {
        for (let i = this.bricks.length - 1; i >= 0; i--) {
            const brick = this.bricks[i];
            
            if (this.checkBallBrickCollision(ball, brick)) {
                this.handleBallBrickCollision(ball, brick, i);
                break; // Only hit one brick per frame
            }
        }
    }
    
    checkBallBrickCollision(ball, brick) {
        return ball.x + ball.radius > brick.x &&
               ball.x - ball.radius < brick.x + brick.width &&
               ball.y + ball.radius > brick.y &&
               ball.y - ball.radius < brick.y + brick.height;
    }
    
    handleBallBrickCollision(ball, brick, brickIndex) {
        // Determine collision side
        const ballCenterX = ball.x;
        const ballCenterY = ball.y;
        const brickCenterX = brick.x + brick.width / 2;
        const brickCenterY = brick.y + brick.height / 2;
        
        const dx = ballCenterX - brickCenterX;
        const dy = ballCenterY - brickCenterY;
        
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        
        // Determine if collision is horizontal or vertical
        if (absDx / brick.width > absDy / brick.height) {
            ball.dx = -ball.dx;
        } else {
            ball.dy = -ball.dy;
        }
        
        // Damage brick
        brick.hits--;
        
        if (brick.hits <= 0) {
            // Brick destroyed
            this.score += brick.points * (this.combo + 1);
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            this.bricksDestroyed++;
            this.ballsHit++;
            
            // Create power-up
            if (brick.powerUp) {
                this.createPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.powerUp);
            }
            
            // Remove brick
            this.bricks.splice(brickIndex, 1);
            
            this.playSound('brickBreak');
            this.createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 8);
            this.addScreenShake();
            
            // Show combo effect
            if (this.combo > 2) {
                this.showComboEffect();
                this.playSound('combo');
            }
        } else {
            // Brick damaged
            this.score += 5;
            this.playSound('brickHit');
            this.createParticles(ball.x, ball.y, brick.color, 4);
        }
        
        // Fire ball doesn't bounce
        if (!this.activePowerUps.has('FIRE_BALL')) {
            // Normal ball behavior handled above
        } else {
            // Fire ball continues through bricks
            this.createParticles(ball.x, ball.y, '#ff0000', 6);
        }
    }
    
    createPowerUp(x, y, type) {
        this.powerUps.push({
            x: x,
            y: y,
            width: 30,
            height: 30,
            type: type,
            dy: 2,
            color: this.getPowerUpColor(type)
        });
    }
    
    getPowerUpColor(type) {
        const colors = {
            WIDE_PADDLE: '#00f5ff',
            FAST_BALL: '#ffff00',
            FIRE_BALL: '#ff0000',
            MULTI_BALL: '#ff0080',
            LASER: '#9d4edd'
        };
        return colors[type] || '#ffffff';
    }
    
    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            powerUp.y += powerUp.dy;
            
            // Check collision with paddle
            if (powerUp.x + powerUp.width > this.paddle.x &&
                powerUp.x < this.paddle.x + this.paddle.width &&
                powerUp.y + powerUp.height > this.paddle.y &&
                powerUp.y < this.paddle.y + this.paddle.height) {
                
                this.activatePowerUp(powerUp.type);
                this.powerUps.splice(i, 1);
                continue;
            }
            
            // Remove if off screen
            if (powerUp.y > this.canvasHeight) {
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    activatePowerUp(type) {
        const powerUp = this.powerUpTypes[type];
        if (!powerUp) return;
        
        this.playSound('powerUp');
        this.showPowerUpEffect(powerUp.name);
        this.createParticles(this.paddle.x + this.paddle.width / 2, this.paddle.y, this.getPowerUpColor(type), 12);
        
        switch(type) {
            case 'WIDE_PADDLE':
                this.activePowerUps.set(type, powerUp.duration);
                break;
            case 'FAST_BALL':
                this.activePowerUps.set(type, powerUp.duration);
                this.balls.forEach(ball => this.adjustBallSpeed(ball));
                break;
            case 'FIRE_BALL':
                this.activePowerUps.set(type, powerUp.duration);
                this.balls.forEach(ball => {
                    ball.color= '#ff0000';
                });
                this.addCssEffect('canvas-glow-fire');
                break;
            case 'MULTI_BALL':
                // Create additional balls
                const currentBalls = [...this.balls];
                currentBalls.forEach(ball => {
                    if (ball.launched) {
                        const newBall1 = this.createBall();
                        const newBall2 = this.createBall();
                        
                        newBall1.x = ball.x;
                        newBall1.y = ball.y;
                        newBall1.dx = ball.dx * 0.8 + 2;
                        newBall1.dy = ball.dy;
                        newBall1.launched = true;
                        
                        newBall2.x = ball.x;
                        newBall2.y = ball.y;
                        newBall2.dx = ball.dx * 0.8 - 2;
                        newBall2.dy = ball.dy;
                        newBall2.launched = true;
                        
                        this.balls.push(newBall1, newBall2);
                    }
                });
                this.addCssEffect('canvas-glow-multi');
                break;
            case 'LASER':
                this.activePowerUps.set(type, powerUp.duration);
                this.addCssEffect('canvas-glow-laser');
                break;
        }
    }
    
    updatePowerUpTimers() {
        const currentTime = Date.now();
        
        this.activePowerUps.forEach((endTime, type) => {
            if (currentTime >= endTime) {
                this.deactivatePowerUp(type);
            }
        });
    }
    
    deactivatePowerUp(type) {
        this.activePowerUps.delete(type);
        
        switch(type) {
            case 'FAST_BALL':
                this.balls.forEach(ball => this.adjustBallSpeed(ball));
                break;
            case 'FIRE_BALL':
                this.balls.forEach(ball => {
                    ball.color = '#ffffff';
                });
                this.removeCssEffect();
                break;
            case 'LASER':
                this.removeCssEffect();
                break;
            case 'WIDE_PADDLE':
                // Paddle size will be reset in updatePaddle
                break;
        }
    }
    
    addCssEffect(className) {
        this.canvas.className = className;
    }
    
    removeCssEffect() {
        this.canvas.className = '';
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.dy += 0.2; // gravity
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateLasers() {
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            
            laser.height += laser.speed;
            laser.y -= laser.speed;
            
            // Check laser-brick collisions
            for (let j = this.bricks.length - 1; j >= 0; j--) {
                const brick = this.bricks[j];
                
                if (laser.x + laser.width > brick.x &&
                    laser.x < brick.x + brick.width &&
                    laser.y < brick.y + brick.height &&
                    laser.y + laser.height > brick.y) {
                    
                    // Hit brick
                    brick.hits--;
                    
                    if (brick.hits <= 0) {
                        this.score += brick.points;
                        this.bricksDestroyed++;
                        
                        if (brick.powerUp) {
                            this.createPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.powerUp);
                        }
                        
                        this.bricks.splice(j, 1);
                        this.playSound('brickBreak');
                        this.createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 6);
                    } else {
                        this.playSound('brickHit');
                    }
                    
                    // Remove laser
                    this.lasers.splice(i, 1);
                    break;
                }
            }
            
            // Remove laser if off screen
            if (laser.y + laser.height < 0) {
                this.lasers.splice(i, 1);
            }
        }
    }
    
    createParticles(x, y, color, count) {
        if (!this.particlesEnabled) return;
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                dx: (Math.random() - 0.5) * 8,
                dy: (Math.random() - 0.5) * 8,
                radius: Math.random() * 3 + 1,
                color: color,
                life: 30,
                maxLife: 30,
                alpha: 1
            });
        }
    }
    
    showPowerUpEffect(name) {
        const effect = this.powerUpEffect;
        const nameDisplay = effect.querySelector('.power-up-name-display');
        
        nameDisplay.textContent = name;
        effect.style.display = 'block';
        
        setTimeout(() => {
            effect.style.display = 'none';
        }, 2000);
    }
    
    showComboEffect() {
        // Create combo effect element if it doesn't exist
        let comboEffect = document.querySelector('.combo-effect');
        if (!comboEffect) {
            comboEffect = document.createElement('div');
            comboEffect.className = 'combo-effect';
            comboEffect.innerHTML = '<div class="combo-text"></div>';
            document.body.appendChild(comboEffect);
        }
        
        const comboText = comboEffect.querySelector('.combo-text');
        comboText.textContent = `COMBO x${this.combo}!`;
        
        comboEffect.style.display = 'block';
        
        setTimeout(() => {
            comboEffect.style.display = 'none';
        }, 1500);
    }
    
    addScreenShake() {
        document.body.classList.add('screen-shake');
        setTimeout(() => {
            document.body.classList.remove('screen-shake');
        }, 500);
    }
    
    loseLife() {
        this.lives--;
        this.combo = 0;
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.playSound('lifeLost');
            this.showLifeLostEffect();
            this.balls = [this.createBall()];
            this.updateGameStatus(`Vida perdida! Restam ${this.lives} vidas. Clique para lançar!`);
        }
    }
    
    showLifeLostEffect() {
        // Create life lost effect element if it doesn't exist
        let lifeLostEffect = document.querySelector('.life-lost-effect');
        if (!lifeLostEffect) {
            lifeLostEffect = document.createElement('div');
            lifeLostEffect.className = 'life-lost-effect';
            lifeLostEffect.innerHTML = '<div class="life-lost-text">VIDA PERDIDA!</div>';
            document.body.appendChild(lifeLostEffect);
        }
        
        lifeLostEffect.style.display = 'block';
        
        setTimeout(() => {
            lifeLostEffect.style.display = 'none';
        }, 2000);
    }
    
    checkWinCondition() {
        if (this.bricks.length === 0) {
            this.levelComplete();
        }
    }
    
    levelComplete() {
        this.gameRunning = false;
        this.playSound('levelComplete');
        
        // Calculate bonuses
        const levelBonus = this.level * 100;
        const livesBonus = this.lives * 50;
        const accuracy = this.ballsLaunched > 0 ? (this.ballsHit / this.ballsLaunched) : 1;
        const accuracyBonus = Math.floor(accuracy * 200);
        
        this.score += levelBonus + livesBonus + accuracyBonus;
        
        this.showLevelCompleteModal(levelBonus, livesBonus, accuracyBonus);
    }
    
    checkAchievements() {
        const newAchievements = [];
        
        // First Break
        if (!this.achievements.firstBreak.unlocked && this.bricksDestroyed >= 1) {
            this.achievements.firstBreak.unlocked = true;
            newAchievements.push('firstBreak');
        }
        
        // Perfect Level
        if (!this.achievements.perfectLevel.unlocked && this.bricks.length === 0 && this.lives === 3) {
            this.achievements.perfectLevel.unlocked = true;
            newAchievements.push('perfectLevel');
        }
        
        // Sniper
        const accuracy = this.ballsLaunched > 0 ? (this.ballsHit / this.ballsLaunched) : 1;
        if (!this.achievements.sniper.unlocked && accuracy >= 0.9 && this.ballsLaunched >= 10) {
            this.achievements.sniper.unlocked = true;
            newAchievements.push('sniper');
        }
        
        // Combo Master
        if (!this.achievements.comboMaster.unlocked && this.combo >= 10) {
            this.achievements.comboMaster.unlocked = true;
            newAchievements.push('comboMaster');
        }
        
        // Survivor
        if (!this.achievements.survivor.unlocked && this.level >= 10) {
            this.achievements.survivor.unlocked = true;
            newAchievements.push('survivor');
        }
        
        if (newAchievements.length > 0) {
            this.showAchievements(newAchievements);
            this.updateAchievements();
            this.playSound('powerUp');
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
            firstBreak: '🏁',
            perfectLevel: '💥',
            sniper: '🎯',
            comboMaster: '🚀',
            survivor: '⏰'
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
    
    drawPreview() {
        const canvas = this.previewCanvas;
        const ctx = this.previewCtx;
        const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw preview of next level
        const nextLevel = this.level + 1;
        const rows = Math.min(6 + Math.floor(nextLevel / 3), 12);
        const cols = 8;
        const brickWidth = (canvasWidth - 10) / cols;
        const brickHeight = 8;
        const startY = 10;
        
        for (let row = 0; row < Math.min(rows, 8); row++) {
            for (let col = 0; col < cols; col++) {
                if (nextLevel > 3 && Math.random() < 0.1) continue;
                
                const x = 5 + col * brickWidth;
                const y = startY + row * (brickHeight + 1);
                
                const colorIndex = Math.min(row % this.brickColors.length, this.brickColors.length - 1);
                const color = this.brickColors[colorIndex];
                
                ctx.fillStyle = color;
                ctx.fillRect(x, y, brickWidth - 1, brickHeight);
            }
        }
        
        // Update next level info
        if (this.nextLevelNameElement) {
            this.nextLevelNameElement.textContent = `Nível ${nextLevel}`;
        }
        if (this.nextLevelBonusElement) {
            this.nextLevelBonusElement.textContent = `Bônus: +${nextLevel * 100}`;
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw bricks
        this.drawBricks();
        
        // Draw paddle
        this.drawPaddle();
        
        // Draw balls
        this.drawBalls();
        
        // Draw power-ups
        this.drawPowerUps();
        
        // Draw particles
        this.drawParticles();
        
        // Draw lasers
        this.drawLasers();
        
        // Draw pause overlay
        if (this.gamePaused) {
            this.drawPauseOverlay();
        }
    }
    
    drawBricks() {
        this.bricks.forEach(brick => {
            // Main brick
            const gradient = this.ctx.createLinearGradient(
                brick.x, brick.y, brick.x, brick.y + brick.height
            );
            gradient.addColorStop(0, brick.color);
            gradient.addColorStop(1, this.darkenColor(brick.color, 0.3));
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            
            // Damage indicator
            if (brick.hits < brick.maxHits) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            }
            
            // Border
            this.ctx.strokeStyle = this.lightenColor(brick.color, 0.2);
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            
            // Power-up indicator
            if (brick.powerUp) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Orbitron';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    this.powerUpTypes[brick.powerUp].icon,
                    brick.x + brick.width / 2,
                    brick.y + brick.height / 2 + 4
                );
            }
        });
    }
    
    drawPaddle() {
        const gradient = this.ctx.createLinearGradient(
            this.paddle.x, this.paddle.y, this.paddle.x, this.paddle.y + this.paddle.height
        );
        gradient.addColorStop(0, this.paddle.color);
        gradient.addColorStop(1, this.darkenColor(this.paddle.color, 0.3));
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        // Paddle glow effect
        if (this.activePowerUps.has('WIDE_PADDLE')) {
            this.ctx.shadowColor = '#00f5ff';
            this.ctx.shadowBlur = 15;
            this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
            this.ctx.shadowBlur = 0;
        }
        
        // Border
        this.ctx.strokeStyle = this.lightenColor(this.paddle.color, 0.2);
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
    }
    
    drawBalls() {
        this.balls.forEach(ball => {
            // Draw trail
            if (ball.launched) {
                ball.trail.forEach((point, index) => {
                    const alpha = (index + 1) / ball.trail.length * 0.3;
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, ball.radius * (index + 1) / ball.trail.length, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            }
            
            // Ball glow effect
            const glowRadius = ball.radius + 5;
            const gradient = this.ctx.createRadialGradient(
                ball.x, ball.y, 0, ball.x, ball.y, glowRadius
            );
            gradient.addColorStop(0, ball.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, glowRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Main ball
            this.ctx.fillStyle = ball.color;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Ball highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(ball.x - 2, ball.y - 2, ball.radius / 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            // Power-up glow
            this.ctx.shadowColor = powerUp.color;
            this.ctx.shadowBlur = 10;
            
            // Main power-up
            this.ctx.fillStyle = powerUp.color;
            this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            
            this.ctx.shadowBlur = 0;
            
            // Icon
            this.ctx.fillStyle = '#000';
            this.ctx.font = '18px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                this.powerUpTypes[powerUp.type].icon,
                powerUp.x + powerUp.width / 2,
                powerUp.y + powerUp.height / 2 + 6
            );
            
            // Border
            this.ctx.strokeStyle = this.lightenColor(powerUp.color, 0.3);
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    drawLasers() {
        this.lasers.forEach(laser => {
            const gradient = this.ctx.createLinearGradient(
                laser.x, laser.y, laser.x, laser.y + laser.height
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.1, '#9d4edd');
            gradient.addColorStop(0.9, '#9d4edd');
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
            
            // Laser glow
            this.ctx.shadowColor = '#9d4edd';
            this.ctx.shadowBlur = 5;
            this.ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawPauseOverlay() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Pause text with glow
        this.ctx.fillStyle = '#ff8500';
        this.ctx.font = `bold ${Math.min(32, this.canvasWidth / 12)}px Orbitron`;
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#ff8500';
        this.ctx.shadowBlur = 20;
        this.ctx.fillText('PAUSADO', this.canvasWidth / 2, this.canvasHeight / 2);
        this.ctx.shadowBlur = 0;
        
        // Instructions
        this.ctx.fillStyle = '#ccc';
        this.ctx.font = `${Math.min(12, this.canvasWidth / 25)}px Orbitron`;
        const instructionText = this.isMobile ? 'Toque para continuar' : 'Pressione P ou ESC para continuar';
        this.ctx.fillText(instructionText, this.canvasWidth / 2, this.canvasHeight / 2 + 30);
    }
    
    lightenColor(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    darkenColor(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.playSound('gameOver');
        this.updateGameStatus('Game Over!');
        
        // Update buttons
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
        this.leaderboard = this.leaderboard.slice(0, 10);
        this.saveLeaderboard();
        this.updateLeaderboard();
    }
    
    showGameOverModal(isNewRecord) {
        this.finalScoreElement.textContent = this.score;
        this.finalLevelElement.textContent = this.level;
        const accuracy = this.ballsLaunched > 0 ? Math.round((this.ballsHit / this.ballsLaunched) * 100) : 100;
        this.finalAccuracyElement.textContent = accuracy + '%';
        this.gameTimeElement.textContent = this.formatTime(this.gameTime);
        this.newRecordElement.style.display = isNewRecord ? 'block' : 'none';
        
        // Clear previous achievements
        this.achievementsEarnedElement.innerHTML = '';
        
        this.gameOverModal.style.display = 'block';
    }
    
    showLevelCompleteModal(levelBonus, livesBonus, accuracyBonus) {
        this.levelBonusElement.textContent = `+${levelBonus}`;
        this.livesBonusElement.textContent = `+${livesBonus}`;
        this.accuracyBonusElement.textContent = `+${accuracyBonus}`;
        
        const nextLevel = this.level + 1;
        this.nextLevelTitleElement.textContent = `Nível ${nextLevel}`;
        
        const descriptions = [
            "Novos desafios te aguardam!",
            "Tijolos mais resistentes aparecem!",
            "Prepare-se para mais dificuldade!",
            "A velocidade aumenta!",
            "Novos padrões de tijolos!",
            "Power-ups mais raros!",
            "Teste suas habilidades!",
            "A jornada continua!",
            "Você está ficando bom nisso!",
            "Impossível de parar!"
        ];
        
        this.nextLevelDescriptionElement.textContent = descriptions[Math.min(nextLevel - 2, descriptions.length - 1)];
        
        this.levelCompleteModal.style.display = 'block';
    }
    
    showPauseMenu() {
        this.pauseScoreElement.textContent = this.score;
        this.pauseLevelElement.textContent = this.level;
        this.pauseLivesElement.textContent = this.lives;
        this.pauseTimeElement.textContent = this.formatTime(this.gameTime);
        this.pauseMenu.style.display = 'block';
    }
    
    closeAllModals() {
        this.gameOverModal.style.display = 'none';
        this.pauseMenu.style.display = 'none';
        this.levelCompleteModal.style.display = 'none';
    }
    
    getStoredHighScore() {
        // For Claude.ai compatibility, use in-memory storage
        return this.highScore || 0;
    }
    
    saveHighScore() {
        // In a real environment, this would use localStorage
        // localStorage.setItem('breakoutHighScore', this.highScore);
    }
    
    getStoredLeaderboard() {
        // For Claude.ai compatibility, use in-memory storage
        return this.leaderboard || [];
    }
    
    saveLeaderboard() {
        // In a real environment, this would use localStorage
        // localStorage.setItem('breakoutLeaderboard', JSON.stringify(this.leaderboard));
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new BreakoutGame();
    
    // Add extra visual effects for desktop
    const canvas = document.getElementById('gameCanvas');
    
    // Only add hover effects on non-mobile devices
    if (!game.isMobile) {canvas.addEventListener('mouseenter', () => {
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
    console.log('🧱 Breakout Game - Responsive Edition');
    console.log('Controles:');
    if (game.isMobile) {
        console.log('  Toque: Use os botões na tela');
        console.log('  Deslize: Mova o dedo na tela para controlar a raquete');
        console.log('  Toque na tela: Lançar bola');
    } else {
        console.log('  ← → ou A D: Mover raquete');
        console.log('  ESPAÇO: Lançar bola');
        console.log('  C: Atirar laser (quando ativo)');
        console.log('  P: Pausar/Continuar');
        console.log('  R: Reiniciar');
        console.log('  ESC: Menu de pausa');
        console.log('  Mouse: Mover raquete');
        console.log('  Clique: Lançar bola');
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
    
    // Add special effects for achievements
    game.originalShowAchievements = game.showAchievements;
    game.showAchievements = function(achievements) {
        this.originalShowAchievements(achievements);
        
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
    };
    
    // Add CSS animations for popups
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        .multi-ball-indicator {
            position: absolute;
            top: 10px;
            left: 10px;
            color: #00f5ff;
            font-size: 14px;
            font-weight: 700;
            text-shadow: 0 0 10px rgba(0, 245, 255, 0.8);
            animation: pulse 1s ease-in-out infinite;
        }
    `;
    document.head.appendChild(style);
    
    // Add multi-ball indicator
    game.originalUpdate = game.update;
    game.update = function() {
        this.originalUpdate();
        
        // Update multi-ball indicator
        let multiBallIndicator = document.querySelector('.multi-ball-indicator');
        if (this.balls.length > 1) {
            if (!multiBallIndicator) {
                multiBallIndicator = document.createElement('div');
                multiBallIndicator.className = 'multi-ball-indicator';
                this.canvas.parentNode.appendChild(multiBallIndicator);
            }
            multiBallIndicator.textContent = `⚡ ${this.balls.length} BOLAS`;
        } else if (multiBallIndicator) {
            multiBallIndicator.remove();
        }
    };
    
    // Add special power-up activation effects
    game.originalActivatePowerUp = game.activatePowerUp;
    game.activatePowerUp = function(type) {
        this.originalActivatePowerUp(type);
        
        // Add power-up specific effects
        switch(type) {
            case 'MULTI_BALL':
                // Screen flash effect
                const flash = document.createElement('div');
                flash.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 245, 255, 0.3);
                    z-index: 1500;
                    pointer-events: none;
                    animation: flash 0.3s ease-out;
                `;
                document.body.appendChild(flash);
                
                setTimeout(() => flash.remove(), 300);
                break;
                
            case 'LASER':
                // Add laser ready indicator
                const laserIndicator = document.createElement('div');
                laserIndicator.style.cssText = `
                    position: absolute;
                    top: -40px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: #9d4edd;
                    font-size: 12px;
                    font-weight: 700;
                    text-shadow: 0 0 10px rgba(157, 78, 221, 0.8);
                    animation: pulse 1s ease-in-out infinite;
                `;
                laserIndicator.textContent = '🎯 LASER PRONTO';
                this.canvas.parentNode.appendChild(laserIndicator);
                
                // Remove when power-up expires
                setTimeout(() => {
                    if (laserIndicator.parentNode) {
                        laserIndicator.remove();
                    }
                }, this.powerUpTypes[type].duration);
                break;
        }
    };
    
    // Add flash animation to CSS
    style.textContent += `
        @keyframes flash {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    
    // Add level transition effect
    game.originalLevelComplete = game.levelComplete;
    game.levelComplete = function() {
        // Create level transition effect
        const transition = document.createElement('div');
        transition.className = 'level-transition';
        transition.style.display = 'block';
        document.body.appendChild(transition);
        
        setTimeout(() => {
            if (transition.parentNode) {
                transition.remove();
            }
        }, 2000);
        
        this.originalLevelComplete();
    };
    
    // Enhanced combo system with visual effects
    game.originalShowComboEffect = game.showComboEffect;
    game.showComboEffect = function() {
        this.originalShowComboEffect();
        
        // Add screen shake for high combos
        if (this.combo >= 5) {
            this.addScreenShake();
        }
        
        // Add special effects for milestone combos
        if (this.combo === 5 || this.combo === 10 || this.combo === 15) {
            const milestone = document.createElement('div');
            milestone.style.cssText = `
                position: fixed;
                top: 40%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #ffff00;
                font-family: 'Orbitron', monospace;
                font-size: 2rem;
                font-weight: 900;
                text-shadow: 0 0 20px rgba(255, 255, 0, 0.8);
                z-index: 2000;
                pointer-events: none;
                animation: milestoneEffect 2s ease-out forwards;
            `;
            
            if (this.combo === 5) milestone.textContent = '🔥 EM CHAMAS!';
            else if (this.combo === 10) milestone.textContent = '⚡ IMPARÁVEL!';
            else if (this.combo === 15) milestone.textContent = '🚀 LENDÁRIO!';
            
            document.body.appendChild(milestone);
            
            setTimeout(() => {
                if (milestone.parentNode) {
                    milestone.remove();
                }
            }, 2000);
        }
    };
    
    // Add milestone effect animation
    style.textContent += `
        @keyframes milestoneEffect {
            0% { 
                transform: translate(-50%, -50%) scale(0.5);
                opacity: 0;
            }
            20% { 
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 1;
            }
            80% { 
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            100% { 
                transform: translate(-50%, -50%) scale(0.9);
                opacity: 0;
            }
        }
    `;
    
    console.log('🎮 Breakout Game carregado com sucesso!');
    console.log('💡 Dica: Tente acertar a bola nas bordas da raquete para controlar o ângulo!');
    console.log('🎯 Dica: Colete power-ups para habilidades especiais!');
    console.log('🏆 Dica: Mantenha combos longos para pontuações mais altas!');

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
});