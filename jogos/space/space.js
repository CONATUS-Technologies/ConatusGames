class SpaceInvadersGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game settings
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        
        // Responsive settings
        this.isMobile = this.detectMobile();
        this.setupCanvas();
        
        // Game state
        this.player = {
            x: this.canvasWidth / 2 - 25,
            y: this.canvasHeight - 60,
            width: 50,
            height: 30,
            speed: 5,
            health: 100,
            shield: 0
        };
        
        this.bullets = [];
        this.aliens = [];
        this.alienBullets = [];
        this.powerUps = [];
        this.particles = [];
        this.explosions = [];
        
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.highScore = this.getStoredHighScore();
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameStartTime = 0;
        this.gameTime = 0;
        
        // Wave management
        this.aliensRemaining = 0;
        this.alienSpeed = 1;
        this.alienDirection = 1;
        this.alienDropDistance = 20;
        this.waveInProgress = false;
        
        // Power-up system
        this.doubleShotActive = false;
        this.rapidFireActive = false;
        this.explosiveShotActive = false;
        this.powerUpTimer = 0;
        
        // Shooting mechanics
        this.bulletSpeed = 8;
        this.shootCooldown = 0;
        this.maxShootCooldown = 10;
        
        // Statistics
        this.aliensKilled = 0;
        this.shotsFired = 0; // CORRIGIDO: era 'shotsfired'
        
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
        
        // Input state
        this.keys = {};
        this.leftPressed = false;
        this.rightPressed = false;
        this.shootPressed = false;
        
        // Achievements
        this.achievements = {
            firstAlien: { unlocked: false, name: 'Primeiro Alien', desc: 'Destrua seu primeiro alien' },
            waveComplete: { unlocked: false, name: 'Exterminador', desc: 'Complete a primeira wave' },
            highScorer: { unlocked: false, name: 'Cem por Cento', desc: 'Alcance 10.000 pontos' },
            survivor: { unlocked: false, name: 'Sobrevivente', desc: 'Survive por 5 minutos' },
            sharpshooter: { unlocked: false, name: 'Atirador', desc: 'Acerte 95% dos tiros' }
        };
        
        // Leaderboard
        this.leaderboard = this.getStoredLeaderboard();
        
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
            this.canvas.style.width = this.canvasWidth + 'px';
            this.canvas.style.height = this.canvasHeight + 'px';
            this.canvas.width = this.canvasWidth * devicePixelRatio;
            this.canvas.height = this.canvasHeight * devicePixelRatio;
            this.ctx.scale(devicePixelRatio, devicePixelRatio);
        }
        
        // Adjust canvas size for mobile
        if (this.isMobile) {
            const maxWidth = Math.min(400, window.innerWidth - 20);
            const scale = maxWidth / this.canvasWidth;
            this.canvas.style.width = maxWidth + 'px';
            this.canvas.style.height = (this.canvasHeight * scale) + 'px';
        }
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.waveElement = document.getElementById('wave');
        this.highScoreElement = document.getElementById('highScore');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.fpsCounterElement = document.getElementById('fpsCounter');
        this.aliensRemainingElement = document.getElementById('aliensRemaining');
        this.alienSpeedElement = document.getElementById('alienSpeed');
        this.bonusMultiplierElement = document.getElementById('bonusMultiplier');
        this.waveProgressElement = document.getElementById('waveProgress');
        
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
        this.waveCompleteModal = document.getElementById('waveCompleteModal');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalWaveElement = document.getElementById('finalWave');
        this.aliensKilledElement = document.getElementById('aliensKilled');
        this.gameTimeElement = document.getElementById('gameTime');
        this.newRecordElement = document.getElementById('newRecord');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.mainMenuBtn = document.getElementById('mainMenuBtn');
        this.modalClose = document.getElementById('modalClose');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.pauseResetBtn = document.getElementById('pauseResetBtn');
        
        // Wave complete elements
        this.completedWaveElement = document.getElementById('completedWave');
        this.waveBonusElement = document.getElementById('waveBonus');
        this.nextWaveElement = document.getElementById('nextWave');
        this.countdownElement = document.getElementById('countdown');
        
        // Lists
        this.leaderboardElement = document.getElementById('leaderboard');
        this.achievementsListElement = document.getElementById('achievementsList');
        this.achievementsEarnedElement = document.getElementById('achievementsEarned');
        
        // Pause stats
        this.pauseScoreElement = document.getElementById('pauseScore');
        this.pauseWaveElement = document.getElementById('pauseWave');
        this.pauseLivesElement = document.getElementById('pauseLives');
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
            // Tap to shoot
            this.shoot();
            return;
        }
        
        if (absDeltaX > absDeltaY) {
            // Horizontal swipe - move player
            if (deltaX > 0) {
                this.movePlayer(1); // Right
            } else {
                this.movePlayer(-1); // Left
            }
        } else {
            // Vertical swipe up - shoot
            if (deltaY < 0) {
                this.shoot();
            }
        }
    }
    
    handleMobileAction(action, pressed) {
        switch(action) {
            case 'left':
                this.leftPressed = pressed;
                break;
            case 'right':
                this.rightPressed = pressed;
                break;
            case 'shoot':
                if (pressed) this.shoot();
                break;
            case 'pause':
                if (pressed) this.togglePause();
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
        
        this.setupCanvas();
        
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
        this.updateLeaderboard();
        this.updateAchievements();
        this.setupWave();
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
                case 'shoot':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
                    break;
                case 'alienHit':
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
                    break;
                case 'playerHit':
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
                    break;
                case 'powerUp':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
                    break;
                case 'waveComplete':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.5);
                    break;
                case 'gameOver':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1);
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
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (type === 'gameOver' ? 1 : 0.2));
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + (type === 'gameOver' ? 1 : 0.2));
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }
    
    handleKeyDown(e) {
        this.keys[e.key] = true;
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.leftPressed = true;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.rightPressed = true;
                break;
            case ' ':
                e.preventDefault();
                if (this.gameRunning && !this.gamePaused) {
                    this.shoot();
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
    
    handleKeyUp(e) {
        this.keys[e.key] = false;
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.leftPressed = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.rightPressed = false;
                break;
        }
    }
    
    movePlayer(direction) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const newX = this.player.x + (direction * this.player.speed);
        if (newX >= 0 && newX <= this.canvasWidth - this.player.width) {
            this.player.x = newX;
        }
    }
    
    shoot() {
        if (!this.gameRunning || this.gamePaused || this.shootCooldown > 0) return;
        
        this.shotsFired++; // CORRIGIDO: era 'shotsired'
        this.shootCooldown = this.rapidFireActive ? this.maxShootCooldown / 2 : this.maxShootCooldown;
        
        if (this.doubleShotActive) {
            // Double shot
            this.bullets.push({
                x: this.player.x + 15,
                y: this.player.y,
                width: 4,
                height: 10,
                speed: this.bulletSpeed,
                explosive: this.explosiveShotActive
            });
            this.bullets.push({
                x: this.player.x + 35,
                y: this.player.y,
                width: 4,
                height: 10,
                speed: this.bulletSpeed,
                explosive: this.explosiveShotActive
            });
        } else {
            // Single shot
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 10,
                speed: this.bulletSpeed,
                explosive: this.explosiveShotActive
            });
        }
        
        this.playSound('shoot');
        
        // Add muzzle flash particle
        if (this.particlesEnabled) {
            this.addMuzzleFlash();
        }
    }
    
    addMuzzleFlash() {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3 - 2,
                life: 10,
                maxLife: 10,
                color: '#ffff00',
                size: Math.random() * 3 + 1
            });
        }
    }
    
    setupWave() {
        this.aliens = [];
        this.alienBullets = [];
        
        const rows = Math.min(5, 2 + Math.floor(this.wave / 3));
        const cols = Math.min(10, 6 + Math.floor(this.wave / 2));
        const alienWidth = 40;
        const alienHeight = 30;
        const spacing = 10;
        
        const startX = (this.canvasWidth - (cols * (alienWidth + spacing))) / 2;
        const startY = 50;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let type = 'basic';
                let health = 1;
                let points = 10;
                
                if (row === 0) {
                    type = 'fast';
                    points = 30;
                } else if (row === 1 && this.wave > 2) {
                    type = 'tank';
                    health = 2;
                    points = 50;
                } else if (row === 2 && this.wave > 4) {
                    type = 'shooter';
                    points = 40;
                }
                
                this.aliens.push({
                    x: startX + col * (alienWidth + spacing),
                    y: startY + row * (alienHeight + spacing),
                    width: alienWidth,
                    height: alienHeight,
                    type: type,
                    health: health,
                    maxHealth: health,
                    points: points,
                    shootTimer: Math.random() * 120 + 60
                });
            }
        }
        
        this.aliensRemaining = this.aliens.length;
        this.alienSpeed = 1 + Math.floor(this.wave / 3) * 0.5;
        this.alienDirection = 1;
        this.waveInProgress = true;
        
        this.updateWaveUI();
    }
    
    updateWaveUI() {
        this.aliensRemainingElement.textContent = this.aliensRemaining;
        this.alienSpeedElement.textContent = this.alienSpeed.toFixed(1) + 'x';
        this.bonusMultiplierElement.textContent = this.wave + 'x';
        
        const progress = ((this.aliens.length - this.aliensRemaining) / this.aliens.length) * 100;
        this.waveProgressElement.style.width = progress + '%';
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
        
        this.updateGameStatus('Batalha espacial em andamento!');
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
            this.updateGameStatus('Batalha espacial em andamento!');
            this.closeAllModals();
            this.gameLoop();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.player = {
            x: this.canvasWidth / 2 - 25,
            y: this.canvasHeight - 60,
            width: 50,
            height: 30,
            speed: 5,
            health: 100,
            shield: 0
        };
        this.bullets = [];
        this.aliens = [];
        this.alienBullets = [];
        this.powerUps = [];
        this.particles = [];
        this.explosions = [];
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.gameTime = 0;
        this.aliensKilled = 0;
        this.shotsFired = 0; // CORRIGIDO: era 'shotsired'
        this.aliensRemaining = 0;
        this.alienSpeed = 1;
        this.alienDirection = 1;
        this.waveInProgress = false;
        
        // Reset power-ups
        this.doubleShotActive = false;
        this.rapidFireActive = false;
        this.explosiveShotActive = false;
        this.powerUpTimer = 0;
        this.shootCooldown = 0;
        
        this.updateUI();
        this.setupWave();
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
            const multipliers = {
                easy: 0.7,
                normal: 1.0,
                hard: 1.3,
                extreme: 1.6
            };
            
            const mult = multipliers[this.difficulty] || 1.0;
            this.alienSpeed = (1 + Math.floor(this.wave / 3) * 0.5) * mult;
            this.maxShootCooldown = Math.floor(10 / mult);
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
            if (this.gamePaused) {
                this.mobilePauseBtn.innerHTML = '<span class="btn-icon">▶</span>CONTINUAR';
            } else {
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
        this.waveElement.textContent = this.wave;
        this.highScoreElement.textContent = this.highScore;
        
        // Update game time
        if (this.gameRunning && !this.gamePaused) {
            this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        }
        
        this.updateWaveUI();
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    update() {
        if (this.gamePaused) return;
        
        this.updateUI();
        
        // Update cooldowns
        if (this.shootCooldown > 0) this.shootCooldown--;
        if (this.powerUpTimer > 0) {
            this.powerUpTimer--;
            if (this.powerUpTimer === 0) {
                this.doubleShotActive = false;
                this.rapidFireActive = false;
                this.explosiveShotActive = false;
            }
        }
        
        // Handle player movement
        if (this.leftPressed) {
            this.movePlayer(-1);
        }
        if (this.rightPressed) {
            this.movePlayer(1);
        }
        
        // Update bullets
        this.updateBullets();
        
        // Update aliens
        this.updateAliens();
        
        // Update alien bullets
        this.updateAlienBullets();
        
        // Update power-ups
        this.updatePowerUps();
        
        // Update particles
        this.updateParticles();
        
        // Update explosions
        this.updateExplosions();
        
        // Check collisions
        this.checkCollisions();
        
        // Check achievements
        this.checkAchievements();
        
        // Spawn power-ups randomly
        if (Math.random() < 0.001) {
            this.spawnPowerUp();
        }
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed;
            
            if (bullet.y < -bullet.height) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    updateAliens() {
        if (this.aliens.length === 0) return;
        
        let shouldDrop = false;
        
        // Check if aliens hit the edge
        for (let alien of this.aliens) {
            if ((this.alienDirection > 0 && alien.x + alien.width >= this.canvasWidth) ||
                (this.alienDirection < 0 && alien.x <= 0)) {
                shouldDrop = true;
                break;
            }
        }
        
        if (shouldDrop) {
            this.alienDirection *= -1;
            for (let alien of this.aliens) {
                alien.y += this.alienDropDistance;
            }
        } else {
            // Move aliens horizontally
            for (let alien of this.aliens) {
                alien.x += this.alienSpeed * this.alienDirection;
            }
        }
        
        // Alien shooting
        for (let alien of this.aliens) {
            alien.shootTimer--;
            if (alien.shootTimer <= 0 && alien.type === 'shooter') {
                this.alienShoot(alien);
                alien.shootTimer = Math.random() * 180 + 120;
            }
        }
        
        // Check if aliens reached the player
        for (let alien of this.aliens) {
            if (alien.y + alien.height >= this.player.y) {
                this.playerHit(50);
                break;
            }
        }
    }
    
    updateAlienBullets() {
        for (let i = this.alienBullets.length - 1; i >= 0; i--) {
            const bullet = this.alienBullets[i];
            bullet.y += bullet.speed;
            
            if (bullet.y > this.canvasHeight) {
                this.alienBullets.splice(i, 1);
            }
        }
    }
    
    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += powerUp.speed;
            powerUp.rotation += 0.1;
            
            if (powerUp.y > this.canvasHeight) {
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.frame++;
            explosion.radius += explosion.speed;
            explosion.alpha -= 0.05;
            
            if (explosion.alpha <= 0) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    alienShoot(alien) {
        this.alienBullets.push({
            x: alien.x + alien.width / 2 - 2,
            y: alien.y + alien.height,
            width: 4,
            height: 8,
            speed: 3
        });
    }
    
    spawnPowerUp() {
        const types = ['doubleshoot', 'rapidfire', 'shield', 'explosive'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.powerUps.push({
            x: Math.random() * (this.canvasWidth - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: 2,
            type: type,
            rotation: 0
        });
    }
    
    checkCollisions() {
        // Player bullets vs aliens
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.aliens.length - 1; j >= 0; j--) {
                const alien = this.aliens[j];
                
                if (this.isColliding(bullet, alien)) {
                    this.bullets.splice(i, 1);
                    
                    alien.health--;
                    if (alien.health <= 0) {
                        this.score += alien.points * this.wave;
                        this.aliensKilled++;
                        this.aliensRemaining--;
                        
                        // Create explosion
                        this.addExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2, '#ff6b35');
                        
                        // Explosive bullets create area damage
                        if (bullet.explosive) {
                            this.createExplosiveDamage(alien.x + alien.width / 2, alien.y + alien.height / 2);
                        }
                        
                        this.aliens.splice(j, 1);
                        this.playSound('alienHit');
                        
                        // Check if wave is complete
                        if (this.aliens.length === 0) {
                            this.completeWave();
                        }
                    }
                    break;
                }
            }
        }
        
        // Alien bullets vs player
        for (let i = this.alienBullets.length - 1; i >= 0; i--) {
            const bullet = this.alienBullets[i];
            
            if (this.isColliding(bullet, this.player)) {
                this.alienBullets.splice(i, 1);
                this.playerHit(10);
            }
        }
        
        // Power-ups vs player
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            if (this.isColliding(powerUp, this.player)) {
                this.powerUps.splice(i, 1);
                this.activatePowerUp(powerUp.type);
                this.playSound('powerUp');
            }
        }
    }
    
    createExplosiveDamage(x, y) {
        const radius = 80;
        
        for (let i = this.aliens.length - 1; i >= 0; i--) {
            const alien = this.aliens[i];
            const distance = Math.sqrt(
                Math.pow(alien.x + alien.width / 2 - x, 2) +
                Math.pow(alien.y + alien.height / 2 - y, 2)
            );
            
            if (distance <= radius) {
                alien.health--;
                if (alien.health <= 0) {
                    this.score += alien.points * this.wave;
                    this.aliensKilled++;
                    this.aliensRemaining--;
                    this.addExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2, '#ff0080');
                    this.aliens.splice(i, 1);
                }
            }
        }
        
        // Create large explosion effect
        this.addExplosion(x, y, '#ffff00', 100);
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    playerHit(damage) {
        if (this.player.shield > 0) {
            this.player.shield -= damage;
            if (this.player.shield < 0) {
                this.player.health += this.player.shield;
                this.player.shield = 0;
            }
        } else {
            this.player.health -= damage;
        }
        
        this.addExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ff3333');
        this.playSound('playerHit');
        
        if (this.player.health <= 0) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.player.health = 100;
                this.player.shield = 0;
                this.player.x = this.canvasWidth / 2 - 25;
            }
        }
    }
    
    activatePowerUp(type) {
        this.powerUpTimer = 600; // 10 seconds at 60fps
        
        switch(type) {
            case 'doubleshoot':
                this.doubleShotActive = true;
                break;
            case 'rapidfire':
                this.rapidFireActive = true;
                break;
            case 'shield':
                this.player.shield += 50;
                break;
            case 'explosive':
                this.explosiveShotActive = true;
                break;
        }
    }
    
    addExplosion(x, y, color = '#ff6b35', size = 50) {
        this.explosions.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: size,
            speed: 3,
            alpha: 1,
            color: color,
            frame: 0
        });
        
        // Add particles
        if (this.particlesEnabled) {
            for (let i = 0; i < 15; i++) {
                this.particles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    life: 30,
                    maxLife: 30,
                    color: color,
                    size: Math.random() * 4 + 2
                });
            }
        }
    }
    
    completeWave() {
        this.waveInProgress = false;
        const waveBonus = this.wave * 1000;
        this.score += waveBonus;
        this.wave++;
        
        this.playSound('waveComplete');
        this.showWaveCompleteModal(waveBonus);
    }
    
    showWaveCompleteModal(bonus) {
        this.completedWaveElement.textContent = this.wave - 1;
        this.waveBonusElement.textContent = '+' + bonus;
        this.nextWaveElement.textContent = this.wave;
        
        this.waveCompleteModal.style.display = 'block';
        
        // Countdown to next wave
        let countdown = 3;
        this.countdownElement.textContent = countdown;
        
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                this.countdownElement.textContent = countdown;
            } else {
                clearInterval(countdownInterval);
                this.waveCompleteModal.style.display = 'none';
                this.setupWave();
            }
        }, 1000);
    }
    
    checkAchievements() {
        const newAchievements = [];
        
        // First Alien
        if (!this.achievements.firstAlien.unlocked && this.aliensKilled >= 1) {
            this.achievements.firstAlien.unlocked = true;
            newAchievements.push('firstAlien');
        }
        
        // Wave Complete
        if (!this.achievements.waveComplete.unlocked && this.wave > 1) {
            this.achievements.waveComplete.unlocked = true;
            newAchievements.push('waveComplete');
        }
        
        // High Scorer
        if (!this.achievements.highScorer.unlocked && this.score >= 10000) {
            this.achievements.highScorer.unlocked = true;
            newAchievements.push('highScorer');
        }
        
        // Survivor
        if (!this.achievements.survivor.unlocked && this.gameTime >= 300) {
            this.achievements.survivor.unlocked = true;
            newAchievements.push('survivor');
        }
        
        // Sharpshooter
        if (!this.achievements.sharpshooter.unlocked && this.shotsFired > 20) {
            const accuracy = this.aliensKilled / this.shotsFired;
            if (accuracy >= 0.95) {
                this.achievements.sharpshooter.unlocked = true;
                newAchievements.push('sharpshooter');
            }
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
            firstAlien: '👽',
            waveComplete: '🌊',
            highScorer: '💯',
            survivor: '🛡️',
            sharpshooter: '🎯'
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
        // Clear canvas with space gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#000011');
        gradient.addColorStop(0.5, '#000033');
        gradient.addColorStop(1, '#000011');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw stars
        this.drawStars();
        
        // Draw player
        this.drawPlayer();
        
        // Draw bullets
        this.drawBullets();
        
        // Draw aliens
        this.drawAliens();
        
        // Draw alien bullets
        this.drawAlienBullets();
        
        // Draw power-ups
        this.drawPowerUps();
        
        // Draw particles
        this.drawParticles();
        
        // Draw explosions
        this.drawExplosions();
        
        // Draw UI elements
        this.drawHealthBar();
        this.drawPowerUpIndicators();
        
        // Draw pause overlay
        if (this.gamePaused) {
            this.drawPauseOverlay();
        }
    }
    
    drawStars() {
        // Simple star field
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 157) % this.canvasWidth;
            const y = (i * 213) % this.canvasHeight;
            const size = Math.sin(i + Date.now() * 0.001) * 0.5 + 1;
            this.ctx.fillRect(x, y, size, size);
        }
    }
    
    drawPlayer() {
        const player = this.player;
        
        // Player ship with gradient
        const gradient = this.ctx.createLinearGradient(
            player.x, player.y, 
            player.x, player.y + player.height
        );
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(1, '#0066ff');
        
        this.ctx.fillStyle = gradient;
        
        // Draw ship shape
        this.ctx.beginPath();
        this.ctx.moveTo(player.x + player.width / 2, player.y);
        this.ctx.lineTo(player.x, player.y + player.height);
        this.ctx.lineTo(player.x + player.width / 4, player.y + player.height * 0.8);
        this.ctx.lineTo(player.x + player.width * 0.75, player.y + player.height * 0.8);
        this.ctx.lineTo(player.x + player.width, player.y + player.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Ship glow
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 15;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Engine trails
        if (this.leftPressed || this.rightPressed) {
            this.ctx.fillStyle = '#ff6b35';
            this.ctx.fillRect(player.x + 5, player.y + player.height, 8, 15);
            this.ctx.fillRect(player.x + player.width - 13, player.y + player.height, 8, 15);
        }
    }
    
    drawBullets() {
        for (let bullet of this.bullets) {
            if (bullet.explosive) {
                this.ctx.fillStyle = '#ffff00';
                this.ctx.shadowColor = '#ffff00';
                this.ctx.shadowBlur = 10;
            } else {
                this.ctx.fillStyle = '#00ff00';
                this.ctx.shadowColor = '#00ff00';
                this.ctx.shadowBlur = 5;
            }
            
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawAliens() {
        for (let alien of this.aliens) {
            let color = '#ff0080';
            
            switch(alien.type) {
                case 'fast':
                    color = '#ff6b35';
                    break;
                case 'tank':
                    color = '#9d4edd';
                    break;
                case 'shooter':
                    color = '#ffff00';
                    break;
            }
            
            // Health-based alpha
            const alpha = alien.health / alien.maxHealth;
            this.ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            
            // Draw alien shape
            this.ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
            
            // Alien glow
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 8;
            this.ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
            this.ctx.shadowBlur = 0;
            
            // Draw eyes
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(alien.x + 8, alien.y + 8, 6, 6);
            this.ctx.fillRect(alien.x + 26, alien.y + 8, 6, 6);
            
            // Health bar for damaged aliens
            if (alien.health < alien.maxHealth) {
                const barWidth = alien.width;
                const barHeight = 4;
                const healthPercent = alien.health / alien.maxHealth;
                
                this.ctx.fillStyle = '#333333';
                this.ctx.fillRect(alien.x, alien.y - 8, barWidth, barHeight);
                
                this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff3333';
                this.ctx.fillRect(alien.x, alien.y - 8, barWidth * healthPercent, barHeight);
            }
        }
    }
    
    drawAlienBullets() {
        this.ctx.fillStyle = '#ff3333';
        for (let bullet of this.alienBullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    }
    
    drawPowerUps() {
        for (let powerUp of this.powerUps) {
            this.ctx.save();
            this.ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
            this.ctx.rotate(powerUp.rotation);
            
            let color = '#00ffff';
            let symbol = '?';
            
            switch(powerUp.type) {
                case 'doubleshoot':
                    color = '#00ff00';
                    symbol = '🔫';
                    break;
                case 'rapidfire':
                    color = '#ffff00';
                    symbol = '⚡';
                    break;
                case 'shield':
                    color = '#0066ff';
                    symbol = '🛡️';
                    break;
                case 'explosive':
                    color = '#ff6b35';
                    symbol = '💥';
                    break;
            }
            
            // Power-up glow
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 15;
            this.ctx.fillStyle = color;
            this.ctx.fillRect(-powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height);
            this.ctx.shadowBlur = 0;
            
            // Symbol
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(symbol, 0, 6);
            
            this.ctx.restore();
        }
    }
    
    drawParticles() {
        if (!this.particlesEnabled) return;
        
        for (let particle of this.particles) {
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        }
    }
    
    drawExplosions() {
        for (let explosion of this.explosions) {
            this.ctx.save();
            this.ctx.globalAlpha = explosion.alpha;
            
            const gradient = this.ctx.createRadialGradient(
                explosion.x, explosion.y, 0,
                explosion.x, explosion.y, explosion.radius
            );
            gradient.addColorStop(0, explosion.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    drawHealthBar() {
        const barWidth = 200;
        const barHeight = 20;
        const x = 10;
        const y = 10;
        
        // Background
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health
        const healthPercent = Math.max(0, this.player.health / 100);
        this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff3333';
        this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        
        // Shield
        if (this.player.shield > 0) {
            const shieldPercent = Math.min(1, this.player.shield / 100);
            this.ctx.fillStyle = '#0066ff';
            this.ctx.fillRect(x, y + barHeight + 2, barWidth * shieldPercent, 8);
        }
        
        // Text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Orbitron';
        this.ctx.fillText(`Health: ${Math.max(0, this.player.health)}`, x, y + barHeight + 20);
        if (this.player.shield > 0) {
            this.ctx.fillText(`Shield: ${this.player.shield}`, x, y + barHeight + 35);
        }
    }
    
    drawPowerUpIndicators() {
        if (this.powerUpTimer > 0) {
            const x = this.canvasWidth - 150;
            const y = 10;
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Orbitron';
            this.ctx.fillText('Active Power-ups:', x, y);
            
            let yOffset = 20;
            if (this.doubleShotActive) {
                this.ctx.fillText('🔫 Double Shot', x, y + yOffset);
                yOffset += 15;
            }
            if (this.rapidFireActive) {
                this.ctx.fillText('⚡ Rapid Fire', x, y + yOffset);
                yOffset += 15;
            }
            if (this.explosiveShotActive) {
                this.ctx.fillText('💥 Explosive', x, y + yOffset);
                yOffset += 15;
            }
            
            // Timer
            const timeLeft = Math.ceil(this.powerUpTimer / 60);
            this.ctx.fillText(`Time: ${timeLeft}s`, x, y + yOffset);
        }
    }
    
    drawPauseOverlay() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Pause text with glow
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = 'bold 48px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 30;
        this.ctx.fillText('PAUSADO', this.canvasWidth / 2, this.canvasHeight / 2);
        this.ctx.shadowBlur = 0;
        
        // Instructions
        this.ctx.fillStyle = '#ccc';
        this.ctx.font = '16px Orbitron';
        const instructionText = this.isMobile ? 'Toque para continuar' : 'Pressione P ou ESC para continuar';
        this.ctx.fillText(instructionText, this.canvasWidth / 2, this.canvasHeight / 2 + 50);
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
        this.finalWaveElement.textContent = this.wave;
        this.aliensKilledElement.textContent = this.aliensKilled;
        this.gameTimeElement.textContent = this.formatTime(this.gameTime);
        this.newRecordElement.style.display = isNewRecord ? 'block' : 'none';
        
        // Clear previous achievements
        this.achievementsEarnedElement.innerHTML = '';
        
        this.gameOverModal.style.display = 'block';
    }
    
    showPauseMenu() {
        this.pauseScoreElement.textContent = this.score;
        this.pauseWaveElement.textContent = this.wave;
        this.pauseLivesElement.textContent = this.lives;
        this.pauseTimeElement.textContent = this.formatTime(this.gameTime);
        this.pauseMenu.style.display = 'block';
    }
    
    closeAllModals() {
        this.gameOverModal.style.display = 'none';
        this.pauseMenu.style.display = 'none';
        this.waveCompleteModal.style.display = 'none';
    }
    
    getStoredHighScore() {
        // For Claude.ai compatibility, use in-memory storage
        return this.highScore || 0;
    }
    
    saveHighScore() {
        // In a real environment, this would use localStorage
        // localStorage.setItem('spaceInvadersHighScore', this.highScore);
    }
    
    getStoredLeaderboard() {
        // For Claude.ai compatibility, use in-memory storage
        return this.leaderboard || [];
    }
    
    saveLeaderboard() {
        // In a real environment, this would use localStorage
        // localStorage.setItem('spaceInvadersLeaderboard', JSON.stringify(this.leaderboard));
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new SpaceInvadersGame();
    
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
    console.log('🚀 Space Invaders - Responsive Edition');
    console.log('Controles:');
    if (game.isMobile) {
        console.log('  Toque: Use os botões na tela');
        console.log('  Deslize: Deslize na tela do jogo para mover e atirar');
    } else {
        console.log('  ← → ou A D: Mover nave');
        console.log('  ESPAÇO: Atirar');
        console.log('  P: Pausar/Continuar');
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
    
    // Add special effects for space theme
    function createStarField() {
        const starField = document.createElement('div');
        starField.style.position = 'fixed';
        starField.style.top = '0';
        starField.style.left = '0';
        starField.style.width = '100%';
        starField.style.height = '100%';
        starField.style.pointerEvents = 'none';
        starField.style.zIndex = '-2';
        
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.style.position = 'absolute';
            star.style.width = Math.random() * 3 + 'px';
            star.style.height = star.style.width;
            star.style.backgroundColor = '#ffffff';
            star.style.borderRadius = '50%';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animation = `twinkle ${Math.random() * 3 + 2}s infinite`;
            starField.appendChild(star);
        }
        
        document.body.appendChild(starField);
    }
    
    // Add CSS animation for twinkling stars
    const style = document.createElement('style');
    style.textContent = `
        @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Create enhanced star field for space theme
    if (!game.isMobile) {
        createStarField();
    }
    
    // Add custom context menu for game area
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (game.gameRunning && !game.gamePaused) {
            game.shoot(); // Right click to shoot
        }
    });
    
    // Add mouse controls for desktop
    if (!game.isMobile) {
        let mouseX = 0;
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            
            if (game.gameRunning && !game.gamePaused) {
                // Mouse movement controls player
                const canvasMouseX = (mouseX / rect.width) * game.canvasWidth;
                game.player.x = Math.max(0, Math.min(canvasMouseX - game.player.width / 2, game.canvasWidth - game.player.width));
            }
        });
        
        canvas.addEventListener('click', (e) => {
            if (game.gameRunning && !game.gamePaused) {
                game.shoot();
            }
        });
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
                    homePath = '../../home/home.html';
                } else {
                    // Estamos em uma página de primeiro nível
                    homePath = '../home/home.html';
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
    
    // Add enhanced sound system with Web Audio API
    class EnhancedAudioSystem {
        constructor() {
            this.context = null;
            this.masterGain = null;
            this.initialized = false;
        }
        
        async initialize() {
            try {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
                this.masterGain = this.context.createGain();
                this.masterGain.connect(this.context.destination);
                this.masterGain.gain.value = 0.3;
                this.initialized = true;
            } catch (error) {
                console.warn('Enhanced audio not available:', error);
            }
        }
        
        createTone(frequency, duration, type = 'sine') {
            if (!this.initialized) return;
            
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            
            gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + duration);
        }
    }
    
    const enhancedAudio = new EnhancedAudioSystem();
    
    // Initialize enhanced audio on first user interaction
    document.addEventListener('click', () => {
        if (!enhancedAudio.initialized) {
            enhancedAudio.initialize();
        }
    }, { once: true });
    
    // Add debug mode for development
    window.spaceInvadersDebug = {
        game: game,
        addScore: (points) => { game.score += points; game.updateUI(); },
        addLives: (lives) => { game.lives += lives; game.updateUI(); },
        skipWave: () => { game.aliens = []; game.completeWave(); },
        godMode: () => { game.player.health = 1000; game.player.shield = 1000; },
        activatePowerUp: (type) => { game.activatePowerUp(type); },
        showFPS: true
    };
    
    console.log('Debug mode available: window.spaceInvadersDebug');
    console.log('Comandos de debug:');
    console.log('  window.spaceInvadersDebug.addScore(1000) - Adicionar pontos');
    console.log('  window.spaceInvadersDebug.addLives(3) - Adicionar vidas');
    console.log('  window.spaceInvadersDebug.skipWave() - Pular wave');
    console.log('  window.spaceInvadersDebug.godMode() - Modo deus');
    console.log('  window.spaceInvadersDebug.activatePowerUp("doubleshoot") - Ativar power-up');
});