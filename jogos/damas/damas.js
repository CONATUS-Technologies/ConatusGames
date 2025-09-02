class CheckersGame {
    constructor() {
        // Game state
        this.board = this.initializeBoard();
        this.currentTurn = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { red: 0, black: 0 };
        this.gameRunning = false;
        this.gamePaused = false;
        this.moveCount = 0;
        this.lastMove = null;
        this.mustCapture = false;
        this.capturingPiece = null;
        this.multipleCapture = false;
        this.consecutiveCaptures = 0;
        this.aiThinking = false;
        
        // Timers
        this.timeControlSetting = 600;
        this.redTime = this.timeControlSetting;
        this.blackTime = this.timeControlSetting;
        this.timerInterval = null;
        
        // Settings
        this.soundEnabled = true;
        this.highlightEnabled = true;
        this.aiEnabled = false;
        this.aiDifficulty = 3;
        this.forceCaptureEnabled = true;
        
        // Statistics
        this.stats = {
            gamesCompleted: 0,
            redWins: 0,
            blackWins: 0,
            draws: 0,
            aiWins: 0
        };
        
        // Achievements
        this.achievements = {
            firstWin: { unlocked: false, name: 'Primeira Vitória', desc: 'Vença seu primeiro jogo' },
            coronation: { unlocked: false, name: 'Coroação', desc: 'Promova uma peça a dama' },
            hunter: { unlocked: false, name: 'Caçador', desc: 'Capture 5 peças em um jogo' },
            multiCapture: { unlocked: false, name: 'Sequência Múltipla', desc: 'Faça uma captura múltipla' },
            grandMaster: { unlocked: false, name: 'Grande Mestre', desc: 'Vença 10 jogos' },
            aiDestroyer: { unlocked: false, name: 'Destruidor de IA', desc: 'Vença a IA no nível Expert' }
        };
        
        // Mobile detection
        this.isMobile = this.detectMobile();
        
        // AI evaluation parameters
        this.evaluationWeights = {
            material: 100,
            king: 200,
            position: 10,
            mobility: 5,
            advancement: 3,
            center: 8,
            edge: -5,
            backRow: 15,
            threat: 20
        };
        
        // Initialize game
        this.initializeElements();
        this.setupEventListeners();
        this.loadStats();
        this.updateUI();
        this.updateAchievements();
        this.drawBoard();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
               window.innerWidth <= 768;
    }
    
    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Place black pieces (top 3 rows)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    board[row][col] = { color: 'black', type: 'piece', id: `black_${row}_${col}` };
                }
            }
        }
        
        // Place red pieces (bottom 3 rows)
        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    board[row][col] = { color: 'red', type: 'piece', id: `red_${row}_${col}` };
                }
            }
        }
        
        return board;
    }
    
    initializeElements() {
        // Timer elements
        this.redTimeElement = document.getElementById('redTime');
        this.blackTimeElement = document.getElementById('blackTime');
        this.currentTurnElement = document.getElementById('currentTurn');
        this.moveCountElement = document.getElementById('moveCount');
        this.gameStatusElement = document.getElementById('gameStatus');
        
        // Control buttons
        this.newGameBtn = document.getElementById('newGameBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.resignBtn = document.getElementById('resignBtn');
        
        // Mobile buttons
        this.mobileNewGameBtn = document.getElementById('mobileNewGameBtn');
        this.mobilePauseBtn = document.getElementById('mobilePauseBtn');
        this.mobileUndoBtn = document.getElementById('mobileUndoBtn');
        this.mobileRotateBtn = document.getElementById('mobileRotateBtn');
        
        // Settings
        this.soundToggle = document.getElementById('soundToggle');
        this.highlightToggle = document.getElementById('highlightToggle');
        this.timeControlSelect = document.getElementById('timeControl');
        this.aiToggle = document.getElementById('aiToggle');
        this.aiDifficultySelect = document.getElementById('aiDifficulty');
        this.forceCaptureToggle = document.getElementById('forceCapture');
        
        // Modals
        this.victoryModal = document.getElementById('victoryModal');
        this.pauseMenu = document.getElementById('pauseMenu');
        
        // Game elements
        this.checkersBoard = document.getElementById('checkersBoard');
        this.mobileControls = document.getElementById('mobileControls');
        this.moveList = document.getElementById('moveList');
        
        // Captured pieces
        this.redCapturedElement = document.getElementById('redCapturedCount');
        this.blackCapturedElement = document.getElementById('blackCapturedCount');
        
        // Stats elements
        this.gamesCompletedElement = document.getElementById('gamesCompleted');
        this.redWinsElement = document.getElementById('redWins');
        this.blackWinsElement = document.getElementById('blackWins');
        this.drawsElement = document.getElementById('draws');
        this.aiWinsElement = document.getElementById('aiWins');
        
        // Achievement elements
        this.achievementsListElement = document.getElementById('achievementsList');
        this.achievementsEarnedElement = document.getElementById('achievementsEarned');
        
        // Modal elements
        this.finalResultElement = document.getElementById('finalResult');
        this.winnerElement = document.getElementById('winner');
        this.finalMovesElement = document.getElementById('finalMoves');
        this.finalCapturesElement = document.getElementById('finalCaptures');
        this.finalTimeElement = document.getElementById('finalTime');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.mainMenuBtn = document.getElementById('mainMenuBtn');
        this.modalClose = document.getElementById('modalClose');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.pauseResetBtn = document.getElementById('pauseResetBtn');
        
        // Pause stats
        this.pauseTurnElement = document.getElementById('pauseTurn');
        this.pauseMovesElement = document.getElementById('pauseMoves');
        this.pauseCapturesElement = document.getElementById('pauseCaptures');
        this.pauseTimeElement = document.getElementById('pauseTime');
    }
    
    setupEventListeners() {
        // Control buttons
        this.newGameBtn?.addEventListener('click', () => this.newGame());
        this.pauseBtn?.addEventListener('click', () => this.togglePause());
        this.undoBtn?.addEventListener('click', () => this.undoMove());
        this.resignBtn?.addEventListener('click', () => this.resign());
        
        // Mobile buttons
        this.mobileNewGameBtn?.addEventListener('click', () => this.newGame());
        this.mobilePauseBtn?.addEventListener('click', () => this.togglePause());
        this.mobileUndoBtn?.addEventListener('click', () => this.undoMove());
        this.mobileRotateBtn?.addEventListener('click', () => this.rotateBoard());
        
        // Settings
        this.soundToggle?.addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });
        this.highlightToggle?.addEventListener('change', (e) => {
            this.highlightEnabled = e.target.checked;
            this.updateHighlights();
        });
        this.timeControlSelect?.addEventListener('change', (e) => {
            this.timeControlSetting = parseInt(e.target.value) * 60;
            if (this.timeControlSetting === 0) {
                this.timeControlSetting = Infinity;
            }
        });
        this.aiToggle?.addEventListener('change', (e) => {
            this.aiEnabled = e.target.checked;
        });
        this.aiDifficultySelect?.addEventListener('change', (e) => {
            this.aiDifficulty = parseInt(e.target.value);
        });
        this.forceCaptureToggle?.addEventListener('change', (e) => {
            this.forceCaptureEnabled = e.target.checked;
        });
        
        // Modal controls
        this.playAgainBtn?.addEventListener('click', () => this.newGame());
        this.mainMenuBtn?.addEventListener('click', () => this.resetGame());
        this.resumeBtn?.addEventListener('click', () => this.togglePause());
        this.pauseResetBtn?.addEventListener('click', () => this.resetGame());
        this.modalClose?.addEventListener('click', () => this.closeAllModals());
        
        // Modal click outside to close
        this.victoryModal?.addEventListener('click', (e) => {
            if (e.target === this.victoryModal) this.closeAllModals();
        });
        this.pauseMenu?.addEventListener('click', (e) => {
            if (e.target === this.pauseMenu) this.togglePause();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Window events
        window.addEventListener('blur', () => {
            if (this.gameRunning && !this.gamePaused) {
                this.togglePause();
            }
        });
        
        // Show mobile controls if on mobile
        if (this.isMobile && this.mobileControls) {
            this.mobileControls.style.display = 'block';
        }
    }
    
    drawBoard() {
        if (!this.checkersBoard) return;
        
        this.checkersBoard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `checkers-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `checkers-piece ${piece.color} ${piece.type}`;
                    pieceElement.dataset.color = piece.color;
                    pieceElement.dataset.type = piece.type;
                    pieceElement.dataset.row = row;
                    pieceElement.dataset.col = col;
                    pieceElement.draggable = !this.isMobile;
                    
                    // Add piece content based on type
                    if (piece.type === 'king') {
                        pieceElement.textContent = '♔';
                    }
                    
                    square.appendChild(pieceElement);
                }
                
                square.addEventListener('click', (e) => this.handleSquareClick(e));
                
                // Drag and drop for desktop
                if (!this.isMobile) {
                    square.addEventListener('dragstart', (e) => this.handleDragStart(e));
                    square.addEventListener('dragover', (e) => this.handleDragOver(e));
                    square.addEventListener('drop', (e) => this.handleDrop(e));
                    square.addEventListener('dragend', (e) => this.handleDragEnd(e));
                }
                
                this.checkersBoard.appendChild(square);
            }
        }
        
        this.updateHighlights();
    }
    
    handleSquareClick(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        // Don't allow moves during AI turn
        if (this.aiEnabled && this.currentTurn === 'black' && this.aiThinking) return;
        
        const square = e.target.classList.contains('checkers-square') ? e.target : e.target.parentElement;
        if (!square.dataset.row) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        if (this.selectedPiece) {
            // Try to move
            if (this.isValidMove(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
                this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
            } else {
                // Select new piece if it's the current player's piece
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentTurn) {
                    // Check if this piece can capture if forced capture is enabled
                    if (this.mustCapture && !this.canCapture(row, col)) {
                        this.updateGameStatus('Você deve capturar com a peça destacada!');
                        return;
                    }
                    this.selectPiece(row, col);
                } else {
                    this.clearSelection();
                }
            }
        } else {
            // Select piece
            const piece = this.board[row][col];
            if (piece && piece.color === this.currentTurn) {
                // Check if this piece can capture if forced capture is enabled
                if (this.mustCapture && !this.canCapture(row, col)) {
                    this.updateGameStatus('Você deve capturar com uma das peças destacadas!');
                    return;
                }
                this.selectPiece(row, col);
            }
        }
    }
    
    selectPiece(row, col) {
        this.clearSelection();
        
        const piece = this.board[row][col];
        if (!piece || piece.color !== this.currentTurn) return;
        
        this.selectedPiece = { row, col, piece };
        
        // Highlight selected square
        const square = this.checkersBoard?.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        square?.classList.add('selected');
        
        // Calculate and show valid moves
        this.validMoves = this.getValidMoves(row, col);
        this.showValidMoves();
        
        this.playSound('select');
    }
    
    clearSelection() {
        this.selectedPiece = null;
        this.validMoves = [];
        
        // Remove highlights
        this.checkersBoard?.querySelectorAll('.selected').forEach(square => {
            square.classList.remove('selected');
        });
        this.checkersBoard?.querySelectorAll('.valid-move').forEach(square => {
            square.classList.remove('valid-move');
        });
        this.checkersBoard?.querySelectorAll('.capture-move').forEach(square => {
            square.classList.remove('capture-move');
        });
    }
    
    showValidMoves() {
        if (!this.highlightEnabled) return;
        
        this.validMoves.forEach(move => {
            const square = this.checkersBoard?.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (square) {
                if (move.isCapture) {
                    square.classList.add('capture-move');
                } else {
                    square.classList.add('valid-move');
                }
            }
        });
    }
    
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        
        // Check for captures first (they are mandatory in traditional checkers)
        const captures = this.getCaptureMoves(row, col);
        
        // If forced capture is enabled and there are captures available
        if (this.forceCaptureEnabled && captures.length > 0) {
            return captures;
        }
        
        // If we're in a multiple capture sequence, only allow captures
        if (this.multipleCapture && this.capturingPiece && 
            this.capturingPiece.row === row && this.capturingPiece.col === col) {
            return captures;
        }
        
        // If no captures or forced capture is disabled, check regular moves
        if (captures.length === 0 || !this.forceCaptureEnabled) {
            const directions = this.getMoveDirections(piece);
            
            directions.forEach(([dr, dc]) => {
                let newRow = row + dr;
                let newCol = col + dc;
                
                // For kings, check multiple squares in direction
                const maxSteps = piece.type === 'king' ? 7 : 1;
                
                for (let step = 1; step <= maxSteps; step++) {
                    if (!this.isInBounds(newRow, newCol)) break;
                    
                    if (!this.board[newRow][newCol]) {
                        moves.push({ row: newRow, col: newCol, isCapture: false });
                        if (piece.type !== 'king') break;
                    } else {
                        break; // Blocked by piece
                    }
                    
                    newRow += dr;
                    newCol += dc;
                }
            });
            
            // Add captures to moves if forced capture is disabled
            if (!this.forceCaptureEnabled) {
                moves.push(...captures);
            }
        }
        
        return moves;
    }
    
    getCaptureMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const captures = [];
        const directions = this.getCaptureDirections(piece);
        
        directions.forEach(([dr, dc]) => {
            if (piece.type === 'king') {
                // King can capture at any distance
                this.getKingCaptures(row, col, dr, dc, captures);
            } else {
                // Regular piece capture
                const captureRow = row + dr;
                const captureCol = col + dc;
                const landRow = row + dr * 2;
                const landCol = col + dc * 2;
                
                if (this.isInBounds(captureRow, captureCol) && this.isInBounds(landRow, landCol)) {
                    const captureTarget = this.board[captureRow][captureCol];
                    const landSquare = this.board[landRow][landCol];
                    
                    if (captureTarget && captureTarget.color !== piece.color && !landSquare) {
                        captures.push({
                            row: landRow,
                            col: landCol,
                            isCapture: true,
                            capturedRow: captureRow,
                            capturedCol: captureCol
                        });
                    }
                }
            }
        });
        
        return captures;
    }
    
    getKingCaptures(row, col, dr, dc, captures) {
        let step = 1;
        let foundEnemy = false;
        let enemyRow = -1, enemyCol = -1;
        
        while (this.isInBounds(row + dr * step, col + dc * step)) {
            const currentRow = row + dr * step;
            const currentCol = col + dc * step;
            const currentPiece = this.board[currentRow][currentCol];
            
            if (!foundEnemy) {
                if (currentPiece) {
                    if (currentPiece.color !== this.board[row][col].color) {
                        foundEnemy = true;
                        enemyRow = currentRow;
                        enemyCol = currentCol;
                    } else {
                        break; // Blocked by own piece
                    }
                }
            } else {
                // Found enemy, now looking for landing squares
                if (!currentPiece) {
                    captures.push({
                        row: currentRow,
                        col: currentCol,
                        isCapture: true,
                        capturedRow: enemyRow,
                        capturedCol: enemyCol
                    });
                } else {
                    break; // Blocked
                }
            }
            step++;
        }
    }
    
    getMoveDirections(piece) {
        if (piece.type === 'king') {
            return [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // All diagonal directions
        } else if (piece.color === 'red') {
            return [[-1, -1], [-1, 1]]; // Red moves up
        } else {
            return [[1, -1], [1, 1]]; // Black moves down
        }
    }
    
    getCaptureDirections(piece) {
        // Captures can be in any diagonal direction regardless of piece color
        return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    }
    
    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    isValidMove(fromRow, fromCol, toRow, toCol) {
        return this.validMoves.some(move => move.row === toRow && move.col === toCol);
    }
    
    canCapture(row, col) {
        const captures = this.getCaptureMoves(row, col);
        return captures.length > 0;
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const move = this.validMoves.find(m => m.row === toRow && m.col === toCol);
        
        if (!move) return;
        
        // Store move for history
        const moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, move.isCapture);
        
        let capturedPiece = null;
        if (move.isCapture) {
            capturedPiece = this.board[move.capturedRow][move.capturedCol];
            this.board[move.capturedRow][move.capturedCol] = null;
            this.capturedPieces[piece.color]++;
            this.consecutiveCaptures++;
            this.playSound('capture');
            
            // Check for hunter achievement
            this.checkHunterAchievement();
        } else {
            this.consecutiveCaptures = 0;
            this.playSound('move');
        }
        
        // Move piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Check for promotion to king
        const wasPromoted = this.checkPromotion(toRow, toCol);
        if (wasPromoted) {
            this.checkCoronationAchievement();
        }
        
        // Store last move for highlighting
        this.lastMove = { fromRow, fromCol, toRow, toCol };
        
        // Check for multiple captures
        if (move.isCapture) {
            const additionalCaptures = this.getCaptureMoves(toRow, toCol);
            if (additionalCaptures.length > 0) {
                // Continue capturing with the same piece
                this.multipleCapture = true;
                this.capturingPiece = { row: toRow, col: toCol };
                
                // Check for multiple capture achievement
                if (this.consecutiveCaptures >= 2) {
                    this.checkMultipleCaptureAchievement();
                }
                
                // For AI, automatically continue the capture sequence
                if (this.aiEnabled && this.currentTurn === 'black') {
                    // Update UI first
                    this.updateUI();
                    this.updateMoveHistory();
                    this.updateCapturedPieces();
                    this.drawBoard();
                    
                    // Continue AI capture sequence
                    setTimeout(() => {
                        if (this.gameRunning && !this.gamePaused && this.aiThinking) {
                            this.validMoves = additionalCaptures;
                            // Choose best capture move (for now, just take the first one)
                            const nextCapture = additionalCaptures[0];
                            this.makeMove(toRow, toCol, nextCapture.row, nextCapture.col);
                        }
                    }, 500);
                    return;
                } else {
                    // For human player, select the piece for next capture
                    this.selectPiece(toRow, toCol);
                    this.updateGameStatus(`${this.currentTurn === 'red' ? 'Vermelhas' : 'Pretas'} devem continuar capturando!`);
                    
                    this.updateUI();
                    this.updateMoveHistory();
                    this.updateCapturedPieces();
                    this.drawBoard();
                    return;
                }
            } else {
                this.multipleCapture = false;
                this.capturingPiece = null;
            }
        }
        
        this.finishMove(moveNotation);
    }
    
    checkPromotion(row, col) {
        const piece = this.board[row][col];
        if (!piece || piece.type === 'king') return false;
        
        // Red pieces promote on row 0, black pieces promote on row 7
        if ((piece.color === 'red' && row === 0) || (piece.color === 'black' && row === 7)) {
            piece.type = 'king';
            this.playSound('achievement');
            return true;
        }
        
        return false;
    }
    
    finishMove(moveNotation) {
        // Update move history
        this.moveHistory.push({
            notation: moveNotation,
            board: JSON.parse(JSON.stringify(this.board)),
            capturedPieces: { ...this.capturedPieces },
            lastMove: this.lastMove ? { ...this.lastMove } : null,
            currentTurn: this.currentTurn,
            mustCapture: this.mustCapture,
            consecutiveCaptures: this.consecutiveCaptures
        });
        
        // Clear selection
        this.clearSelection();
        
        // Reset multiple capture state
        this.multipleCapture = false;
        this.capturingPiece = null;
        
        // Switch turns
        this.currentTurn = this.currentTurn === 'red' ? 'black' : 'red';
        this.moveCount++;
        
        // Check for forced captures on next turn
        this.checkForcedCaptures();
        
        // Check for game end conditions
        if (this.isGameOver()) {
            const winner = this.getWinner();
            if (winner) {
                this.endGame(winner, 'no_moves');
            } else {
                this.endGame(null, 'draw');
            }
            return;
        }
        
        // Update UI
        this.updateUI();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.drawBoard();
        
        // AI move
        if (this.aiEnabled && this.currentTurn === 'black' && this.gameRunning) {
            this.aiThinking = true;
            setTimeout(() => this.makeAIMove(), 800);
        }
    }
    
    checkForcedCaptures() {
        if (!this.forceCaptureEnabled) {
            this.mustCapture = false;
            return;
        }
        
        // Check if current player has any captures available
        let hasCaptures = false;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentTurn) {
                    if (this.getCaptureMoves(row, col).length > 0) {
                        hasCaptures = true;
                        break;
                    }
                }
            }
            if (hasCaptures) break;
        }
        
        this.mustCapture = hasCaptures;
    }
    
    // IMPROVED AI IMPLEMENTATION
    makeAIMove() {
        if (!this.gameRunning || this.gamePaused || !this.aiThinking) return;
        
        this.updateGameStatus('IA pensando...');
        
        const thinkingDelay = Math.max(200, 1000 - (this.aiDifficulty * 150));
        
        setTimeout(() => {
            if (!this.gameRunning || this.gamePaused || !this.aiThinking) {
                this.aiThinking = false;
                return;
            }
            
            const move = this.getBestMove('black', this.getSearchDepth());
            if (move) {
                this.selectPiece(move.from.row, move.from.col);
                this.updateGameStatus('IA escolheu uma peça...');
                
                setTimeout(() => {
                    if (!this.gameRunning || this.gamePaused) {
                        this.aiThinking = false;
                        return;
                    }
                    
                    this.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
                    
                    // AI thinking flag will be cleared when the move sequence is complete
                    if (!this.multipleCapture) {
                        this.aiThinking = false;
                    }
                }, 500);
            } else {
                this.aiThinking = false;
                this.endGame('red', 'no_moves');
            }
        }, thinkingDelay);
    }
    
    getSearchDepth() {
        switch(this.aiDifficulty) {
            case 1: return 2; // Easy
            case 2: return 4; // Medium
            case 3: return 6; // Hard
            case 4: return 8; // Expert
            default: return 4;
        }
    }
    
    getBestMove(color, depth) {
        const moves = this.getAllPossibleMoves(color);
        
        if (moves.length === 0) return null;
        
        // For easy difficulty, make random moves sometimes
        if (this.aiDifficulty === 1 && Math.random() < 0.3) {
            return moves[Math.floor(Math.random() * moves.length)];
        }
        
        let bestMove = null;
        let bestScore = -Infinity;
        
        // Alpha-beta pruning
        const alpha = -Infinity;
        let beta = Infinity;
        
        // Order moves for better pruning (captures first)
        moves.sort((a, b) => {
            const aCapture = a.to.isCapture ? 1 : 0;
            const bCapture = b.to.isCapture ? 1 : 0;
            return bCapture - aCapture;
        });
        
        for (const move of moves) {
            const score = this.evaluateMove(move, color, depth - 1, alpha, beta, false);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            
            // Early exit if we found a winning move
            if (bestScore > 9000) break;
        }
        
        console.log(`AI evaluated ${moves.length} moves, best score: ${bestScore}`);
        return bestMove;
    }
    
    evaluateMove(move, maximizingColor, depth, alpha, beta, maximizingPlayer) {
        // Make the move temporarily
        const undoInfo = this.makeTemporaryMove(move);
        
        // Check for capture chains
        let chainScore = 0;
        if (move.to.isCapture) {
            const additionalCaptures = this.getCaptureMoves(move.to.row, move.to.col);
            if (additionalCaptures.length > 0) {
                // Recursively evaluate capture chain
                chainScore = 50 * additionalCaptures.length;
            }
        }
        
        let score;
        if (depth === 0 || this.isGameOver()) {
            score = this.evaluatePosition(maximizingColor) + chainScore;
        } else {
            score = this.minimax(depth, alpha, beta, !maximizingPlayer, maximizingColor) + chainScore;
        }
        
        // Undo the move
        this.undoTemporaryMove(undoInfo);
        
        return score;
    }
    
    minimax(depth, alpha, beta, maximizingPlayer, maximizingColor) {
        if (depth === 0 || this.isGameOver()) {
            return this.evaluatePosition(maximizingColor);
        }
        
        const currentColor = maximizingPlayer ? maximizingColor : this.getOpponentColor(maximizingColor);
        const moves = this.getAllPossibleMoves(currentColor);
        
        if (moves.length === 0) {
            // No moves available means loss
            return maximizingPlayer ? -10000 : 10000;
        }
        
        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const undoInfo = this.makeTemporaryMove(move);
                const evaluation = this.minimax(depth - 1, alpha, beta, false, maximizingColor);
                this.undoTemporaryMove(undoInfo);
                
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break; // Beta cutoff
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const undoInfo = this.makeTemporaryMove(move);
                const evaluation = this.minimax(depth - 1, alpha, beta, true, maximizingColor);
                this.undoTemporaryMove(undoInfo);
                
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break; // Alpha cutoff
            }
            return minEval;
        }
    }
    
    getAllPossibleMoves(color) {
        const moves = [];
        let hasCaptures = false;
        
        // First pass: check for captures
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const captures = this.getCaptureMoves(row, col);
                    if (captures.length > 0) {
                        hasCaptures = true;
                        captures.forEach(capture => {
                            moves.push({
                                from: { row, col },
                                to: capture,
                                piece: piece
                            });
                        });
                    }
                }
            }
        }
        
        // If forced capture is enabled and there are captures, return only captures
        if (this.forceCaptureEnabled && hasCaptures) {
            return moves;
        }
        
        // Second pass: add regular moves if no captures or forced capture is disabled
        if (!hasCaptures || !this.forceCaptureEnabled) {
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = this.board[row][col];
                    if (piece && piece.color === color) {
                        const validMoves = this.getValidMoves(row, col);
                        validMoves.forEach(move => {
                            if (!move.isCapture) {
                                moves.push({
                                    from: { row, col },
                                    to: move,
                                    piece: piece
                                });
                            }
                        });
                    }
                }
            }
        }
        
        return moves;
    }
    
    makeTemporaryMove(move) {
        const { from, to } = move;
        const piece = this.board[from.row][from.col];
        
        if (!piece) return null;
        
        const undoInfo = {
            from,
            to,
            piece: { ...piece },
            capturedPiece: null,
            capturedRow: null,
            capturedCol: null,
            wasPromoted: false
        };
        
        // Handle capture
        if (to.isCapture) {
            undoInfo.capturedRow = to.capturedRow;
            undoInfo.capturedCol = to.capturedCol;
            undoInfo.capturedPiece = { ...this.board[to.capturedRow][to.capturedCol] };
            this.board[to.capturedRow][to.capturedCol] = null;
        }
        
        // Make the move
        this.board[to.row][to.col] = piece;
        this.board[from.row][from.col] = null;
        
        // Check for promotion
        if (piece.type === 'piece') {
            if ((piece.color === 'red' && to.row === 0) || (piece.color === 'black' && to.row === 7)) {
                piece.type = 'king';
                undoInfo.wasPromoted = true;
            }
        }
        
        return undoInfo;
    }
    
    undoTemporaryMove(undoInfo) {
        if (!undoInfo) return;
        
        const { from, to, piece, capturedPiece, capturedRow, capturedCol, wasPromoted } = undoInfo;
        
        // Restore piece to original position
        this.board[from.row][from.col] = piece;
        this.board[to.row][to.col] = null;
        
        // Undo promotion
        if (wasPromoted) {
            piece.type = 'piece';
        }
        
        // Restore captured piece
        if (capturedPiece) {
            this.board[capturedRow][capturedCol] = capturedPiece;
        }
    }
    
    evaluatePosition(aiColor) {
        let score = 0;
        const opponentColor = this.getOpponentColor(aiColor);
        
        // Piece counts and values
        let aiPieces = 0, aiKings = 0;
        let oppPieces = 0, oppKings = 0;
        
        // Position evaluation
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (!piece) continue;
                
                const isAI = piece.color === aiColor;
                const multiplier = isAI ? 1 : -1;
                
                // Material value
                let pieceValue = piece.type === 'king' ? this.evaluationWeights.king : this.evaluationWeights.material;
                score += pieceValue * multiplier;
                
                // Count pieces
                if (isAI) {
                    if (piece.type === 'king') aiKings++;
                    else aiPieces++;
                } else {
                    if (piece.type === 'king') oppKings++;
                    else oppPieces++;
                }
                
                // Position bonuses
                score += this.getPositionScore(piece, row, col) * multiplier;
                
                // King-specific bonuses
                if (piece.type === 'king') {
                    // Kings are more valuable in center
                    const centerDist = Math.abs(3.5 - row) + Math.abs(3.5 - col);
                    score += (7 - centerDist) * 5 * multiplier;
                }
            }
        }
        
        // Mobility bonus
        const aiMobility = this.getPlayerMobility(aiColor);
        const oppMobility = this.getPlayerMobility(opponentColor);
        score += (aiMobility - oppMobility) * this.evaluationWeights.mobility;
        
        // Endgame adjustments
        const totalPieces = aiPieces + aiKings + oppPieces + oppKings;
        if (totalPieces <= 8) {
            // In endgame, kings become more valuable
            score += (aiKings - oppKings) * 50;
            
            // Centralization becomes crucial
            score += this.getCentralizationScore(aiColor) * 2;
        }
        
        // Winning/losing positions
        if (oppPieces + oppKings === 0) score += 10000;
        if (aiPieces + aiKings === 0) score -= 10000;
        if (oppMobility === 0 && this.currentTurn === opponentColor) score += 10000;
        if (aiMobility === 0 && this.currentTurn === aiColor) score -= 10000;
        
        // Add small randomness for variety
        score += (Math.random() - 0.5) * 2;
        
        return score;
    }
    
    getPositionScore(piece, row, col) {
        let score = 0;
        
        // Advancement bonus for regular pieces
        if (piece.type === 'piece') {
            if (piece.color === 'red') {
                score += (7 - row) * this.evaluationWeights.advancement;
            } else {
                score += row * this.evaluationWeights.advancement;
            }
            
            // Back row defense bonus
            if ((piece.color === 'red' && row === 7) || (piece.color === 'black' && row === 0)) {
                score += this.evaluationWeights.backRow;
            }
        }
        
        // Center control bonus
        const centerDist = Math.abs(3.5 - row) + Math.abs(3.5 - col);
        score += (7 - centerDist) * this.evaluationWeights.center / 7;
        
        // Edge penalty
        if (row === 0 || row === 7 || col === 0 || col === 7) {
            score += this.evaluationWeights.edge;
        }
        
        // Protected pieces bonus
        if (this.isPieceProtected(row, col, piece.color)) {
            score += 5;
        }
        
        // Pieces under threat penalty
        if (this.isPieceUnderThreat(row, col, piece.color)) {
            score -= piece.type === 'king' ? 30 : 15;
        }
        
        return score;
    }
    
    getPlayerMobility(color) {
        let mobility = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    mobility += this.getValidMoves(row, col).length;
                }
            }
        }
        return mobility;
    }
    
    getCentralizationScore(color) {
        let score = 0;
        const centerSquares = [
            [3, 2], [3, 3], [3, 4], [3, 5],
            [4, 2], [4, 3], [4, 4], [4, 5]
        ];
        
        centerSquares.forEach(([row, col]) => {
            const piece = this.board[row][col];
            if (piece && piece.color === color) {
                score += piece.type === 'king' ? 15 : 8;
            }
        });
        
        return score;
    }
    
    isPieceProtected(row, col, color) {
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        for (const [dr, dc] of directions) {
            const protectorRow = row + dr;
            const protectorCol = col + dc;
            
            if (this.isInBounds(protectorRow, protectorCol)) {
                const protector = this.board[protectorRow][protectorCol];
                if (protector && protector.color === color) {
                    // Check if protector can actually protect
                    const attackerRow = row - dr;
                    const attackerCol = col - dc;
                    
                    if (this.isInBounds(attackerRow, attackerCol)) {
                        const attacker = this.board[attackerRow][attackerCol];
                        if (!attacker || attacker.color === color) {
                            return true;
                        }
                    } else {
                        return true; // Edge protection
                    }
                }
            }
        }
        
        return false;
    }
    
    isPieceUnderThreat(row, col, color) {
        const opponentColor = this.getOpponentColor(color);
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        for (const [dr, dc] of directions) {
            const threatRow = row - dr;
            const threatCol = col - dc;
            const escapeRow = row + dr;
            const escapeCol = col + dc;
            
            if (this.isInBounds(threatRow, threatCol) && this.isInBounds(escapeRow, escapeCol)) {
                const threat = this.board[threatRow][threatCol];
                const escape = this.board[escapeRow][escapeCol];
                
                if (threat && threat.color === opponentColor && !escape) {
                    // Check if threat can actually capture
                    const threatMoves = this.getCaptureMoves(threatRow, threatCol);
                    if (threatMoves.some(m => m.capturedRow === row && m.capturedCol === col)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    getOpponentColor(color) {
        return color === 'red' ? 'black' : 'red';
    }
    
    // GAME STATE CHECKS
    isGameOver() {
        const currentPlayerMoves = this.getAllPossibleMoves(this.currentTurn).length;
        const currentPlayerPieces = this.getPieceCount(this.currentTurn);
        
        return currentPlayerMoves === 0 || currentPlayerPieces === 0;
    }
    
    getWinner() {
        const redPieces = this.getPieceCount('red');
        const blackPieces = this.getPieceCount('black');
        const redMoves = this.getAllPossibleMoves('red').length;
        const blackMoves = this.getAllPossibleMoves('black').length;
        
        if (redPieces === 0 || (this.currentTurn === 'red' && redMoves === 0)) {
            return 'black';
        } else if (blackPieces === 0 || (this.currentTurn === 'black' && blackMoves === 0)) {
            return 'red';
        }
        
        return null;
    }
    
    getPieceCount(color) {
        let count = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] && this.board[row][col].color === color) {
                    count++;
                }
            }
        }
        return count;
    }
    
    // GAME NOTATION
    getMoveNotation(fromRow, fromCol, toRow, toCol, isCapture) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        
        let notation = files[fromCol] + ranks[fromRow];
        notation += isCapture ? 'x' : '-';
        notation += files[toCol] + ranks[toRow];
        
        return notation;
    }
    
    // Continue with remaining methods (unchanged from original)
    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        if (this.aiEnabled && this.currentTurn === 'black' && this.aiThinking) return;
        
        const lastState = this.moveHistory.pop();
        
        if (this.moveHistory.length > 0) {
            const prevState = this.moveHistory[this.moveHistory.length - 1];
            this.board = JSON.parse(JSON.stringify(prevState.board));
            this.capturedPieces = { ...prevState.capturedPieces };
            this.lastMove = prevState.lastMove ? { ...prevState.lastMove } : null;
            this.currentTurn = prevState.currentTurn;
            this.mustCapture = prevState.mustCapture || false;
            this.consecutiveCaptures = prevState.consecutiveCaptures || 0;
        } else {
            this.board = this.initializeBoard();
            this.capturedPieces = { red: 0, black: 0 };
            this.lastMove = null;
            this.currentTurn = 'red';
            this.mustCapture = false;
            this.consecutiveCaptures = 0;
        }
        
        this.moveCount = Math.max(0, this.moveCount - 1);
        this.capturingPiece = null;
        this.multipleCapture = false;
        this.aiThinking = false;
        
        this.clearSelection();
        this.checkForcedCaptures();
        this.drawBoard();
        this.updateUI();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.playSound('move');
    }
    
    resign() {
        if (!this.gameRunning) return;
        
        const winner = this.currentTurn === 'red' ? 'black' : 'red';
        this.endGame(winner, 'resignation');
    }
    
    endGame(winner, reason) {
        this.gameRunning = false;
        this.gamePaused = false;
        this.aiThinking = false;
        clearInterval(this.timerInterval);
        
        this.stats.gamesCompleted++;
        if (winner === 'red') {
            this.stats.redWins++;
        } else if (winner === 'black') {
            this.stats.blackWins++;
            if (this.aiEnabled) this.stats.aiWins++;
        } else {
            this.stats.draws++;
        }
        
        this.saveStats();
        this.checkAchievements(winner, reason);
        this.showVictoryModal(winner, reason);
        
        if (this.pauseBtn) this.pauseBtn.disabled = true;
        if (this.mobilePauseBtn) this.mobilePauseBtn.disabled = true;
        
        let statusMessage = '';
        if (reason === 'no_moves') {
            statusMessage = `${winner === 'red' ? 'Vermelhas' : 'Pretas'} vencem! Sem movimentos válidos.`;
        } else if (reason === 'draw') {
            statusMessage = 'Empate!';
        } else if (reason === 'resignation') {
            statusMessage = `${this.currentTurn === 'red' ? 'Vermelhas' : 'Pretas'} desistiram!`;
        } else if (reason === 'timeout') {
            statusMessage = `Tempo esgotado! ${winner === 'red' ? 'Vermelhas' : 'Pretas'} vencem!`;
        }
        
        this.updateGameStatus(statusMessage);
    }
    
    newGame() {
        this.board = this.initializeBoard();
        this.currentTurn = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { red: 0, black: 0 };
        this.gameRunning = true;
        this.gamePaused = false;
        this.moveCount = 0;
        this.lastMove = null;
        this.mustCapture = false;
        this.capturingPiece = null;
        this.multipleCapture = false;
        this.consecutiveCaptures = 0;
        this.aiThinking = false;
        
        const timeInSeconds = parseInt(this.timeControlSelect?.value || 10) * 60;
        this.redTime = timeInSeconds || Infinity;
        this.blackTime = timeInSeconds || Infinity;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        if (this.redTime !== Infinity) {
            this.startTimer();
        }
        
        this.drawBoard();
        this.updateUI();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.closeAllModals();
        
        if (this.pauseBtn) this.pauseBtn.disabled = false;
        if (this.mobilePauseBtn) this.mobilePauseBtn.disabled = false;
        
        this.updateGameStatus('Jogo iniciado! Vermelhas começam');
        this.playSound('start');
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.moveCount = 0;
        this.mustCapture = false;
        this.capturingPiece = null;
        this.multipleCapture = false;
        this.consecutiveCaptures = 0;
        this.aiThinking = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.board = this.initializeBoard();
        this.capturedPieces = { red: 0, black: 0 };
        this.moveHistory = [];
        this.lastMove = null;
        
        this.drawBoard();
        this.updateUI();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.closeAllModals();
        
        if (this.pauseBtn) this.pauseBtn.disabled = true;
        if (this.mobilePauseBtn) this.mobilePauseBtn.disabled = true;
        
        this.updateGameStatus('Pressione NOVO JOGO para começar');
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.aiThinking = false;
            this.updateGameStatus('Jogo pausado');
            this.showPauseMenu();
        } else {
            this.updateGameStatus(`Turno das ${this.currentTurn === 'red' ? 'Vermelhas' : 'Pretas'}`);
            this.closeAllModals();
            
            // Resume AI if it was its turn
            if (this.aiEnabled && this.currentTurn === 'black') {
                this.aiThinking = true;
                setTimeout(() => this.makeAIMove(), 800);
            }
        }
        
        this.updateButtonText();
    }
    
    rotateBoard() {
        if (this.checkersBoard) {
            this.checkersBoard.classList.add('rotate');
            setTimeout(() => {
                this.checkersBoard.classList.remove('rotate');
                this.drawBoard();
            }, 500);
        }
        this.playSound('move');
    }
    
    // All remaining methods stay the same...
    // (startTimer, updateTimers, formatTime, updateButtonText, updateUI, etc.)
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.gameRunning && !this.gamePaused) {
                if (this.currentTurn === 'red') {
                    this.redTime--;
                    if (this.redTime <= 0) {
                        this.endGame('black', 'timeout');
                    }
                } else {
                    this.blackTime--;
                    if (this.blackTime <= 0) {
                        this.endGame('red', 'timeout');
                    }
                }
                this.updateTimers();
            }
        }, 1000);
    }
    
    updateTimers() {
        if (this.redTimeElement) {
            this.redTimeElement.textContent = this.formatTime(this.redTime);
        }
        if (this.blackTimeElement) {
            this.blackTimeElement.textContent = this.formatTime(this.blackTime);
        }
    }
    
    formatTime(seconds) {
        if (seconds === Infinity) return '--:--';
        const mins = Math.floor(Math.max(0, seconds) / 60);
        const secs = Math.max(0, seconds) % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateButtonText() {
        const pauseIcon = this.pauseBtn?.querySelector('.btn-icon');
        const pauseText = this.pauseBtn?.querySelector('.btn-text');
        
        if (pauseIcon && pauseText) {
            if (this.gamePaused) {
                pauseIcon.textContent = '▶';
                pauseText.textContent = 'CONTINUAR';
            } else {
                pauseIcon.textContent = '⏸';
                pauseText.textContent = 'PAUSAR';
            }
        }
        
        if (this.mobilePauseBtn) {
            if (this.gamePaused) {
                this.mobilePauseBtn.innerHTML = '<span class="btn-icon">▶</span>CONTINUAR';
            } else {
                this.mobilePauseBtn.innerHTML = '<span class="btn-icon">⏸</span>PAUSAR';
            }
        }
    }
    
    updateUI() {
        if (this.currentTurnElement) {
            this.currentTurnElement.textContent = this.currentTurn === 'red' ? 'VERMELHAS' : 'PRETAS';
        }
        if (this.moveCountElement) {
            this.moveCountElement.textContent = this.moveCount;
        }
        
        if (this.gamesCompletedElement) {
            this.gamesCompletedElement.textContent = this.stats.gamesCompleted;
        }
        if (this.redWinsElement) {
            this.redWinsElement.textContent = this.stats.redWins;
        }
        if (this.blackWinsElement) {
            this.blackWinsElement.textContent = this.stats.blackWins;
        }
        if (this.drawsElement) {
            this.drawsElement.textContent = this.stats.draws;
        }
        if (this.aiWinsElement) {
            this.aiWinsElement.textContent = this.stats.aiWins;
        }
        
        this.updateTimers();
    }
    
    updateMoveHistory() {
        if (!this.moveList) return;
        
        this.moveList.innerHTML = '';
        
        for (let i = 0; i < this.moveHistory.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            
            const numberDiv = document.createElement('div');
            numberDiv.className = 'move-number';
            numberDiv.textContent = moveNumber + '.';
            
            const redMove = document.createElement('div');
            redMove.className = 'move-red';
            redMove.textContent = this.moveHistory[i].notation;
            
            this.moveList.appendChild(numberDiv);
            this.moveList.appendChild(redMove);
            
            if (i + 1 < this.moveHistory.length) {
                const blackMove = document.createElement('div');
                blackMove.className = 'move-black';
                blackMove.textContent = this.moveHistory[i + 1].notation;
                this.moveList.appendChild(blackMove);
            } else {
                const emptyMove = document.createElement('div');
                this.moveList.appendChild(emptyMove);
            }
        }
        
        this.moveList.scrollTop = this.moveList.scrollHeight;
    }
    
    updateCapturedPieces() {
        if (this.redCapturedElement) {
            this.redCapturedElement.textContent = this.capturedPieces.red;
        }
        if (this.blackCapturedElement) {
            this.blackCapturedElement.textContent = this.capturedPieces.black;
        }
    }
    
    updateHighlights() {
        this.checkersBoard?.querySelectorAll('.last-move').forEach(square => {
            square.classList.remove('last-move');
        });
        
        if (this.highlightEnabled && this.lastMove) {
            const fromSquare = this.checkersBoard?.querySelector(`[data-row="${this.lastMove.fromRow}"][data-col="${this.lastMove.fromCol}"]`);
            const toSquare = this.checkersBoard?.querySelector(`[data-row="${this.lastMove.toRow}"][data-col="${this.lastMove.toCol}"]`);
            fromSquare?.classList.add('last-move');
            toSquare?.classList.add('last-move');
        }
        
        if (this.mustCapture && this.highlightEnabled) {
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = this.board[row][col];
                    if (piece && piece.color === this.currentTurn && this.canCapture(row, col)) {
                        const square = this.checkersBoard?.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                        square?.classList.add('capture-move');
                    }
                }
            }
        }
    }
    
    updateGameStatus(message) {
        if (this.gameStatusElement) {
            this.gameStatusElement.textContent = message;
        }
    }
    
    handleKeyPress(e) {
        switch(e.key) {
            case ' ':
                e.preventDefault();
                if (this.gameRunning) {
                    this.togglePause();
                } else {
                    this.newGame();
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.clearSelection();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                if (this.gameRunning) {
                    this.rotateBoard();
                }
                break;
            case 'n':
            case 'N':
                e.preventDefault();
                this.newGame();
                break;
            case 'z':
            case 'Z':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.undoMove();
                }
                break;
        }
    }
    
    handleDragStart(e) {
        const piece = e.target.classList.contains('checkers-piece') ? e.target : null;
        if (!piece) {
            e.preventDefault();
            return;
        }
        
        const row = parseInt(piece.dataset.row);
        const col = parseInt(piece.dataset.col);
        
        if (this.board[row][col] && this.board[row][col].color === this.currentTurn) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', `${row},${col}`);
            piece.classList.add('dragging');
            this.selectPiece(row, col);
        } else {
            e.preventDefault();
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    handleDrop(e) {
        e.preventDefault();
        
        const data = e.dataTransfer.getData('text/plain');
        if (!data) return;
        
        const [fromRow, fromCol] = data.split(',').map(Number);
        const square = e.target.classList.contains('checkers-square') ? e.target : e.target.parentElement;
        
        if (!square.dataset.row) return;
        
        const toRow = parseInt(square.dataset.row);
        const toCol = parseInt(square.dataset.col);
        
        if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            this.makeMove(fromRow, fromCol, toRow, toCol);
        } else {
            this.clearSelection();
        }
    }
    
    handleDragEnd(e) {
        document.querySelectorAll('.dragging').forEach(piece => {
            piece.classList.remove('dragging');
        });
    }
    
    checkAchievements(winner, reason) {
        const newAchievements = [];
        
        if (!this.achievements.firstWin.unlocked && winner && winner === 'red') {
            this.achievements.firstWin.unlocked = true;
            newAchievements.push('firstWin');
        }
        
        if (!this.achievements.grandMaster.unlocked && this.stats.redWins >= 10) {
            this.achievements.grandMaster.unlocked = true;
            newAchievements.push('grandMaster');
        }
        
        if (!this.achievements.aiDestroyer.unlocked && this.aiEnabled && winner === 'red' && this.aiDifficulty === 4) {
            this.achievements.aiDestroyer.unlocked = true;
            newAchievements.push('aiDestroyer');
        }
        
        if (newAchievements.length > 0) {
            this.showAchievements(newAchievements);
            this.updateAchievements();
            this.playSound('achievement');
        }
    }
    
    checkCoronationAchievement() {
        if (!this.achievements.coronation.unlocked) {
            this.achievements.coronation.unlocked = true;
            this.showAchievements(['coronation']);
            this.updateAchievements();
            this.playSound('achievement');
        }
    }
    
    checkHunterAchievement() {
        const totalCaptures = this.capturedPieces.red + this.capturedPieces.black;
        if (!this.achievements.hunter.unlocked && totalCaptures >= 5) {
            this.achievements.hunter.unlocked = true;
            this.showAchievements(['hunter']);
            this.updateAchievements();
            this.playSound('achievement');
        }
    }
    
    checkMultipleCaptureAchievement() {
        if (!this.achievements.multiCapture.unlocked && this.consecutiveCaptures >= 2) {
            this.achievements.multiCapture.unlocked = true;
            this.showAchievements(['multiCapture']);
            this.updateAchievements();
            this.playSound('achievement');
        }
    }
    
    showAchievements(achievements) {
        if (!this.achievementsEarnedElement) return;
        
        achievements.forEach(key => {
            const achievement = this.achievements[key];
            const notification = document.createElement('div');
            notification.className = 'achievement-notification';
            notification.textContent = `🏆 ${achievement.name} desbloqueada!`;
            this.achievementsEarnedElement.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
        });
    }
    
    updateAchievements() {
        if (!this.achievementsListElement) return;
        
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
            firstWin: '🥇',
            coronation: '👑',
            hunter: '🎯',
            multiCapture: '⚡',
            grandMaster: '🧠',
            aiDestroyer: '🤖'
        };
        return icons[key] || '🏆';
    }
    
    showVictoryModal(winner, reason) {
        if (!this.victoryModal) return;
        
        let resultText = '';
        if (reason === 'no_moves') {
            resultText = 'VITÓRIA!';
        } else if (reason === 'draw') {
            resultText = 'EMPATE!';
        } else if (reason === 'resignation') {
            resultText = 'DESISTÊNCIA!';
        } else if (reason === 'timeout') {
            resultText = 'TEMPO ESGOTADO!';
        }
        
        if (this.finalResultElement) {
            this.finalResultElement.textContent = resultText;
        }
        if (this.winnerElement) {
            this.winnerElement.textContent = winner ? (winner === 'red' ? 'VERMELHAS' : 'PRETAS') : 'EMPATE';
        }
        if (this.finalMovesElement) {
            this.finalMovesElement.textContent = this.moveCount;
        }
        if (this.finalCapturesElement) {
            this.finalCapturesElement.textContent = this.capturedPieces.red + this.capturedPieces.black;
        }
        
        if (this.finalTimeElement) {
            const totalTime = (this.timeControlSetting * 2) - (this.redTime + this.blackTime);
            this.finalTimeElement.textContent = this.formatTime(totalTime);
        }
        
        if (this.achievementsEarnedElement) {
            this.achievementsEarnedElement.innerHTML = '';
        }
        
        this.victoryModal.style.display = 'block';
    }
    
    showPauseMenu() {
        if (!this.pauseMenu) return;
        
        if (this.pauseTurnElement) {
            this.pauseTurnElement.textContent = this.currentTurn === 'red' ? 'VERMELHAS' : 'PRETAS';
        }
        if (this.pauseMovesElement) {
            this.pauseMovesElement.textContent = this.moveCount;
        }
        if (this.pauseCapturesElement) {
            this.pauseCapturesElement.textContent = this.capturedPieces.red + this.capturedPieces.black;
        }
        
        if (this.pauseTimeElement) {
            const totalTime = (this.timeControlSetting * 2) - (this.redTime + this.blackTime);
            this.pauseTimeElement.textContent = this.formatTime(totalTime);
        }
        
        this.pauseMenu.style.display = 'block';
    }
    
    closeAllModals() {
        if (this.victoryModal) {
            this.victoryModal.style.display = 'none';
        }
        if (this.pauseMenu) {
            this.pauseMenu.style.display = 'none';
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
                case 'select':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);
                    break;
                case 'move':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.15);
                    break;
                case 'capture':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                    break;
                case 'achievement':
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.4);
                    break;
                case 'start':
                    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.25);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                    break;
            }
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }
    
    loadStats() {
        try {
            const saved = {};
            if (saved && Object.keys(saved).length > 0) {
                this.stats = { ...this.stats, ...saved };
            }
        } catch (error) {
            console.warn('Could not load stats:', error);
        }
    }
    
    saveStats() {
        try {
            console.log('Stats saved:', this.stats);
        } catch (error) {
            console.warn('Could not save stats:', error);
        }
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

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize the game
        const game = new CheckersGame();
        
        // Make game globally accessible for debugging
        window.checkersGame = game;
        
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
        
        // Add visibility change handler to auto-pause
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && game.gameRunning && !game.gamePaused) {
                game.togglePause();
            }
        });
        
        // Prevent context menu on right click for better mobile experience
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Add CSS for last move highlighting
        const style = document.createElement('style');
        style.textContent = `
         
        `;
        document.head.appendChild(style);
        
        // Console logging
        console.log('🔴⚫ Checkers Game - Fixed Edition Loaded Successfully');
        console.log('');
        console.log('✅ CORREÇÕES IMPLEMENTADAS:');
        console.log('  • Algoritmo Minimax com poda alfa-beta otimizado');
        console.log('  • Avaliação de posição melhorada com múltiplos fatores');
        console.log('  • Correção do tratamento de capturas múltiplas pela IA');
        console.log('  • Melhoria na detecção de fim de jogo');
        console.log('  • Otimização da busca de movimentos válidos');
        console.log('  • Correção do sistema de forced capture');
        console.log('  • Tratamento adequado de promoção a dama');
        console.log('  • Melhor gestão de estados do jogo');
        console.log('');
        console.log('🎮 RECURSOS DO JOGO:');
        console.log('  • 4 níveis de dificuldade da IA');
        console.log('  • Sistema de achievements');
        console.log('  • Cronômetros de partida');
        console.log('  • Histórico de movimentos');
        console.log('  • Função desfazer (undo)');
        console.log('  • Suporte para mobile e desktop');
        console.log('  • Sons e animações');
        console.log('');
        console.log('⌨️ CONTROLES DE TECLADO:');
        console.log('  • ESPAÇO: Pausar/Continuar ou Novo jogo');
        console.log('  • R: Rotacionar tabuleiro');
        console.log('  • N: Novo jogo');
        console.log('  • Ctrl+Z: Desfazer movimento');
        console.log('  • ESC: Cancelar seleção');
        console.log('');
        console.log('🤖 IA MELHORADA:');
        console.log('  • Avaliação de material e posição');
        console.log('  • Análise de mobilidade e ameaças');
        console.log('  • Estratégias de endgame');
        console.log('  • Cadeias de captura otimizadas');
        console.log('  • Proteção e segurança de peças');
        console.log('  • Controle do centro do tabuleiro');
        
        if (game.isMobile) {
            console.log('');
            console.log('📱 Modo Mobile detectado - Use toque para jogar!');
        }
        
    } catch (error) {
        console.error('❌ Erro ao inicializar o Jogo de Damas:', error);
        console.error('Stack trace:', error.stack);
        
        // Fallback error display
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        errorDiv.innerHTML = `
            <h3>Erro ao carregar o jogo</h3>
            <p>Ocorreu um erro ao inicializar o jogo de Damas.</p>
            <p style="font-size: 12px; margin-top: 10px;">${error.message}</p>
            <button onclick="location.reload()" style="
                background: white;
                color: red;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">Recarregar</button>
        `;
        document.body.appendChild(errorDiv);
    }
});