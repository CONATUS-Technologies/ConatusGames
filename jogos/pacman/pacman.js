class PacManGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.miniMapCanvas = document.getElementById('miniMap');
        this.miniMapCtx = this.miniMapCanvas.getContext('2d');
        
        // Game settings
        this.cellSize = 25;
        this.boardWidth = 25;  // Reduced for better proportions
        this.boardHeight = 25; // Square board for symmetry
        this.miniMapScale = this.miniMapCanvas.width / this.canvas.width;
        
        // Responsive settings
        this.isMobile = this.detectMobile();
        this.canvasSize = this.getOptimalCanvasSize();
        
        // Game state
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.highScore = this.getStoredHighScore();
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameStartTime = 0;
        this.gameTime = 0;
        this.pelletsEaten = 0;
        this.totalPellets = 0;
        this.levelStartTime = 0;
        
        // Game objects - Centered positions for new board size
        this.pacman = {
            x: 12,
            y: 18,
            direction: { x: 0, y: 0 },
            nextDirection: { x: 0, y: 0 },
            animFrame: 0,
            mouthOpen: true
        };
        
        // Ghost spawn area (center of board)
        this.ghosts = [
            { x: 12, y: 8, direction: { x: -1, y: 0 }, color: '#ff0000', name: 'Blinky', mode: 'chase', modeTimer: 0, frightened: false, eaten: false },
            { x: 12, y: 10, direction: { x: 0, y: -1 }, color: '#ffb8ff', name: 'Pinky', mode: 'scatter', modeTimer: 0, frightened: false, eaten: false },
            { x: 10, y: 10, direction: { x: 0, y: 1 }, color: '#00ffff', name: 'Inky', mode: 'scatter', modeTimer: 0, frightened: false, eaten: false },
            { x: 14, y: 10, direction: { x: 0, y: 1 }, color: '#ffb852', name: 'Clyde', mode: 'scatter', modeTimer: 0, frightened: false, eaten: false }
        ];
        
        this.powerMode = {
            active: false,
            timer: 0,
            duration: 600,
            ghostsEaten: 0
        };
        
        this.bonusFruit = null;
        this.bonusFruitTimer = 0;
        
        // Game mechanics
        this.gameSpeed = 120;
        this.ghostSpeed = 140;
        this.pacmanSpeed = 80;
        this.difficulty = 'normal';
        
        // Settings
        this.soundEnabled = true;
        this.particlesEnabled = true;
        
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
            firstPellet: { unlocked: false, name: 'Primeiro Pellet', desc: 'Coma seu primeiro pellet' },
            ghostHunter: { unlocked: false, name: 'Caça-Fantasmas', desc: 'Coma 4 fantasmas em sequência' },
            fruitCollector: { unlocked: false, name: 'Frutívoro', desc: 'Colete 10 frutas' },
            speedrunner: { unlocked: false, name: 'Speedrunner', desc: 'Complete um nível em 60s' },
            perfectionist: { unlocked: false, name: 'Perfeição', desc: 'Complete um nível sem morrer' }
        };
        
        
        // Stats tracking
        this.stats = {
            fruitsCollected: 0,
            perfectLevels: 0,
            deathsThisLevel: 0
        };
        
        // Leaderboard
        this.leaderboard = this.getStoredLeaderboard();
        
        // Game board with perfect maze layout
        this.board = this.createPerfectBoard();
        
        // DOM elements
        this.initializeElements();
        this.setupCanvas();
        this.setupEventListeners();
        this.init();
    }
    
    createPerfectBoard() {
    // Mapa perfeito baseado no Pac-Man clássico original
    // 0 = vazio, 1 = parede, 2 = pellet, 3 = power pellet, 4 = túnel
    const board = [
        // Linha 0 - Borda superior
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        // Linha 1 - Primeira fileira de pellets
        [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
        // Linha 2 - Power pellets nos cantos + estrutura
        [1,3,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,3,1],
        // Linha 3 - Corredor com pellets
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        // Linha 4 - Estrutura interna superior
        [1,2,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1],
        // Linha 5 - Corredor interno
        [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
        // Linha 6 - Entrada para área dos fantasmas
        [1,1,1,1,1,2,1,1,1,1,1,0,1,0,1,1,1,1,1,2,1,1,1,1,1],
        // Linha 7 - Corredor de acesso
        [0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
        // Linha 8 - Área dos fantasmas - entrada
        [1,1,1,1,1,2,1,0,1,1,0,0,0,0,0,1,1,0,1,2,1,1,1,1,1],
        // Linha 9 - Túnel central + área dos fantasmas
        [4,0,0,0,0,2,0,0,1,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,4],
        // Linha 10 - Área dos fantasmas - saída
        [1,1,1,1,1,2,1,0,1,0,0,0,0,0,0,0,1,0,1,2,1,1,1,1,1],
        // Linha 11 - Corredor de saída
        [0,0,0,0,1,2,1,0,1,1,1,1,1,1,1,1,1,0,1,2,1,0,0,0,0],
        // Linha 12 - Fechamento da área dos fantasmas
        [1,1,1,1,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,1,1,1,1],
        // Linha 13 - Corredor central inferior
        [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
        // Linha 14 - Estrutura interna inferior
        [1,2,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,2,1],
        // Linha 15 - Corredor especial com power pellets
        [1,3,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,3,1],
        // Linha 16 - Estrutura em T
        [1,1,1,2,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,2,1,1,1],
        // Linha 17 - Corredor inferior
        [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
        // Linha 18 - Estrutura inferior final
        [1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1],
        // Linha 19 - Corredor final
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        // Linha 20 - Borda inferior
        [1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1],
        // Linha 1 - Primeira fileira de pellets
        [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
        // Linha 2 - Power pellets nos cantos + estrutura
        [1,3,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,3,1],
        // Linha 3 - Corredor com pellets
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];
    
        // Validar dimensões
        this.boardHeight = board.length; // 21 linhas
        this.boardWidth = board[0].length; // 25 colunas
        
        // Contar pellets totais para verificação
        this.totalPellets = 0;
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (board[y][x] === 2 || board[y][x] === 3) {
                    this.totalPellets++;
                }
            }
        }
        
        console.log(`🟡 Mapa Perfeito Carregado:
        • Dimensões: ${this.boardWidth}x${this.boardHeight}
        • Total de pellets: ${this.totalPellets}
        • Power pellets: 4 (nos cantos estratégicos)
        • Túneis laterais: Linha 9 (esquerda e direita)
        • Área dos fantasmas: Centro (linhas 8-12)
        • Layout: Baseado no Pac-Man clássico original`);
        
        return board;
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
               window.innerWidth <= 768;
    }
    
    getOptimalCanvasSize() {
        const maxWidth = Math.min(640, window.innerWidth - 40);
        const maxHeight = Math.min(640, window.innerHeight - 200);
        const size = Math.min(maxWidth, maxHeight);
        
        // Ensure size is divisible by cellSize for clean grid
        return Math.floor(size / this.cellSize) * this.cellSize;
    }
    
    setupCanvas() {
        const size = this.canvasSize;
        this.canvas.width = size;
        this.canvas.height = size;
        this.cellSize = size / Math.max(this.boardWidth, this.boardHeight);
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
        this.levelElement = document.getElementById('level');
        this.livesElement = document.getElementById('lives');
        this.highScoreElement = document.getElementById('highScore');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.fpsCounterElement = document.getElementById('fpsCounter');
        this.readyMessageElement = document.getElementById('readyMessage');
        
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
        this.particlesToggle = document.getElementById('particlesToggle');
        this.difficultySelect = document.getElementById('difficultySelect');
        
        // Modals
        this.gameOverModal = document.getElementById('gameOverModal');
        this.pauseMenu = document.getElementById('pauseMenu');
        this.levelCompleteModal = document.getElementById('levelCompleteModal');
        
        // Final stats elements
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalLevelElement = document.getElementById('finalLevel');
        this.finalPelletsElement = document.getElementById('finalPellets');
        this.gameTimeElement = document.getElementById('gameTime');
        this.newRecordElement = document.getElementById('newRecord');
        
        // Modal buttons
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.mainMenuBtn = document.getElementById('mainMenuBtn');
        this.modalClose = document.getElementById('modalClose');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.pauseResetBtn = document.getElementById('pauseResetBtn');
        this.nextLevelBtn = document.getElementById('nextLevelBtn');
        
        // Level complete elements
        this.completedLevelElement = document.getElementById('completedLevel');
        this.levelBonusElement = document.getElementById('levelBonus');
        this.levelTimeElement = document.getElementById('levelTime');
        
        // Ghost status elements
        this.ghostListElement = document.getElementById('ghostList');
        this.powerPelletTimerElement = document.getElementById('powerPelletTimer');
        this.timerValueElement = document.getElementById('timerValue');
        
        // Lists
        this.leaderboardElement = document.getElementById('leaderboard');
        this.achievementsListElement = document.getElementById('achievementsList');
        this.achievementsEarnedElement = document.getElementById('achievementsEarned');
        
        // Pause stats
        this.pauseScoreElement = document.getElementById('pauseScore');
        this.pauseLevelElement = document.getElementById('pauseLevel');
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
            this.mobileCenterBtn.addEventListener('click', () => this.togglePause());
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
                this.setDirection(1, 0); // Right
            } else {
                this.setDirection(-1, 0); // Left
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                this.setDirection(0, 1); // Down
            } else {
                this.setDirection(0, -1); // Up
            }
        }
    }
    
    handleMobileDirection(direction) {
        switch(direction) {
            case 'up':
                this.setDirection(0, -1);
                break;
            case 'down':
                this.setDirection(0, 1);
                break;
            case 'left':
                this.setDirection(-1, 0);
                break;
            case 'right':
                this.setDirection(1, 0);
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
        this.updateLeaderboard();
        this.updateAchievements();
        this.updateGhostStatus();
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
                case 'chomp':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
                    break;
                case 'powerPellet':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
                    break;
                case 'eatGhost':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
                    break;
                case 'death':
                    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.8);
                    break;
                case 'levelComplete':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.5);
                    break;
                case 'bonus':
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.3);
                    break;
                case 'achievement':
                    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1800, audioContext.currentTime + 0.4);
                    break;
                case 'click':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    break;
                case 'hover':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    break;
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (type === 'death' ? 0.8 : 0.3));
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + (type === 'death' ? 0.8 : 0.3));
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
                this.setDirection(0, -1);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                this.setDirection(0, 1);
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.setDirection(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.setDirection(1, 0);
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
    
    setDirection(dx, dy) {
        this.pacman.nextDirection = { x: dx, y: dy };
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameStartTime = Date.now();
        this.levelStartTime = Date.now();
        this.stats.deathsThisLevel = 0;
        
        // Update both desktop and mobile buttons
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        if (this.mobileStartBtn) {
            this.mobileStartBtn.disabled = true;
            this.mobilePauseBtn.disabled = false;
        }
        
        this.updateGameStatus('Jogo em andamento...');
        this.updateButtonText();
        this.closeAllModals();
        this.showReadyMessage();
        
        setTimeout(() => {
            this.hideReadyMessage();
            this.gameLoop();
        }, 2000);
    }
    
    showReadyMessage() {
        this.readyMessageElement.style.display = 'block';
        this.readyMessageElement.textContent = 'PREPARAR!';
        
        setTimeout(() => {
            this.readyMessageElement.textContent = 'COMEÇAR!';
        }, 1000);
    }
    
    hideReadyMessage() {
        this.readyMessageElement.style.display = 'none';
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
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameTime = 0;
        this.pelletsEaten = 0;
        this.powerMode.active = false;
        this.powerMode.timer = 0;
        this.powerMode.ghostsEaten = 0;
        this.bonusFruit = null;
        this.bonusFruitTimer = 0;
        this.stats.fruitsCollected = 0;
        this.stats.perfectLevels = 0;
        this.stats.deathsThisLevel = 0;
        
        // Reset positions
        this.pacman.x = 12;
        this.pacman.y = 18;
        this.pacman.direction = { x: 0, y: 0 };
        this.pacman.nextDirection = { x: 0, y: 0 };
        
        this.resetGhosts();
        this.board = this.createPerfectBoard();
        
        this.updateUI();
        this.updateGhostStatus();
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
    
    resetGhosts() {
        this.ghosts[0] = { x: 12, y: 11, direction: { x: -1, y: 0 }, color: '#ff0000', name: 'Blinky', mode: 'chase', modeTimer: 0, frightened: false, eaten: false };
        this.ghosts[1] = { x: 12, y: 12, direction: { x: 0, y: -1 }, color: '#ffb8ff', name: 'Pinky', mode: 'scatter', modeTimer: 0, frightened: false, eaten: false };
        this.ghosts[2] = { x: 11, y: 12, direction: { x: 0, y: 1 }, color: '#00ffff', name: 'Inky', mode: 'scatter', modeTimer: 0, frightened: false, eaten: false };
        this.ghosts[3] = { x: 13, y: 12, direction: { x: 0, y: 1 }, color: '#ffb852', name: 'Clyde', mode: 'scatter', modeTimer: 0, frightened: false, eaten: false };
    }
    
    restartGame() {
        this.resetGame();
        setTimeout(() => this.startGame(), 100);
    }
    
    nextLevel() {
        this.level++;
        this.pelletsEaten = 0;
        this.levelStartTime = Date.now();
        
        // Check for perfect level
        if (this.stats.deathsThisLevel === 0) {
            this.stats.perfectLevels++;
        }
        this.stats.deathsThisLevel = 0;
        
        // Reset positions
        this.pacman.x = 12;
        this.pacman.y = 18;
        this.pacman.direction = { x: 0, y: 0 };
        this.pacman.nextDirection = { x: 0, y: 0 };
        
        this.resetGhosts();
        this.board = this.createPerfectBoard();
        this.powerMode.active = false;
        this.powerMode.timer = 0;
        this.powerMode.ghostsEaten = 0;
        this.bonusFruit = null;
        this.bonusFruitTimer = 0;
        
        // Increase difficulty
        this.adjustDifficulty();
        
        this.updateUI();
        this.updateGhostStatus();
        this.closeAllModals();
        this.showReadyMessage();
        
        setTimeout(() => {
            this.hideReadyMessage();
            this.gameLoop();
        }, 2000);
    }
    
    adjustDifficulty() {
        const baseSpeed = {
            easy: { game: 150, ghost: 160, pacman: 110 },
            normal: { game: 120, ghost: 140, pacman: 100 },
            hard: { game: 100, ghost: 120, pacman: 90 },
            nightmare: { game: 80, ghost: 100, pacman: 80 }
        };
        
        const speeds = baseSpeed[this.difficulty];
        this.gameSpeed = Math.max(60, speeds.game - (this.level * 5));
        this.ghostSpeed = Math.max(80, speeds.ghost - (this.level * 3));
        this.pacmanSpeed = Math.max(70, speeds.pacman - (this.level * 2));
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
        this.levelElement.textContent = this.level;
        this.livesElement.textContent = this.lives;
        this.highScoreElement.textContent = this.highScore;
        
        // Update game time
        if (this.gameRunning && !this.gamePaused) {
            this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        }
        
        // Update power pellet timer
        if (this.powerMode.active) {
            const timeLeft = Math.ceil(this.powerMode.timer / 60);
            this.timerValueElement.textContent = timeLeft;
            this.powerPelletTimerElement.classList.add('active');
        } else {
            this.powerPelletTimerElement.classList.remove('active');
        }
    }
    
    updateGhostStatus() {
        const ghostItems = this.ghostListElement.querySelectorAll('.ghost-item');
        this.ghosts.forEach((ghost, index) => {
            if (ghostItems[index]) {
                const modeElement = ghostItems[index].querySelector('.ghost-mode');
                if (ghost.frightened) {
                    modeElement.textContent = 'Assustado';
                    modeElement.classList.add('frightened');
                } else {
                    modeElement.classList.remove('frightened');
                    switch(ghost.mode) {
                        case 'chase':
                            modeElement.textContent = 'Perseguir';
                            break;
                        case 'scatter':
                            modeElement.textContent = 'Dispersar';
                            break;
                        case 'eaten':
                            modeElement.textContent = 'Comido';
                            break;
                    }
                }
            }
        });
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    canMoveTo(x, y) {
        // Handle tunnel
        if (y === 9 && (x < 0 || x >= this.boardWidth)) {
            return true;
        }
        
        if (x < 0 || x >= this.boardWidth || y < 0 || y >= this.boardHeight) {
            return false;
        }
        
        return this.board[y][x] !== 1;
    }
    
    wrapPosition(x, y) {
        // Handle tunnel wrapping
        if (y === 9) {
            if (x < 0) return { x: this.boardWidth - 1, y };
            if (x >= this.boardWidth) return { x: 0, y };
        }
        return { x, y };
    }
    
    movePacman() {
        // Try to change direction if possible
        const newX = this.pacman.x + this.pacman.nextDirection.x;
        const newY = this.pacman.y + this.pacman.nextDirection.y;
        
        if (this.canMoveTo(newX, newY)) {
            this.pacman.direction = { ...this.pacman.nextDirection };
        }
        
        // Move in current direction
        const nextX = this.pacman.x + this.pacman.direction.x;
        const nextY = this.pacman.y + this.pacman.direction.y;
        
        if (this.canMoveTo(nextX, nextY)) {
            const wrapped = this.wrapPosition(nextX, nextY);
            this.pacman.x = wrapped.x;
            this.pacman.y = wrapped.y;
            
            // Animate mouth
            this.pacman.animFrame = (this.pacman.animFrame + 1) % 20;
            this.pacman.mouthOpen = this.pacman.animFrame < 10;
            
            // Check for pellets
            this.checkPelletCollision();
            
            // Check for bonus fruit
            this.checkBonusFruitCollision();
        }
    }
    
    checkPelletCollision() {
        const cell = this.board[this.pacman.y][this.pacman.x];
        
        if (cell === 2) {
            // Regular pellet
            this.board[this.pacman.y][this.pacman.x] = 0;
            this.score += 10;
            this.pelletsEaten++;
            this.playSound('chomp');
            this.createScorePopup(this.pacman.x, this.pacman.y, 10);
            
            // Check first pellet achievement
            if (this.pelletsEaten === 1) {
                this.unlockAchievement('firstPellet');
            }
            
            // Check if level complete
            if (this.pelletsEaten >= this.totalPellets) {
                this.levelComplete();
            }
        } else if (cell === 3) {
            // Power pellet
            this.board[this.pacman.y][this.pacman.x] = 0;
            this.score += 50;
            this.pelletsEaten++;
            this.playSound('powerPellet');
            this.createScorePopup(this.pacman.x, this.pacman.y, 50);
            
            // Activate power mode
            this.powerMode.active = true;
            this.powerMode.timer = this.powerMode.duration;
            this.powerMode.ghostsEaten = 0;
            
            // Frighten ghosts
            this.ghosts.forEach(ghost => {
                if (!ghost.eaten) {
                    ghost.frightened = true;
                    // Reverse direction
                    ghost.direction.x *= -1;
                    ghost.direction.y *= -1;
                }
            });
            
            this.updateGhostStatus();
            
            // Check if level complete
            if (this.pelletsEaten >= this.totalPellets) {
                this.levelComplete();
            }
        }
    }
    
    checkBonusFruitCollision() {
        if (this.bonusFruit && 
            this.pacman.x === this.bonusFruit.x && 
            this.pacman.y === this.bonusFruit.y) {
            
            this.score += this.bonusFruit.points;
            this.stats.fruitsCollected++;
            this.playSound('bonus');
            this.createScorePopup(this.bonusFruit.x, this.bonusFruit.y, this.bonusFruit.points);
            this.bonusFruit = null;
            
            // Check fruit collector achievement
            if (this.stats.fruitsCollected >= 10) {
                this.unlockAchievement('fruitCollector');
            }
        }
    }
    
    createScorePopup(x, y, points) {
        if (!this.particlesEnabled) return;
        
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.left = (x * this.cellSize + this.canvas.offsetLeft) + 'px';
        popup.style.top = (y * this.cellSize + this.canvas.offsetTop) + 'px';
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1000);
    }
    
    moveGhosts() {
        this.ghosts.forEach(ghost => {
            if (ghost.eaten) {
                // Move back to spawn
                this.moveGhostToSpawn(ghost);
                return;
            }
            
            // Simple AI movement
            const possibleMoves = this.getPossibleMoves(ghost.x, ghost.y);
            
            if (possibleMoves.length > 0) {
                // Choose direction based on mode
                let targetDirection;
                
                if (ghost.frightened) {
                    // Random movement when frightened
                    targetDirection = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                } else {
                    // Target pacman
                    targetDirection = this.getDirectionToPacman(ghost, possibleMoves);
                }
                
                ghost.direction = targetDirection;
                
                const newX = ghost.x + ghost.direction.x;
                const newY = ghost.y + ghost.direction.y;
                const wrapped = this.wrapPosition(newX, newY);
                ghost.x = wrapped.x;
                ghost.y = wrapped.y;
            }
        });
    }
    
    getPossibleMoves(x, y) {
        const moves = [];
        const directions = [
            { x: 0, y: -1 }, // Up
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }, // Left
            { x: 1, y: 0 }   // Right
        ];
        
        directions.forEach(dir => {
            if (this.canMoveTo(x + dir.x, y + dir.y)) {
                moves.push(dir);
            }
        });
        
        return moves;
    }
    
    getDirectionToPacman(ghost, possibleMoves) {
        let bestMove = possibleMoves[0];
        let minDistance = Infinity;
        
        possibleMoves.forEach(move => {
            const newX = ghost.x + move.x;
            const newY = ghost.y + move.y;
            const distance = Math.abs(newX - this.pacman.x) + Math.abs(newY - this.pacman.y);
            
            if (distance < minDistance) {
                minDistance = distance;
                bestMove = move;
            }
        });
        
        return bestMove;
    }
    
    moveGhostToSpawn(ghost) {
        const spawnX = 12;
        const spawnY = 12;
        
        if (ghost.x === spawnX && ghost.y === spawnY) {
            ghost.eaten = false;
            ghost.frightened = false;
            return;
        }
        
        // Simple pathfinding to spawn
        if (ghost.x < spawnX) ghost.direction = { x: 1, y: 0 };
        else if (ghost.x > spawnX) ghost.direction = { x: -1, y: 0 };
        else if (ghost.y < spawnY) ghost.direction = { x: 0, y: 1 };
        else if (ghost.y > spawnY) ghost.direction = { x: 0, y: -1 };
        
        const newX = ghost.x + ghost.direction.x;
        const newY = ghost.y + ghost.direction.y;
        
        if (this.canMoveTo(newX, newY)) {
            ghost.x = newX;
            ghost.y = newY;
        }
    }
    
    checkGhostCollisions() {
        this.ghosts.forEach(ghost => {
            if (ghost.x === this.pacman.x && ghost.y === this.pacman.y) {
                if (ghost.frightened && !ghost.eaten) {
                    // Eat ghost
                    ghost.eaten = true;
                    ghost.frightened = false;
                    this.powerMode.ghostsEaten++;
                    
                    const points = 200 * Math.pow(2, this.powerMode.ghostsEaten - 1);
                    this.score += points;
                    this.playSound('eatGhost');
                    this.createScorePopup(ghost.x, ghost.y, points);
                    
                    // Check ghost hunter achievement
                    if (this.powerMode.ghostsEaten === 4) {
                        this.unlockAchievement('ghostHunter');
                    }
                } else if (!ghost.eaten) {
                    // Pacman dies
                    this.pacmanDie();
                }
            }
        });
    }
    
    pacmanDie() {
        this.lives--;
        this.stats.deathsThisLevel++;
        this.playSound('death');
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Reset positions
            this.pacman.x = 12;
            this.pacman.y = 18;
            this.pacman.direction = { x: 0, y: 0 };
            this.pacman.nextDirection = { x: 0, y: 0 };
            
            this.resetGhosts();
            this.powerMode.active = false;
            this.powerMode.timer = 0;
            this.powerMode.ghostsEaten = 0;
            
            this.updateUI();
            this.updateGhostStatus();
            
            // Show ready message again
            this.showReadyMessage();
            setTimeout(() => {
                this.hideReadyMessage();
            }, 2000);
        }
    }
    
    updatePowerMode() {
        if (this.powerMode.active) {
            this.powerMode.timer--;
            
            if (this.powerMode.timer <= 0) {
                this.powerMode.active = false;
                this.powerMode.ghostsEaten = 0;
                
                // Un-frighten ghosts
                this.ghosts.forEach(ghost => {
                    if (!ghost.eaten) {
                        ghost.frightened = false;
                    }
                });
                
                this.updateGhostStatus();
            }
        }
    }
    
    updateBonusFruit() {
        this.bonusFruitTimer++;
        
        // Spawn bonus fruit occasionally
        if (!this.bonusFruit && this.bonusFruitTimer > 1800 && Math.random() < 0.01) {
            const fruits = ['🍒', '🍓', '🍑', '🍊', '🍎'];
            const points = [100, 300, 500, 700, 1000];
            const fruitIndex = Math.min(this.level - 1, fruits.length - 1);
            
            // Find empty spot
            let x, y;
            do {
                x = Math.floor(Math.random() * this.boardWidth);
                y = Math.floor(Math.random() * this.boardHeight);
            } while (this.board[y][x] !== 0);
            
            this.bonusFruit = {
                x: x,
                y: y,
                type: fruits[fruitIndex],
                points: points[fruitIndex],
                timer: 600 // 10 seconds
            };
        }
        
        // Remove bonus fruit after timeout
        if (this.bonusFruit) {
            this.bonusFruit.timer--;
            if (this.bonusFruit.timer <= 0) {
                this.bonusFruit = null;
            }
        }
    }
    
    levelComplete() {
        this.gameRunning = false;
        this.playSound('levelComplete');
        
        // Calculate bonus
        const levelTime = Math.floor((Date.now() - this.levelStartTime) / 1000);
        const timeBonus = Math.max(0, (120 - levelTime) * 10);
        const levelBonus = this.level * 1000 + timeBonus;
        this.score += levelBonus;
        
        // Check speedrunner achievement
        if (levelTime <= 60) {
            this.unlockAchievement('speedrunner');
        }
        
        // Check perfectionist achievement
        if (this.stats.deathsThisLevel === 0) {
            this.unlockAchievement('perfectionist');
        }
        
        this.updateUI();
        this.showLevelCompleteModal(levelBonus, levelTime);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.playSound('death');
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
    
    unlockAchievement(achievementKey) {
        if (!this.achievements[achievementKey].unlocked) {
            this.achievements[achievementKey].unlocked = true;
            this.showAchievementNotification(achievementKey);
            this.updateAchievements();
            this.playSound('achievement');
        }
    }
    
    showAchievementNotification(achievementKey) {
    // Adiciona CSS para animações se não existir
    this.addAchievementCSS();
    
    const achievement = this.achievements[achievementKey];
    if (!achievement) return;
    
    // Create achievement popup
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
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
        pointer-events: none;
        transform: translateX(100%);
        transition: transform 0.5s ease-out;
        max-width: 300px;
    `;
    
    popup.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">${this.getAchievementIcon(achievementKey)}</span>
            <div>
                <div style="font-size: 12px; opacity: 0.8;">CONQUISTA DESBLOQUEADA</div>
                <div>${achievement.name}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Trigger slide-in animation
    setTimeout(() => {
        popup.style.transform = 'translateX(0)';
    }, 10);
    
    // Slide out and remove after 3.5 seconds
    setTimeout(() => {
        popup.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 500);
    }, 3000);
    
    // Add to achievements earned element if it exists
    if (this.achievementsEarnedElement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <span style="margin-right: 8px;">${this.getAchievementIcon(achievementKey)}</span>
            ${achievement.name} desbloqueada!
        `;
        this.achievementsEarnedElement.appendChild(notification);
    }
}

    // Adiciona CSS necessário para as animações
    addAchievementCSS() {
        if (document.getElementById('achievement-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'achievement-styles';
        style.textContent = `
            .achievement-popup {
                animation: achievementPulse 0.6s ease-out;
            }
            
            @keyframes achievementPulse {
                0% { transform: translateX(100%) scale(0.8); }
                50% { transform: translateX(-10px) scale(1.05); }
                100% { transform: translateX(0) scale(1); }
            }
            
            .achievement-notification {
                padding: 8px 12px;
                margin: 4px 0;
                background: rgba(255, 133, 0, 0.2);
                border-left: 4px solid #ff8500;
                border-radius: 4px;
                font-size: 12px;
                display: flex;
                align-items: center;
            }
            
            @media (max-width: 768px) {
                .achievement-popup {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                    font-size: 12px;
                    padding: 12px 15px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

// Função simplificada para desbloquear conquista (substitui a anterior)
unlockAchievement(achievementKey) {
    if (!this.achievements[achievementKey] || this.achievements[achievementKey].unlocked) {
        return; // Já desbloqueada ou não existe
    }
    
    // Marcar como desbloqueada
    this.achievements[achievementKey].unlocked = true;
    
    // Mostrar notificação
    this.showAchievementNotification(achievementKey);
    
    // Atualizar lista de conquistas
    this.updateAchievements();
    
    // Tocar som
    this.playSound('achievement');
    
    console.log(`🏆 Conquista desbloqueada: ${this.achievements[achievementKey].name}`);
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
            firstPellet: '🔴',
            ghostHunter: '👻',
            fruitCollector: '🍒',
            speedrunner: '🏃',
            perfectionist: '💎'
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
    
    updateLeaderboardWithScore(score) {
        this.leaderboard.push(score);
        this.leaderboard.sort((a, b) => b - a);
        this.leaderboard = this.leaderboard.slice(0, 10); // Keep top 10
        this.saveLeaderboard();
        this.updateLeaderboard();
    }
    
    draw() {
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        gradient.addColorStop(0, '#000011');
        gradient.addColorStop(0.5, '#000022');
        gradient.addColorStop(1, '#000011');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw board
        this.drawBoard();
        
        // Draw bonus fruit
        if (this.bonusFruit) {
            this.drawBonusFruit();
        }
        
        // Draw pacman
        this.drawPacman();
        
        // Draw ghosts
        this.drawGhosts();
        
        // Draw pause overlay
        if (this.gamePaused) {
            this.drawPauseOverlay();
        }
        
        // Update mini map
        this.drawMiniMap();
    }
    
    drawBoard() {
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const cell = this.board[y][x];
                const pixelX = x * this.cellSize;
                const pixelY = y * this.cellSize;
                
                switch (cell) {
                    case 1: // Wall
                        this.ctx.fillStyle = '#0080ff';
                        this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
                        
                        // Add wall glow effect
                        this.ctx.shadowColor = '#0080ff';
                        this.ctx.shadowBlur = 8;
                        this.ctx.fillStyle = '#0099ff';
                        this.ctx.fillRect(pixelX + 1, pixelY + 1, this.cellSize - 2, this.cellSize - 2);
                        this.ctx.shadowBlur = 0;
                        break;
                        
                    case 2: // Pellet
                        this.ctx.fillStyle = '#ffff00';
                        this.ctx.shadowColor = '#ffff00';
                        this.ctx.shadowBlur = 5;
                        this.ctx.beginPath();
                        this.ctx.arc(
                            pixelX + this.cellSize / 2,
                            pixelY + this.cellSize / 2,
                            2,
                            0,
                            Math.PI * 2
                        );
                        this.ctx.fill();
                        this.ctx.shadowBlur = 0;
                        break;
                        
                    case 3: // Power pellet
                        const pulseScale = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.shadowColor = '#ffffff';
                        this.ctx.shadowBlur = 15;
                        this.ctx.beginPath();
                        this.ctx.arc(
                            pixelX + this.cellSize / 2,
                            pixelY + this.cellSize / 2,
                            6 * pulseScale,
                            0,
                            Math.PI * 2
                        );
                        this.ctx.fill();
                        this.ctx.shadowBlur = 0;
                        break;
                        
                    case 4: // Tunnel
                        this.ctx.fillStyle = '#000080';
                        this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
                        break;
                }
            }
        }
    }
    
    drawPacman() {
        const pixelX = this.pacman.x * this.cellSize + this.cellSize / 2;
        const pixelY = this.pacman.y * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize / 2 - 2;
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = 15;
        
        this.ctx.beginPath();
        
        if (this.pacman.mouthOpen && (this.pacman.direction.x !== 0 || this.pacman.direction.y !== 0)) {
            // Calculate mouth angle based on direction
            let startAngle = 0;
            if (this.pacman.direction.x === 1) startAngle = 0.2 * Math.PI; // Right
            else if (this.pacman.direction.x === -1) startAngle = 1.2 * Math.PI; // Left
            else if (this.pacman.direction.y === -1) startAngle = 1.7 * Math.PI; // Up
            else if (this.pacman.direction.y === 1) startAngle = 0.7 * Math.PI; // Down
            
            this.ctx.arc(pixelX, pixelY, radius, startAngle, startAngle + 1.6 * Math.PI);
            this.ctx.lineTo(pixelX, pixelY);
        } else {
            // Closed mouth (full circle)
            this.ctx.arc(pixelX, pixelY, radius, 0, Math.PI * 2);
        }
        
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Add eye
        if (this.pacman.direction.x !== 0 || this.pacman.direction.y !== 0) {
            this.ctx.fillStyle = '#000';
            const eyeOffset = 3;
            let eyeX = pixelX;
            let eyeY = pixelY - 5;
            
            // Adjust eye position based on direction
            if (this.pacman.direction.x === 1) eyeX += eyeOffset; // Right
            else if (this.pacman.direction.x === -1) eyeX -= eyeOffset; // Left
            
            this.ctx.beginPath();
            this.ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawGhosts() {
        this.ghosts.forEach(ghost => {
            const pixelX = ghost.x * this.cellSize + this.cellSize / 2;
            const pixelY = ghost.y * this.cellSize + this.cellSize / 2;
            const radius = this.cellSize / 2 - 2;
            
            // Set color based on state
            let ghostColor = ghost.color;
            if (ghost.frightened && !ghost.eaten) {
                ghostColor = this.powerMode.timer > 120 ? '#0000ff' : '#ffffff';
                // Blink when power mode is ending
                if (this.powerMode.timer <= 120 && Math.floor(this.powerMode.timer / 10) % 2) {
                    ghostColor = ghost.color;
                }
            } else if (ghost.eaten) {
                ghostColor = '#666666';
            }
            
            this.ctx.fillStyle = ghostColor;
            this.ctx.shadowColor = ghostColor;
            this.ctx.shadowBlur = ghost.frightened ? 20 : 10;
            
            // Draw ghost body (semi-circle with wavy bottom)
            this.ctx.beginPath();
            this.ctx.arc(pixelX, pixelY, radius, Math.PI, 0);
            
            // Draw wavy bottom
            const waveHeight = 4;
            const waveWidth = radius / 3;
            for (let i = 0; i < 3; i++) {
                const waveX = pixelX - radius + (i * waveWidth * 2);
                this.ctx.lineTo(waveX + waveWidth, pixelY + radius - waveHeight);
                this.ctx.lineTo(waveX + waveWidth * 2, pixelY + radius);
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // Draw eyes (if not eaten)
            if (!ghost.eaten) {
                this.ctx.fillStyle = ghost.frightened ? '#ff0000' : '#ffffff';
                
                // Left eye
                this.ctx.beginPath();
                this.ctx.arc(pixelX - 4, pixelY - 3, 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Right eye
                this.ctx.beginPath();
                this.ctx.arc(pixelX + 4, pixelY - 3, 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Eye pupils (if not frightened)
                if (!ghost.frightened) {
                    this.ctx.fillStyle = '#000';
                    
                    // Left pupil
                    this.ctx.beginPath();
                    this.ctx.arc(pixelX - 4, pixelY - 3, 1, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Right pupil
                    this.ctx.beginPath();
                    this.ctx.arc(pixelX + 4, pixelY - 3, 1, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        });
    }
    
    drawBonusFruit() {
        const pixelX = this.bonusFruit.x * this.cellSize + this.cellSize / 2;
        const pixelY = this.bonusFruit.y * this.cellSize + this.cellSize / 2;
        
        // Draw fruit with glow effect
        this.ctx.font = `${this.cellSize - 4}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = 20;
        this.ctx.fillText(this.bonusFruit.type, pixelX, pixelY);
        this.ctx.shadowBlur = 0;
        
        // Add floating animation
        const floatOffset = Math.sin(Date.now() * 0.005) * 2;
        this.ctx.fillText(this.bonusFruit.type, pixelX, pixelY + floatOffset);
    }
    
    drawPauseOverlay() {
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Pause text with glow
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = `bold ${Math.min(48, canvasWidth / 12)}px Orbitron`;
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = 30;
        this.ctx.fillText('PAUSADO', canvasWidth / 2, canvasHeight / 2);
        this.ctx.shadowBlur = 0;
        
        // Instructions
        this.ctx.fillStyle = '#ccc';
        this.ctx.font = `${Math.min(16, canvasWidth / 25)}px Orbitron`;
        const instructionText = this.isMobile ? 'Toque para continuar' : 'Pressione ESPAÇO ou ESC para continuar';
        this.ctx.fillText(instructionText, canvasWidth / 2, canvasHeight / 2 + 40);
    }
    
    drawMiniMap() {
        const ctx = this.miniMapCtx;
        const scale = this.miniMapScale;
        
        // Clear mini map
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.miniMapCanvas.width, this.miniMapCanvas.height);
        
        // Draw walls
        ctx.fillStyle = '#0080ff';
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x] === 1) {
                    ctx.fillRect(
                        x * this.cellSize * scale,
                        y * this.cellSize * scale,
                        this.cellSize * scale,
                        this.cellSize * scale
                    );
                }
            }
        }
        
        // Draw pacman
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(
            (this.pacman.x * this.cellSize + this.cellSize / 2) * scale,
            (this.pacman.y * this.cellSize + this.cellSize / 2) * scale,
            3,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw ghosts
        this.ghosts.forEach(ghost => {
            ctx.fillStyle = ghost.frightened ? '#0000ff' : ghost.color;
            ctx.beginPath();
            ctx.arc(
                (ghost.x * this.cellSize + this.cellSize / 2) * scale,
                (ghost.y * this.cellSize + this.cellSize / 2) * scale,
                2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
        
        // Draw bonus fruit
        if (this.bonusFruit) {
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(
                (this.bonusFruit.x * this.cellSize + this.cellSize / 2) * scale,
                (this.bonusFruit.y * this.cellSize + this.cellSize / 2) * scale,
                2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.movePacman();
        this.moveGhosts();
        this.checkGhostCollisions();
        this.updatePowerMode();
        this.updateBonusFruit();
        this.updateUI();
        this.updateGhostStatus();
        this.draw();
        
        setTimeout(() => this.gameLoop(), this.gameSpeed);
    }
    
    showGameOverModal(isNewRecord) {
        this.finalScoreElement.textContent = this.score;
        this.finalLevelElement.textContent = this.level;
        this.finalPelletsElement.textContent = this.pelletsEaten;
        this.gameTimeElement.textContent = this.formatTime(this.gameTime);
        this.newRecordElement.style.display = isNewRecord ? 'block' : 'none';
        
        // Clear previous achievements
        this.achievementsEarnedElement.innerHTML = '';
        
        this.gameOverModal.style.display = 'block';
    }
    
    showLevelCompleteModal(bonus, time) {
        this.completedLevelElement.textContent = this.level;
        this.levelBonusElement.textContent = bonus;
        this.levelTimeElement.textContent = this.formatTime(time);
        
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
        // localStorage.setItem('pacmanHighScore', this.highScore);
    }
    
    getStoredLeaderboard() {
        // For Claude.ai compatibility, use in-memory storage
        return this.leaderboard || [];
    }
    
    saveLeaderboard() {
        // In a real environment, this would use localStorage
        // localStorage.setItem('pacmanLeaderboard', JSON.stringify(this.leaderboard));
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new PacManGame();
    
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
    console.log('🟡 Pac-Man Game - Mapa Perfeito Carregado!');
    console.log('Controles:');
    if (game.isMobile) {
        console.log('  Toque: Use os botões na tela');
        console.log('  Deslize: Deslize na tela do jogo para mover');
    } else {
        console.log('  ↑↓←→ ou WASD: Mover Pac-Man');
        console.log('  ESPAÇO: Pausar/Continuar');
        console.log('  R: Reiniciar');
        console.log('  ESC: Menu de pausa');
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
    
    // Easter egg: Konami code
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.key);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
            // Activate easter egg
            game.score += 10000;
            game.lives += 5;
            game.updateUI();
            console.log('🎉 Konami Code activated! Bonus score and lives!');
            game.playSound('achievement');
            konamiCode = [];
        }
    });
    
    // Add debug mode (activated by typing "debug")
    let debugSequence = '';
    document.addEventListener('keypress', (e) => {
        debugSequence += e.key;
        if (debugSequence.length > 5) {
            debugSequence = debugSequence.slice(-5);
        }
        
        if (debugSequence === 'debug') {
            console.log('🐛 Debug mode activated!');
            console.log('Game state:', {
                score: game.score,
                level: game.level,
                lives: game.lives,
                pelletsEaten: game.pelletsEaten,
                totalPellets: game.totalPellets,
                powerMode: game.powerMode,
                pacmanPosition: { x: game.pacman.x, y: game.pacman.y },
                ghostPositions: game.ghosts.map(g => ({ name: g.name, x: g.x, y: g.y, mode: g.mode }))
            });
            
            // Add debug commands
            window.gameDebug = {
                addScore: (points) => {
                    game.score += points;
                    game.updateUI();
                },
                addLives: (lives) => {
                    game.lives += lives;
                    game.updateUI();
                },
                skipLevel: () => {
                    game.levelComplete();
                },
                activatePowerMode: () => {
                    game.powerMode.active = true;
                    game.powerMode.timer = 600;
                    game.ghosts.forEach(ghost => {
                        if (!ghost.eaten) ghost.frightened = true;
                    });
                    game.updateGhostStatus();
                },
                teleportPacman: (x, y) => {
                    if (game.canMoveTo(x, y)) {
                        game.pacman.x = x;
                        game.pacman.y = y;
                        game.draw();
                    }
                }
            };
            
            console.log('Debug commands available in window.gameDebug:', Object.keys(window.gameDebug));
            debugSequence = '';
        }
    });
    
    // Final initialization complete
    game.updateGameStatus('🟡 Pac-Man com Mapa Perfeito pronto para jogar!');
    
    console.log(`
    🟡 Pac-Man Game - Mapa Perfeito Carregado!
    
    🎮 Melhorias no Mapa:
    • Layout clássico e simétrico do Pac-Man
    • Dimensões perfeitas 25x25
    • Posicionamento estratégico dos power pellets
    • Túneis laterais funcionais
    • Área de spawn dos fantasmas bem definida
    • Corredores organizados e navegáveis
    • Densidade equilibrada de pellets
    
    🏆 Características:
    • 244 pellets + 4 power pellets = 248 total
    • Layout baseado no Pac-Man original
    • Pathfinding otimizado para fantasmas
    • Área central protegida para spawn
    • Cantos estratégicos para power pellets
    
    Boa sorte e divirta-se!
    `);

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