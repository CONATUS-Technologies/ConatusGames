class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.holdCanvas = document.getElementById('holdCanvas');
        this.holdCtx = this.holdCanvas.getContext('2d');
        
        // Game settings
        this.boardWidth = 10;
        this.boardHeight = 20;
        this.blockSize = this.canvas.width / this.boardWidth;
        
        // Responsive settings
        this.isMobile = this.detectMobile();
        this.setupCanvas();
        
        // Game state
        this.board = this.createBoard();
        this.currentPiece = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.canHold = true;
        this.ghostPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.highScore = this.getStoredHighScore();
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropTime = 0;
        this.lastTime = 0;
        this.gameStartTime = 0;
        this.gameTime = 0;
        
        // Game mechanics
        this.dropInterval = 1000; // ms
        this.lockDelay = 500;
        this.lockTime = 0;
        this.linesCleared = 0;
        this.combo = 0;
        this.backToBack = false;
        
        // Settings
        this.soundEnabled = true;
        this.ghostEnabled = true;
        this.difficulty = 'normal';
        
        // FPS tracking
        this.fps = 0;
        this.frameCount = 0;
        this.fpsLastTime = 0;
        
        // Touch controls
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 30;
        
        // Achievements
        this.achievements = {
            firstLine: { unlocked: false, name: 'Primeira Linha', desc: 'Complete sua primeira linha' },
            tetrisMaster: { unlocked: false, name: 'Tetris Master', desc: 'Complete 4 linhas de uma vez' },
            speedster: { unlocked: false, name: 'Velocista', desc: 'Alcance o nível 10' },
            comboMaster: { unlocked: false, name: 'Combo Master', desc: 'Faça 10 linhas seguidas' },
            survivor: { unlocked: false, name: 'Sobrevivente', desc: 'Jogue por 10 minutos' }
        };
        
        // Leaderboard
        this.leaderboard = this.getStoredLeaderboard();

        // Tetris pieces (Tetrominoes)
        this.pieces = {
            I: {
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: '#00f5ff'
            },
            O: {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: '#ffff00'
            },
            T: {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#9d4edd'
            },
            S: {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ],
                color: '#00ff00'
            },
            Z: {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ],
                color: '#ff0000'
            },
            J: {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#0080ff'
            },
            L: {
                shape: [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#ff8500'
            }
        };
        
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
            
            // Same for next and hold canvas
            this.nextCanvas.style.width = this.nextCanvas.width + 'px';
            this.nextCanvas.style.height = this.nextCanvas.height + 'px';
            this.nextCanvas.width = this.nextCanvas.width * devicePixelRatio;
            this.nextCanvas.height = this.nextCanvas.height * devicePixelRatio;
            this.nextCtx.scale(devicePixelRatio, devicePixelRatio);
            
            this.holdCanvas.style.width = this.holdCanvas.width + 'px';
            this.holdCanvas.style.height = this.holdCanvas.height + 'px';
            this.holdCanvas.width = this.holdCanvas.width * devicePixelRatio;
            this.holdCanvas.height = this.holdCanvas.height * devicePixelRatio;
            this.holdCtx.scale(devicePixelRatio, devicePixelRatio);
        }
        
        this.blockSize = this.canvas.width / (window.devicePixelRatio || 1) / this.boardWidth;
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.linesElement = document.getElementById('lines');
        this.levelElement = document.getElementById('level');
        this.highScoreElement = document.getElementById('highScore');
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
        
        // Settings
        this.soundToggle = document.getElementById('soundToggle');
        this.ghostToggle = document.getElementById('ghostToggle');
        this.difficultySelect = document.getElementById('difficultySelect');
        
        // Modals
        this.gameOverModal = document.getElementById('gameOverModal');
        this.pauseMenu = document.getElementById('pauseMenu');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalLinesElement = document.getElementById('finalLines');
        this.finalLevelElement = document.getElementById('finalLevel');
        this.gameTimeElement = document.getElementById('gameTime');
        this.newRecordElement = document.getElementById('newRecord');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.mainMenuBtn = document.getElementById('mainMenuBtn');
        this.modalClose = document.getElementById('modalClose');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.pauseResetBtn = document.getElementById('pauseResetBtn');
        
        // Effects
        this.lineClearEffect = document.getElementById('lineClearEffect');
        
        // Lists
        this.leaderboardElement = document.getElementById('leaderboard');
        this.achievementsListElement = document.getElementById('achievementsList');
        this.achievementsEarnedElement = document.getElementById('achievementsEarned');
        
        // Pause stats
        this.pauseScoreElement = document.getElementById('pauseScore');
        this.pauseLinesElement = document.getElementById('pauseLines');
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
        this.ghostToggle.addEventListener('change', (e) => {
            this.ghostEnabled = e.target.checked;
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
        
        // Mobile action buttons
        const mobileButtons = document.querySelectorAll('.mobile-btn[data-action]');
        mobileButtons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.handleMobileAction(action);
                this.addTouchFeedback(btn);
            });
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.handleMobileAction(action);
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
                this.movePiece(1, 0); // Right
            } else {
                this.movePiece(-1, 0); // Left
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                this.softDrop(); // Down
            } else {
                this.rotatePiece(); // Up (rotate)
            }
        }
    }
    
    handleMobileAction(action) {
        switch(action) {
            case 'left':
                this.movePiece(-1, 0);
                break;
            case 'right':
                this.movePiece(1, 0);
                break;
            case 'down':
                this.softDrop();
                break;
            case 'rotate':
                this.rotatePiece();
                break;
            case 'drop':
                this.hardDrop();
                break;
            case 'hold':
                this.holdCurrentPiece();
                break;
            case 'pause':
                this.togglePause();
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
        this.updateUI();
        this.updateLeaderboard();
        this.updateAchievements();
        this.generateNextPiece();
        this.spawnPiece();
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
            if (timestamp - this.fpsLastTime >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.fpsLastTime = timestamp;
                if (this.fpsCounterElement) {
                    this.fpsCounterElement.textContent = `FPS: ${this.fps}`;
                }
            }
            requestAnimationFrame(updateFPS);
        };
        requestAnimationFrame(updateFPS);
    }
    
    createBoard() {
        return Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
    }
    
    generateNextPiece() {
        const pieceTypes = Object.keys(this.pieces);
        const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        this.nextPiece = {
            type: randomType,
            shape: this.pieces[randomType].shape,
            color: this.pieces[randomType].color,
            x: 0,
            y: 0
        };
    }
    
    spawnPiece() {
        if (this.nextPiece) {
            this.currentPiece = {
                ...this.nextPiece,
                x: Math.floor(this.boardWidth / 2) - Math.floor(this.nextPiece.shape[0].length / 2),
                y: 0
            };
            this.generateNextPiece();
            this.canHold = true;
            this.lockTime = 0;
            
            // Check for game over
            if (this.checkCollision(this.currentPiece, 0, 0)) {
                this.gameOver();
                return;
            }
            
            this.updateGhostPiece();
        }
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
                case 'move':
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                    break;
                case 'rotate':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    break;
                case 'drop':
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
                    break;
                case 'lineClear':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
                    break;
                case 'tetris':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.5);
                    break;
                case 'gameOver':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1);
                    break;
                case 'levelUp':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.3);
                    break;
                case 'hold':
                    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
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
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) {
            if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                if (this.gameRunning) {
                    this.togglePause();
                } else {
                    this.startGame();
                }
            }
            if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                this.resetGame();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                if (this.gameRunning) {
                    this.togglePause();
                }
            }
            return;
        }
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                this.softDrop();
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                this.rotatePiece();
                break;
            case ' ':
                e.preventDefault();
                this.hardDrop();
                break;
            case 'c':
            case 'C':
                e.preventDefault();
                this.holdCurrentPiece();
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                this.togglePause();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                this.resetGame();
                break;
            case 'Escape':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return;
        
        if (!this.checkCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            this.updateGhostPiece();
            if (dx !== 0) this.playSound('move');
            this.lockTime = 0; // Reset lock timer when piece moves
            this.draw();
        }
    }
    
    rotatePiece() {
        if (!this.currentPiece) return;
        
        const rotated = this.getRotatedPiece(this.currentPiece);
        
        // Try basic rotation
        if (!this.checkCollision(rotated, 0, 0)) {
            this.currentPiece.shape = rotated.shape;
            this.updateGhostPiece();
            this.playSound('rotate');
            this.lockTime = 0;
            this.draw();
            return;
        }
        
        // Try wall kicks (Super Rotation System)
        const kicks = this.getWallKicks(this.currentPiece.type);
        for (let kick of kicks) {
            if (!this.checkCollision(rotated, kick.x, kick.y)) {
                this.currentPiece.shape = rotated.shape;
                this.currentPiece.x += kick.x;
                this.currentPiece.y += kick.y;
                this.updateGhostPiece();
                this.playSound('rotate');
                this.lockTime = 0;
                this.draw();
                return;
            }
        }
    }
    
    getRotatedPiece(piece) {
        const rotated = JSON.parse(JSON.stringify(piece));
        const size = piece.shape.length;
        
        // Rotate 90 degrees clockwise
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                rotated.shape[j][size - 1 - i] = piece.shape[i][j];
            }
        }
        
        return rotated;
    }
    
    getWallKicks(pieceType) {
        // Simplified wall kick system
        if (pieceType === 'I') {
            return [
                { x: -1, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 2, y: 0 },
                { x: 0, y: -1 }, { x: 0, y: 1 }
            ];
        } else {
            return [
                { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 },
                { x: -1, y: -1 }, { x: 1, y: -1 }
            ];
        }
    }
    
    softDrop() {
        if (!this.currentPiece) return;
        
        if (!this.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
            this.score += 1;
            this.lockTime = 0;
            this.draw();
            this.updateUI();
        }
    }
    
    hardDrop() {
        if (!this.currentPiece) return;
        
        let dropDistance = 0;
        while (!this.checkCollision(this.currentPiece, 0, dropDistance + 1)) {
            dropDistance++;
        }
        
        this.currentPiece.y += dropDistance;
        this.score += dropDistance * 2;
        this.playSound('drop');
        this.lockPiece();
        this.updateUI();
        this.draw();
    }
    
    holdCurrentPiece() {
        if (!this.currentPiece || !this.canHold) return;
        
        if (this.holdPiece) {
            // Swap current and hold pieces
            const temp = this.holdPiece;
            this.holdPiece = {
                type: this.currentPiece.type,
                shape: this.pieces[this.currentPiece.type].shape,
                color: this.pieces[this.currentPiece.type].color
            };
            this.currentPiece = {
                ...temp,
                x: Math.floor(this.boardWidth / 2) - Math.floor(temp.shape[0].length / 2),
                y: 0
            };
        } else {
            // First time holding
            this.holdPiece = {
                type: this.currentPiece.type,
                shape: this.pieces[this.currentPiece.type].shape,
                color: this.pieces[this.currentPiece.type].color
            };
            this.spawnPiece();
        }
        
        this.canHold = false;
        this.updateGhostPiece();
        this.playSound('hold');
        this.draw();
    }
    
    updateGhostPiece() {
        if (!this.currentPiece || !this.ghostEnabled) {
            this.ghostPiece = null;
            return;
        }
        
        this.ghostPiece = JSON.parse(JSON.stringify(this.currentPiece));
        
        // Drop ghost piece to the bottom
        while (!this.checkCollision(this.ghostPiece, 0, 1)) {
            this.ghostPiece.y++;
        }
    }
    
    checkCollision(piece, dx, dy) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x + dx;
                    const newY = piece.y + y + dy;
                    
                    // Check boundaries
                    if (newX < 0 || newX >= this.boardWidth || newY >= this.boardHeight) {
                        return true;
                    }
                    
                    // Check board collision (but not if we're above the board)
                    if (newY >= 0 && this.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    lockPiece() {
        if (!this.currentPiece) return;
        
        // Place piece on board
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        // Check for line clears
        const clearedLines = this.clearLines();
        
        // Update score and level
        this.updateScore(clearedLines);
        
        // Spawn next piece
        this.spawnPiece();
        
        // Check achievements
        this.checkAchievements();
    }
    
    clearLines() {
        const linesToClear = [];
        
        // Find completed lines
        for (let y = 0; y < this.boardHeight; y++) {
            if (this.board[y].every(cell => cell !== 0)) {
                linesToClear.push(y);
            }
        }
        
        if (linesToClear.length > 0) {
            // Remove completed lines
            for (let y of linesToClear) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.boardWidth).fill(0));
            }
            
            this.lines += linesToClear.length;
            this.linesCleared += linesToClear.length;
            this.combo++;
            
            // Play sound based on lines cleared
            if (linesToClear.length === 4) {
                this.playSound('tetris');
                this.showLineClearEffect('TETRIS!', 800);
                this.backToBack = true;
            } else {
                this.playSound('lineClear');
                this.showLineClearEffect(`${linesToClear.length} LINE${linesToClear.length > 1 ? 'S' : ''}!`, 
                                       linesToClear.length * 100);
                this.backToBack = false;
            }
        } else {
            this.combo = 0;
        }
        
        return linesToClear.length;
    }
    
    showLineClearEffect(text, points) {
        const effectElement = this.lineClearEffect;
        const textElement = effectElement.querySelector('.line-clear-text');
        const multiplierElement = effectElement.querySelector('.line-clear-multiplier');
        
        textElement.textContent = text;
        multiplierElement.textContent = `+${points}`;
        
        effectElement.style.display = 'block';
        
        setTimeout(() => {
            effectElement.style.display = 'none';
        }, 1500);
    }
    
    updateScore(linesCleared) {
        if (linesCleared === 0) return;
        
        // Scoring system based on Tetris guidelines
        const basePoints = [0, 40, 100, 300, 1200];
        let points = basePoints[linesCleared] * this.level;
        
        // Combo bonus
        if (this.combo > 1) {
            points += 50 * this.combo * this.level;
        }
        
        // Back-to-back bonus for Tetris
        if (linesCleared === 4 && this.backToBack) {
            points = Math.floor(points * 1.5);
        }
        
        this.score += points;
        
        // Level up every 10 lines
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
            this.playSound('levelUp');
        }
        
        this.updateUI();
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
        } else {
            this.updateGameStatus('Jogo em andamento...');
            this.closeAllModals();
            this.gameLoop();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.board = this.createBoard();
        this.currentPiece = null;
        this.holdPiece = null;
        this.canHold = true;
        this.ghostPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.dropTime = 0;
        this.lockTime = 0;
        this.gameTime = 0;
        this.linesCleared = 0;
        this.combo = 0;
        this.backToBack = false;
        
        this.updateUI();
        this.generateNextPiece();
        this.spawnPiece();
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
            const speeds = {
                easy: 1200,
                normal: 1000,
                hard: 800,
                extreme: 600
            };
            this.dropInterval = Math.max(50, speeds[this.difficulty] - (this.level - 1) * 50);
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
        this.linesElement.textContent = this.lines;
        this.levelElement.textContent = this.level;
        this.highScoreElement.textContent = this.highScore;
        
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
    
    checkAchievements() {
        const newAchievements = [];
        
        // First Line
        if (!this.achievements.firstLine.unlocked && this.lines >= 1) {
            this.achievements.firstLine.unlocked = true;
            newAchievements.push('firstLine');
        }
        
        // Tetris Master
        if (!this.achievements.tetrisMaster.unlocked && this.linesCleared >= 4) {
            this.achievements.tetrisMaster.unlocked = true;
            newAchievements.push('tetrisMaster');
        }
        
        // Speedster
        if (!this.achievements.speedster.unlocked && this.level >= 10) {
            this.achievements.speedster.unlocked = true;
            newAchievements.push('speedster');
        }
        
        // Combo Master
        if (!this.achievements.comboMaster.unlocked && this.combo >= 10) {
            this.achievements.comboMaster.unlocked = true;
            newAchievements.push('comboMaster');
        }
        
        // Survivor
        if (!this.achievements.survivor.unlocked && this.gameTime >= 600) {
            this.achievements.survivor.unlocked = true;
            newAchievements.push('survivor');
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
            firstLine: '📏',
            tetrisMaster: '💥',
            speedster: '⚡',
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
    
    draw() {
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw board
        this.drawBoard();
        
        // Draw ghost piece
        if (this.ghostPiece && this.ghostEnabled) {
            this.drawPiece(this.ghostPiece, true);
        }
        
        // Draw current piece
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece);
        }
        
        // Draw pause overlay
        if (this.gamePaused) {
            this.drawPauseOverlay();
        }
        
        // Draw next and hold pieces
        this.drawNextPiece();
        this.drawHoldPiece();
    }
    
    drawBoard() {
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, this.board[y][x]);
                }
            }
        }
        
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(0, 245, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= this.boardWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, this.boardHeight * this.blockSize);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.boardHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(this.boardWidth * this.blockSize, y * this.blockSize);
            this.ctx.stroke();
        }
    }
    
    drawPiece(piece, isGhost = false) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const drawX = piece.x + x;
                    const drawY = piece.y + y;
                    if (drawY >= 0) {
                        this.drawBlock(drawX, drawY, piece.color, isGhost);
                    }
                }
            }
        }
    }
    
    drawBlock(x, y, color, isGhost = false) {
        const pixelX = x * this.blockSize;
        const pixelY = y * this.blockSize;
        
        if (isGhost) {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pixelX + 2, pixelY + 2, this.blockSize - 4, this.blockSize - 4);
            this.ctx.fillStyle = color + '20'; // 20% opacity
            this.ctx.fillRect(pixelX + 2, pixelY + 2, this.blockSize - 4, this.blockSize - 4);
        } else {
            // Main block with gradient
            const gradient = this.ctx.createLinearGradient(
                pixelX, pixelY, pixelX + this.blockSize, pixelY + this.blockSize
            );
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, this.darkenColor(color, 0.3));
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
            
            // Highlight
            this.ctx.fillStyle = this.lightenColor(color, 0.3);
            this.ctx.fillRect(pixelX + 2, pixelY + 2, this.blockSize - 8, this.blockSize - 8);
            
            // Border
            this.ctx.strokeStyle = this.darkenColor(color, 0.5);
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
        }
    }
    
    drawNextPiece() {
        const canvas = this.nextCanvas;
        const ctx = this.nextCtx;
        const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        if (this.nextPiece) {
            const blockSize = Math.min(canvasWidth, canvasHeight) / 6;
            const offsetX = (canvasWidth - this.nextPiece.shape[0].length * blockSize) / 2;
            const offsetY = (canvasHeight - this.nextPiece.shape.length * blockSize) / 2;
            
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        const pixelX = offsetX + x * blockSize;
                        const pixelY = offsetY + y * blockSize;
                        
                        ctx.fillStyle = this.nextPiece.color;
                        ctx.fillRect(pixelX, pixelY, blockSize - 1, blockSize - 1);
                        
                        ctx.strokeStyle = this.darkenColor(this.nextPiece.color, 0.3);
                        ctx.lineWidth = 1;
                        ctx.strokeRect(pixelX, pixelY, blockSize - 1, blockSize - 1);
                    }
                }
            }
        }
    }
    
    drawHoldPiece() {
        const canvas = this.holdCanvas;
        const ctx = this.holdCtx;
        const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        if (this.holdPiece) {
            const blockSize = Math.min(canvasWidth, canvasHeight) / 6;
            const offsetX = (canvasWidth - this.holdPiece.shape[0].length * blockSize) / 2;
            const offsetY = (canvasHeight - this.holdPiece.shape.length * blockSize) / 2;
            
            for (let y = 0; y < this.holdPiece.shape.length; y++) {
                for (let x = 0; x < this.holdPiece.shape[y].length; x++) {
                    if (this.holdPiece.shape[y][x]) {
                        const pixelX = offsetX + x * blockSize;
                        const pixelY = offsetY + y * blockSize;
                        
                        const alpha = this.canHold ? '1' : '0.5';
                        ctx.fillStyle = this.holdPiece.color + (this.canHold ? '' : '80');
                        ctx.fillRect(pixelX, pixelY, blockSize - 1, blockSize - 1);
                        
                        ctx.strokeStyle = this.darkenColor(this.holdPiece.color, 0.3);
                        ctx.lineWidth = 1;
                        ctx.strokeRect(pixelX, pixelY, blockSize - 1, blockSize - 1);
                    }
                }
            }
        }
    }
    
    drawPauseOverlay() {
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Pause text with glow
        this.ctx.fillStyle = '#00f5ff';
        this.ctx.font = `bold ${Math.min(32, canvasWidth / 10)}px Orbitron`;
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#00f5ff';
        this.ctx.shadowBlur = 20;
        this.ctx.fillText('PAUSADO', canvasWidth / 2, canvasHeight / 2);
        this.ctx.shadowBlur = 0;
        
        // Instructions
        this.ctx.fillStyle = '#ccc';
        this.ctx.font = `${Math.min(12, canvasWidth / 20)}px Orbitron`;
        const instructionText = this.isMobile ? 'Toque para continuar' : 'Pressione P ou ESC para continuar';
        this.ctx.fillText(instructionText, canvasWidth / 2, canvasHeight / 2 + 30);
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
        
        const currentTime = Date.now();
        this.dropTime += currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.dropTime > this.dropInterval) {
            this.update();
            this.dropTime = 0;
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (!this.currentPiece) return;
        
        this.updateUI();
        
        // Try to move piece down
        if (!this.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
            this.lockTime = 0;
        } else {
            // Piece can't move down, start lock timer
            this.lockTime += this.dropInterval;
            
            if (this.lockTime >= this.lockDelay) {
                this.lockPiece();
            }
        }
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
        this.finalLinesElement.textContent = this.lines;
        this.finalLevelElement.textContent = this.level;
        this.gameTimeElement.textContent = this.formatTime(this.gameTime);
        this.newRecordElement.style.display = isNewRecord ? 'block' : 'none';
        
        // Clear previous achievements
        this.achievementsEarnedElement.innerHTML = '';
        
        this.gameOverModal.style.display = 'block';
    }
    
    showPauseMenu() {
        this.pauseScoreElement.textContent = this.score;
        this.pauseLinesElement.textContent = this.lines;
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
        // localStorage.setItem('tetrisHighScore', this.highScore);
    }
    
    getStoredLeaderboard() {
        // For Claude.ai compatibility, use in-memory storage
        return this.leaderboard || [];
    }
    
    saveLeaderboard() {
        // In a real environment, this would use localStorage
        // localStorage.setItem('tetrisLeaderboard', JSON.stringify(this.leaderboard));
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
    const game = new TetrisGame();
    
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
    console.log('🧩 Tetris Game - Responsive Edition');
    console.log('Controles:');
    if (game.isMobile) {
        console.log('  Toque: Use os botões na tela');
        console.log('  Deslize: Deslize na tela do jogo para mover');
    } else {
        console.log('  ↑ ou W: Rotacionar peça');
        console.log('  ↓ ou S: Queda rápida');
        console.log('  ← → ou A D: Mover peça');
        console.log('  ESPAÇO: Queda instantânea');
        console.log('  C: Guardar peça');
        console.log('  P: Pausar/Continuar');
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
});