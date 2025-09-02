class TicTacToeGame {
    constructor() {
        // Game state
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.gameMode = 'best-of-3';
        this.roundsToWin = 2;
        this.currentRound = 1;
        this.maxRounds = 3;
        
        // Scores
        this.scores = { X: 0, O: 0 };
        this.gameHistory = [];
        this.moveHistory = [];
        this.gameStartTime = null;
        this.gameTime = 0;
        this.timerInterval = null;
        
        // Settings
        this.soundEnabled = true;
        this.animationEnabled = true;
        this.aiEnabled = false;
        this.aiDifficulty = 3;
        this.aiPlayer = 'O';
        this.aiThinking = false;
        
        // Statistics
        this.stats = {
            gamesCompleted: 0,
            xWins: 0,
            oWins: 0,
            draws: 0,
            aiWins: 0,
            winStreak: 0,
            currentStreak: 0,
            bestTime: null,
            totalPlayTime: 0
        };
        
        // Achievements
        this.achievements = {
            firstWin: { unlocked: false, name: 'Primeira Vitória', desc: 'Vença seu primeiro jogo' },
            lightning: { unlocked: false, name: 'Relâmpago', desc: 'Vença em menos de 10 segundos' },
            strategist: { unlocked: false, name: 'Estrategista', desc: 'Vença sem fazer jogadas perdedoras' },
            fireStreak: { unlocked: false, name: 'Sequência de Fogo', desc: 'Vença 5 jogos seguidos' },
            aiDestroyer: { unlocked: false, name: 'Destruidor de IA', desc: 'Vença a IA no nível Impossível' },
            master: { unlocked: false, name: 'Mestre', desc: 'Vença 50 jogos' }
        };
        
        // Mobile detection
        this.isMobile = this.detectMobile();
        
        // Initialize
        this.initializeElements();
        this.setupEventListeners();
        this.loadStats();
        this.updateUI();
        this.updateAchievements();
        
        console.log('⭕ Jogo da Velha - Desktop Edition Loaded');
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
               window.innerWidth <= 768;
    }
    
    initializeElements() {
        // Timer and status elements
        this.gameTimeElement = document.getElementById('gameTime');
        this.currentTurnElement = document.getElementById('currentTurn');
        this.moveCountElement = document.getElementById('moveCount');
        this.roundCountElement = document.getElementById('roundCount');
        this.gameStatusElement = document.getElementById('gameStatus');
        
        // Control buttons
        this.newGameBtn = document.getElementById('newGameBtn');
        this.resetRoundBtn = document.getElementById('resetRoundBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.hintBtn = document.getElementById('hintBtn');
        this.backBtn = document.getElementById('backBtn');
        
        // Mobile buttons
        this.mobileNewGameBtn = document.getElementById('mobileNewGameBtn');
        this.mobileResetBtn = document.getElementById('mobileResetBtn');
        this.mobileUndoBtn = document.getElementById('mobileUndoBtn');
        this.mobileHintBtn = document.getElementById('mobileHintBtn');
        
        // Settings
        this.soundToggle = document.getElementById('soundToggle');
        this.animationToggle = document.getElementById('animationToggle');
        this.aiToggle = document.getElementById('aiToggle');
        this.aiDifficultySelect = document.getElementById('aiDifficulty');
        this.gameModeSelect = document.getElementById('gameMode');
        
        // Game board
        this.boardElement = document.getElementById('ticTacToeBoard');
        this.cells = document.querySelectorAll('.cell');
        
        // Player indicators
        this.playerXElement = document.getElementById('playerX');
        this.playerOElement = document.getElementById('playerO');
        this.scoreXElement = document.getElementById('scoreX');
        this.scoreOElement = document.getElementById('scoreO');
        
        // Progress elements
        this.currentModeElement = document.getElementById('currentMode');
        this.winsNeededElement = document.getElementById('winsNeeded');
        this.currentLeaderElement = document.getElementById('currentLeader');
        
        // Statistics elements
        this.gamesCompletedElement = document.getElementById('gamesCompleted');
        this.xWinsElement = document.getElementById('xWins');
        this.oWinsElement = document.getElementById('oWins');
        this.drawsElement = document.getElementById('draws');
        this.aiWinsElement = document.getElementById('aiWins');
        this.winStreakElement = document.getElementById('winStreak');
        
        // Achievement elements
        this.achievementsListElement = document.getElementById('achievementsList');
        this.achievementsEarnedElement = document.getElementById('achievementsEarned');
        
        // Move history
        this.moveListElement = document.getElementById('moveList');
        
        // Modals
        this.victoryModal = document.getElementById('victoryModal');
        this.roundModal = document.getElementById('roundModal');
        
        // Modal elements
        this.finalResultElement = document.getElementById('finalResult');
        this.winnerElement = document.getElementById('winner');
        this.finalTimeElement = document.getElementById('finalTime');
        this.finalMovesElement = document.getElementById('finalMoves');
        this.matchResultElement = document.getElementById('matchResult');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.newMatchBtn = document.getElementById('newMatchBtn');
        this.modalClose = document.getElementById('modalClose');
        
        // Round modal elements
        this.roundResultElement = document.getElementById('roundResult');
        this.roundScoreElement = document.getElementById('roundScore');
        this.roundNumberElement = document.getElementById('roundNumber');
        this.nextRoundBtn = document.getElementById('nextRoundBtn');
        
        // Mobile controls
        this.mobileControls = document.getElementById('mobileControls');
        
        // Show mobile controls if on mobile
        if (this.isMobile && this.mobileControls) {
            this.mobileControls.style.display = 'block';
        }
    }
    
    setupEventListeners() {
        // Control buttons
        this.newGameBtn?.addEventListener('click', () => this.newGame());
        this.resetRoundBtn?.addEventListener('click', () => this.resetRound());
        this.undoBtn?.addEventListener('click', () => this.undoMove());
        this.hintBtn?.addEventListener('click', () => this.showHint());
        
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
        
        // Mobile buttons
        this.mobileNewGameBtn?.addEventListener('click', () => this.newGame());
        this.mobileResetBtn?.addEventListener('click', () => this.resetRound());
        this.mobileUndoBtn?.addEventListener('click', () => this.undoMove());
        this.mobileHintBtn?.addEventListener('click', () => this.showHint());
        
        // Settings
        this.soundToggle?.addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });
        
        this.animationToggle?.addEventListener('change', (e) => {
            this.animationEnabled = e.target.checked;
        });
        
        this.aiToggle?.addEventListener('change', (e) => {
            this.aiEnabled = e.target.checked;
            this.updatePlayerNames();
            
            // Se ativar a IA e o jogo estiver ativo e for a vez da IA
            if (this.gameActive && this.aiEnabled && this.currentPlayer === this.aiPlayer) {
                setTimeout(() => this.makeAIMove(), 500);
            }
        });
        
        this.aiDifficultySelect?.addEventListener('change', (e) => {
            this.aiDifficulty = parseInt(e.target.value);
        });
        
        this.gameModeSelect?.addEventListener('change', (e) => {
            this.setGameMode(e.target.value);
        });
        
        // Board cells
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.makeMove(index));
        });
        
        // Modal controls
        this.playAgainBtn?.addEventListener('click', () => {
            this.closeModals();
            this.resetRound();
        });
        
        this.newMatchBtn?.addEventListener('click', () => {
            this.closeModals();
            this.newGame();
        });
        
        this.nextRoundBtn?.addEventListener('click', () => this.nextRound());
        
        this.modalClose?.addEventListener('click', () => this.closeModals());
        
        // Modal click outside to close
        this.victoryModal?.addEventListener('click', (e) => {
            if (e.target === this.victoryModal) this.closeModals();
        });
        
        this.roundModal?.addEventListener('click', (e) => {
            if (e.target === this.roundModal) this.nextRound();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Prevent context menu on game board
        this.boardElement?.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    // GAME MODE MANAGEMENT
    setGameMode(mode) {
        this.gameMode = mode;
        
        switch(mode) {
            case 'best-of-1':
                this.roundsToWin = 1;
                this.maxRounds = 1;
                break;
            case 'best-of-3':
                this.roundsToWin = 2;
                this.maxRounds = 3;
                break;
            case 'best-of-5':
                this.roundsToWin = 3;
                this.maxRounds = 5;
                break;
            case 'infinite':
                this.roundsToWin = Infinity;
                this.maxRounds = Infinity;
                break;
        }
        
        this.updateProgressDisplay();
    }
    
    updateProgressDisplay() {
        const modeNames = {
            'best-of-1': 'Melhor de 1',
            'best-of-3': 'Melhor de 3',
            'best-of-5': 'Melhor de 5',
            'infinite': 'Infinito'
        };
        
        if (this.currentModeElement) {
            this.currentModeElement.textContent = modeNames[this.gameMode];
        }
        
        if (this.winsNeededElement) {
            this.winsNeededElement.textContent = this.roundsToWin === Infinity ? '∞' : this.roundsToWin;
        }
        
        // Update current leader
        if (this.currentLeaderElement) {
            if (this.scores.X > this.scores.O) {
                this.currentLeaderElement.textContent = 'X';
            } else if (this.scores.O > this.scores.X) {
                this.currentLeaderElement.textContent = 'O';
            } else {
                this.currentLeaderElement.textContent = 'Empate';
            }
        }
    }
    
    updatePlayerNames() {
        const playerOName = document.querySelector('#playerO .player-name');
        if (playerOName) {
            if (this.aiEnabled) {
                playerOName.textContent = 'IA (O)';
            } else {
                playerOName.textContent = 'JOGADOR O';
            }
        }
    }
    
    // GAME LOGIC
    newGame() {
        this.scores = { X: 0, O: 0 };
        this.currentRound = 1;
        this.gameHistory = [];
        this.resetRound();
        this.updateScores();
        this.updateProgressDisplay();
        this.closeModals();
        this.updateGameStatus('Nova partida iniciada! X começa');
        this.playSound('start');
    }
    
    resetRound() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.moveHistory = [];
        this.gameStartTime = Date.now();
        this.gameTime = 0;
        this.aiThinking = false;
        
        // Clear board display
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        // Start timer
        this.startTimer();
        
        // Update UI
        this.updateBoard();
        this.updatePlayerIndicators();
        this.updateMoveHistory();
        
        if (this.undoBtn) this.undoBtn.disabled = true;
        if (this.mobileUndoBtn) this.mobileUndoBtn.disabled = true;
        
        this.closeModals();
        
        this.updateGameStatus(`Rodada ${this.currentRound} - Turno de ${this.currentPlayer}`);
        this.playSound('start');
        
        // Se a IA estiver ativada e for a vez dela (O começa em algumas variações)
        // Por padrão X sempre começa, mas se quiser que a IA comece às vezes:
        if (this.aiEnabled && this.currentPlayer === this.aiPlayer) {
            this.aiThinking = true;
            setTimeout(() => this.makeAIMove(), 1000);
        }
    }
    
    makeMove(index) {
        // Check if move is valid
        if (!this.gameActive || this.board[index] !== null || this.aiThinking) {
            return;
        }
        
        // Don't allow human moves during AI turn
        if (this.aiEnabled && this.currentPlayer === this.aiPlayer) {
            return;
        }
        
        // Execute the move
        this.executeMoveAction(index);
    }
    
    executeMoveAction(index) {
        // Make the move
        this.board[index] = this.currentPlayer;
        this.moveHistory.push({ 
            player: this.currentPlayer, 
            position: index, 
            time: Date.now() 
        });
        
        // Update display
        this.updateBoard();
        this.updateMoveHistory();
        
        if (this.undoBtn) this.undoBtn.disabled = false;
        if (this.mobileUndoBtn) this.mobileUndoBtn.disabled = false;
        
        // Play sound
        this.playSound('move');
        
        // Check for win or draw
        const winner = this.checkWinner();
        if (winner) {
            this.endRound(winner);
            return;
        }
        
        if (this.board.every(cell => cell !== null)) {
            this.endRound('draw');
            return;
        }
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updatePlayerIndicators();
        this.updateGameStatus(`Turno de ${this.currentPlayer}`);
        
        // AI move
        if (this.aiEnabled && this.currentPlayer === this.aiPlayer && this.gameActive) {
            this.aiThinking = true;
            this.updateGameStatus('IA pensando...');
            setTimeout(() => this.makeAIMove(), 800 + Math.random() * 700);
        }
    }
    
    undoMove() {
        if (this.moveHistory.length === 0 || !this.gameActive || this.aiThinking) return;
        
        // Undo last move (or two moves if playing against AI)
        const movesToUndo = this.aiEnabled && this.moveHistory.length >= 2 ? 2 : 1;
        
        for (let i = 0; i < movesToUndo; i++) {
            if (this.moveHistory.length === 0) break;
            const lastMove = this.moveHistory.pop();
            this.board[lastMove.position] = null;
        }
        
        // Sempre volta para o jogador X após desfazer
        this.currentPlayer = 'X';
        
        // Update display
        this.updateBoard();
        this.updatePlayerIndicators();
        this.updateMoveHistory();
        
        if (this.moveHistory.length === 0) {
            if (this.undoBtn) this.undoBtn.disabled = true;
            if (this.mobileUndoBtn) this.mobileUndoBtn.disabled = true;
        }
        
        this.updateGameStatus(`Turno de ${this.currentPlayer}`);
        this.playSound('move');
    }
    
    showHint() {
        if (!this.gameActive || this.aiThinking) return;
        
        // Don't show hints for AI player
        if (this.aiEnabled && this.currentPlayer === this.aiPlayer) return;
        
        // Get best move for current player
        const bestMove = this.getBestMove(this.currentPlayer, 3);
        
        if (bestMove !== null) {
            // Highlight the suggested cell
            const cell = this.cells[bestMove];
            cell.classList.add('hint');
            
            setTimeout(() => {
                cell.classList.remove('hint');
            }, 3000);
            
            this.playSound('hint');
            this.updateGameStatus(`Dica: posição ${bestMove + 1} é uma boa jogada!`);
        }
    }
    
    // AI IMPLEMENTATION
    makeAIMove() {
        if (!this.gameActive || !this.aiEnabled) {
            this.aiThinking = false;
            return;
        }
        
        // Get best move based on difficulty
        const bestMove = this.getBestMove(this.aiPlayer, this.aiDifficulty);
        
        if (bestMove !== null) {
            this.aiThinking = false;
            this.executeMoveAction(bestMove);
        } else {
            this.aiThinking = false;
            console.error('IA não conseguiu encontrar uma jogada válida');
        }
    }
    
    getBestMove(player, difficulty) {
        const availableMoves = this.getAvailableMoves();
        
        if (availableMoves.length === 0) return null;
        
        // Easy mode (1) - random move
        if (difficulty === 1) {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
        
        // Medium mode (2) - some strategy with random elements
        if (difficulty === 2) {
            // 60% chance de jogada ótima, 40% aleatória
            if (Math.random() < 0.4) {
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
            // Continua para a lógica de jogadas estratégicas
        }
        
        // Hard (3) and Impossible (4) modes - strategic play
        
        // 1. Check for immediate win
        for (let move of availableMoves) {
            this.board[move] = player;
            if (this.checkWinner() === player) {
                this.board[move] = null;
                return move;
            }
            this.board[move] = null;
        }
        
        // 2. Block opponent's winning move
        const opponent = player === 'X' ? 'O' : 'X';
        for (let move of availableMoves) {
            this.board[move] = opponent;
            if (this.checkWinner() === opponent) {
                this.board[move] = null;
                return move;
            }
            this.board[move] = null;
        }
        
        // For Impossible difficulty (4), use minimax for perfect play
        if (difficulty === 4) {
            let bestScore = -Infinity;
            let bestMoveIndex = null;
            
            for (let move of availableMoves) {
                this.board[move] = player;
                let score = this.minimax(this.board, 0, false, player);
                this.board[move] = null;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMoveIndex = move;
                }
            }
            
            if (bestMoveIndex !== null) {
                return bestMoveIndex;
            }
        }
        
        // 3. Strategic moves for Hard difficulty (3) and fallback
        
        // Take center if available
        if (availableMoves.includes(4)) {
            return 4;
        }
        
        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(corner => availableMoves.includes(corner));
        if (availableCorners.length > 0) {
            // For hard mode, try to take opposite corner if opponent has one
            if (difficulty >= 3) {
                for (let corner of availableCorners) {
                    const opposite = this.getOppositeCorner(corner);
                    if (opposite !== null && this.board[opposite] === opponent) {
                        return corner;
                    }
                }
            }
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take edges
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(edge => availableMoves.includes(edge));
        if (availableEdges.length > 0) {
            return availableEdges[Math.floor(Math.random() * availableEdges.length)];
        }
        
        // Fallback to first available move
        return availableMoves[0];
    }
    
    getOppositeCorner(corner) {
        const opposites = {
            0: 8,
            2: 6,
            6: 2,
            8: 0
        };
        return opposites[corner] || null;
    }
    
    minimax(board, depth, isMaximizing, aiPlayer) {
        // Check terminal states
        const winner = this.checkWinnerForBoard(board);
        
        if (winner === aiPlayer) {
            return 10 - depth;
        }
        if (winner && winner !== aiPlayer && winner !== 'draw') {
            return depth - 10;
        }
        if (winner === 'draw' || board.every(cell => cell !== null)) {
            return 0;
        }
        
        // Limit depth for performance
        if (depth >= 9) return 0;
        
        const opponent = aiPlayer === 'X' ? 'O' : 'X';
        
        if (isMaximizing) {
            let maxScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = aiPlayer;
                    let score = this.minimax(board, depth + 1, false, aiPlayer);
                    board[i] = null;
                    maxScore = Math.max(score, maxScore);
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = opponent;
                    let score = this.minimax(board, depth + 1, true, aiPlayer);
                    board[i] = null;
                    minScore = Math.min(score, minScore);
                }
            }
            return minScore;
        }
    }
    
    checkWinnerForBoard(board) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        
        if (board.every(cell => cell !== null)) {
            return 'draw';
        }
        
        return null;
    }
    
    getAvailableMoves() {
        const moves = [];
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                moves.push(i);
            }
        }
        return moves;
    }
    
    // GAME STATE CHECKS
    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                // Highlight winning cells
                this.highlightWinningCells(pattern);
                return this.board[a];
            }
        }
        
        return null;
    }
    
    highlightWinningCells(pattern) {
        pattern.forEach(index => {
            this.cells[index].classList.add('winning');
        });
    }
    
    // ROUND/GAME END
    endRound(result) {
        this.gameActive = false;
        this.aiThinking = false;
        this.stopTimer();
        
        // Calculate game time
        const roundTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        this.gameTime = roundTime;
        
        // Update statistics
        this.updateRoundStats(result);
        
        // Check achievements
        this.checkAchievements(result, roundTime);
        
        // Update scores
        if (result !== 'draw') {
            this.scores[result]++;
        }
        
        this.updateScores();
        this.updateProgressDisplay();
        
        // Check if match is complete
        if (this.isMatchComplete()) {
            setTimeout(() => this.endMatch(), 1500);
        } else {
            setTimeout(() => this.showRoundModal(result), 1500);
        }
        
        // Play sound
        if (result === 'draw') {
            this.playSound('draw');
            this.updateGameStatus('Empate!');
        } else {
            const humanWon = (this.aiEnabled && result === 'X') || (!this.aiEnabled);
            if (humanWon) {
                this.playSound('victory');
                this.updateGameStatus(`Vitória de ${result}!`);
            } else {
                this.playSound('defeat');
                this.updateGameStatus(`Derrota! ${result} venceu.`);
            }
        }
    }
    
    updateRoundStats(result) {
        this.stats.gamesCompleted++;
        
        if (result === 'X') {
            this.stats.xWins++;
            if (!this.aiEnabled || this.aiPlayer !== 'X') {
                this.stats.currentStreak++;
                this.stats.winStreak = Math.max(this.stats.winStreak, this.stats.currentStreak);
            }
        } else if (result === 'O') {
            this.stats.oWins++;
            if (!this.aiEnabled || this.aiPlayer !== 'O') {
                this.stats.currentStreak++;
                this.stats.winStreak = Math.max(this.stats.winStreak, this.stats.currentStreak);
            } else {
                this.stats.currentStreak = 0;
            }
        } else {
            this.stats.draws++;
        }
        
        // Count AI wins properly
        if (this.aiEnabled && result === this.aiPlayer) {
            this.stats.aiWins++;
        }
        
        // Update best time
        if (result !== 'draw' && (!this.stats.bestTime || this.gameTime < this.stats.bestTime)) {
            this.stats.bestTime = this.gameTime;
        }
        
        this.stats.totalPlayTime += this.gameTime;
        this.saveStats();
        this.updateUI();
    }
    
    isMatchComplete() {
        if (this.gameMode === 'infinite') {
            return false;
        }
        return this.scores.X >= this.roundsToWin || this.scores.O >= this.roundsToWin;
    }
    
    endMatch() {
        let matchWinner = null;
        if (this.scores.X > this.scores.O) {
            matchWinner = 'X';
        } else if (this.scores.O > this.scores.X) {
            matchWinner = 'O';
        }
        
        this.showVictoryModal(matchWinner);
    }
    
    nextRound() {
        this.currentRound++;
        this.closeModals();
        this.resetRound();
    }
    
    // UI UPDATE FUNCTIONS
    updateBoard() {
        this.cells.forEach((cell, index) => {
            if (this.board[index]) {
                if (!cell.textContent) {
                    cell.textContent = this.board[index] === 'X' ? '❌' : '⭕';
                    cell.classList.add(this.board[index].toLowerCase());
                    cell.classList.add('occupied');
                    
                    if (this.animationEnabled) {
                        cell.style.animation = 'cellAppear 0.5s ease-out';
                    }
                }
            } else {
                cell.textContent = '';
                cell.className = 'cell';
            }
        });
    }
    
    updatePlayerIndicators() {
        // Remove active class from both players
        this.playerXElement?.classList.remove('active');
        this.playerOElement?.classList.remove('active');
        
        // Add active class to current player
        if (this.currentPlayer === 'X') {
            this.playerXElement?.classList.add('active');
        } else {
            this.playerOElement?.classList.add('active');
        }
        
        // Update turn indicator
        if (this.currentTurnElement) {
            this.currentTurnElement.textContent = this.currentPlayer;
        }
    }
    
    updateScores() {
        if (this.scoreXElement) this.scoreXElement.textContent = this.scores.X;
        if (this.scoreOElement) this.scoreOElement.textContent = this.scores.O;
    }
    
    updateMoveHistory() {
        if (!this.moveListElement) return;
        
        this.moveListElement.innerHTML = '';
        
        this.moveHistory.forEach((move, index) => {
            const moveItem = document.createElement('div');
            moveItem.className = 'move-item';
            
            const moveNumber = document.createElement('span');
            moveNumber.className = 'move-number';
            moveNumber.textContent = `${index + 1}.`;
            
            const movePlayer = document.createElement('span');
            movePlayer.className = 'move-player';
            movePlayer.textContent = move.player;
            
            const movePosition = document.createElement('span');
            movePosition.className = 'move-position';
            const row = Math.floor(move.position / 3) + 1;
            const col = (move.position % 3) + 1;
            movePosition.textContent = `(${row},${col})`;
            
            moveItem.appendChild(moveNumber);
            moveItem.appendChild(movePlayer);
            moveItem.appendChild(movePosition);
            
            this.moveListElement.appendChild(moveItem);
        });
        
        // Update move count
        if (this.moveCountElement) {
            this.moveCountElement.textContent = this.moveHistory.length;
        }
        
        // Scroll to bottom
        this.moveListElement.scrollTop = this.moveListElement.scrollHeight;
    }
    
    updateUI() {
        // Update statistics
        if (this.gamesCompletedElement) {
            this.gamesCompletedElement.textContent = this.stats.gamesCompleted;
        }
        if (this.xWinsElement) {
            this.xWinsElement.textContent = this.stats.xWins;
        }
        if (this.oWinsElement) {
            this.oWinsElement.textContent = this.stats.oWins;
        }
        if (this.drawsElement) {
            this.drawsElement.textContent = this.stats.draws;
        }
        if (this.aiWinsElement) {
            this.aiWinsElement.textContent = this.stats.aiWins;
        }
        if (this.winStreakElement) {
            this.winStreakElement.textContent = this.stats.winStreak;
        }
        
        // Update round count
        if (this.roundCountElement) {
            this.roundCountElement.textContent = this.currentRound;
        }
        
        // Update timer
        this.updateTimer();
        
        // Update progress
        this.updateProgressDisplay();
        
        // Update player names
        this.updatePlayerNames();
    }
    
    updateGameStatus(message) {
        if (this.gameStatusElement) {
            this.gameStatusElement.textContent = message;
        }
    }
    
    // TIMER FUNCTIONS
    startTimer() {
        this.stopTimer(); // Clear any existing timer
        this.timerInterval = setInterval(() => {
            if (this.gameActive) {
                this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
                this.updateTimer();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimer() {
        if (!this.gameTimeElement) return;
        
        const time = this.gameTime;
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        this.gameTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // ACHIEVEMENT SYSTEM
    checkAchievements(result, gameTime) {
        const newAchievements = [];
        
        // First Win
        if (!this.achievements.firstWin.unlocked && result !== 'draw') {
            const humanWon = (this.aiEnabled && result === 'X') || (!this.aiEnabled);
            if (humanWon) {
                this.achievements.firstWin.unlocked = true;
                newAchievements.push('firstWin');
            }
        }
        
        // Lightning (win in less than 10 seconds)
        if (!this.achievements.lightning.unlocked && result !== 'draw' && gameTime < 10) {
            const humanWon = (this.aiEnabled && result === 'X') || (!this.aiEnabled);
            if (humanWon) {
                this.achievements.lightning.unlocked = true;
                newAchievements.push('lightning');
            }
        }
        
        // Fire Streak (5 wins in a row)
        if (!this.achievements.fireStreak.unlocked && this.stats.currentStreak >= 5) {
            this.achievements.fireStreak.unlocked = true;
            newAchievements.push('fireStreak');
        }
        
        // Master (50 wins)
        const totalHumanWins = this.aiEnabled ? 
            (this.aiPlayer === 'O' ? this.stats.xWins : this.stats.oWins) : 
            (this.stats.xWins + this.stats.oWins);
            
        if (!this.achievements.master.unlocked && totalHumanWins >= 50) {
            this.achievements.master.unlocked = true;
            newAchievements.push('master');
        }
        
        // AI Destroyer (beat impossible AI)
        if (!this.achievements.aiDestroyer.unlocked && this.aiEnabled && 
            this.aiDifficulty === 4 && result === 'X' && this.aiPlayer === 'O') {
            this.achievements.aiDestroyer.unlocked = true;
            newAchievements.push('aiDestroyer');
        }
        
        // Strategist - check if the player made no losing moves
        if (!this.achievements.strategist.unlocked && result !== 'draw' && this.checkStrategistPlay()) {
            const humanWon = (this.aiEnabled && result === 'X') || (!this.aiEnabled);
            if (humanWon) {
                this.achievements.strategist.unlocked = true;
                newAchievements.push('strategist');
            }
        }
        
        if (newAchievements.length > 0) {
            this.showAchievements(newAchievements);
            this.updateAchievements();
            this.playSound('achievement');
        }
    }
    
    checkStrategistPlay() {
        // Check if the game was won efficiently (5 moves or less for X, 4 for O)
        const movesForWin = this.currentPlayer === 'X' ? 5 : 4;
        return this.moveHistory.length <= movesForWin;
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
            firstWin: '🥇',
            lightning: '⚡',
            strategist: '🎯',
            fireStreak: '🔥',
            aiDestroyer: '🤖',
            master: '🧠'
        };
        return icons[key] || '🏆';
    }
    
    // MODAL FUNCTIONS
    showVictoryModal(winner) {
        if (!this.victoryModal) return;
        
        let resultText = '';
        if (winner) {
            if (this.aiEnabled && winner === this.aiPlayer) {
                resultText = 'DERROTA! IA VENCEU!';
            } else {
                resultText = `VITÓRIA DE ${winner}!`;
            }
        } else {
            resultText = 'EMPATE!';
        }
        
        if (this.finalResultElement) {
            this.finalResultElement.textContent = resultText;
        }
        if (this.winnerElement) {
            this.winnerElement.textContent = winner || 'EMPATE';
        }
        if (this.finalTimeElement) {
            this.finalTimeElement.textContent = this.formatTime(this.gameTime);
        }
        if (this.finalMovesElement) {
            this.finalMovesElement.textContent = this.moveHistory.length;
        }
        
        // Show match result
        if (this.matchResultElement) {
            const matchResult = `Placar Final: X ${this.scores.X} - ${this.scores.O} O`;
            this.matchResultElement.textContent = matchResult;
        }
        
        // Clear previous achievements
        if (this.achievementsEarnedElement) {
            this.achievementsEarnedElement.innerHTML = '';
        }
        
        this.victoryModal.style.display = 'block';
    }
    
    showRoundModal(result) {
        if (!this.roundModal) return;
        
        let resultText = '';
        if (result === 'draw') {
            resultText = 'EMPATE!';
        } else {
            if (this.aiEnabled && result === this.aiPlayer) {
                resultText = `DERROTA! ${result} VENCEU!`;
            } else {
                resultText = `VITÓRIA DE ${result}!`;
            }
        }
        
        if (this.roundResultElement) {
            this.roundResultElement.textContent = resultText;
        }
        if (this.roundScoreElement) {
            this.roundScoreElement.textContent = `X: ${this.scores.X} - O: ${this.scores.O}`;
        }
        
        if (this.roundNumberElement) {
            if (this.gameMode === 'infinite') {
                this.roundNumberElement.textContent = `Rodada ${this.currentRound}`;
            } else {
                this.roundNumberElement.textContent = `${this.currentRound} de ${this.maxRounds}`;
            }
        }
        
        this.roundModal.style.display = 'block';
    }
    
    closeModals() {
        if (this.victoryModal) this.victoryModal.style.display = 'none';
        if (this.roundModal) this.roundModal.style.display = 'none';
    }
    
    // EVENT HANDLERS
    handleKeyPress(e) {
        // Prevent default for game keys
        if (['Space', 'Escape', 'KeyH', 'KeyN', 'KeyR'].includes(e.code) ||
            (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) ||
            (e.key >= '1' && e.key <= '9')) {
            e.preventDefault();
        }
        
        switch(e.code) {
            case 'Space':
                if (this.gameActive) {
                    this.resetRound();
                } else {
                    this.newGame();
                }
                break;
            case 'Escape':
                this.newGame();
                break;
            case 'KeyH':
                this.showHint();
                break;
            case 'KeyN':
                this.newGame();
                break;
            case 'KeyR':
                this.resetRound();
                break;
            case 'KeyZ':
                if (e.ctrlKey || e.metaKey) {
                    this.undoMove();
                }
                break;
        }
        
        // Number keys 1-9 for cell selection
        if (e.key >= '1' && e.key <= '9') {
            const cellIndex = parseInt(e.key) - 1;
            this.makeMove(cellIndex);
        }
    }
    
    // SOUND SYSTEM
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
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    break;
                case 'victory':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.5);
                    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                    break;
                case 'defeat':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    break;
                case 'draw':
                    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                    break;
                case 'achievement':
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
                    break;
                case 'start':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                    break;
                case 'hint':
                    oscillator.frequency.setValueAtTime(700, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
                    break;
            }
            
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }
    
    // STORAGE FUNCTIONS
    loadStats() {
        try {
            // Try to load from localStorage if available
            const saved = localStorage.getItem('ticTacToeStats');
            if (saved) {
                this.stats = { ...this.stats, ...JSON.parse(saved) };
            }
            
            // Load achievements
            const savedAchievements = localStorage.getItem('ticTacToeAchievements');
            if (savedAchievements) {
                const parsed = JSON.parse(savedAchievements);
                Object.keys(parsed).forEach(key => {
                    if (this.achievements[key]) {
                        this.achievements[key].unlocked = parsed[key].unlocked;
                    }
                });
            }
        } catch (error) {
            // localStorage not available or error
            console.log('Could not load stats:', error);
        }
    }
    
    saveStats() {
        try {
            // Try to save to localStorage if available
            localStorage.setItem('ticTacToeStats', JSON.stringify(this.stats));
            
            // Save achievements
            const achievementsToSave = {};
            Object.keys(this.achievements).forEach(key => {
                achievementsToSave[key] = { unlocked: this.achievements[key].unlocked };
            });
            localStorage.setItem('ticTacToeAchievements', JSON.stringify(achievementsToSave));
        } catch (error) {
            // localStorage not available or error
            console.log('Could not save stats:', error);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game
    const game = new TicTacToeGame();
    
    // Set initial game mode
    game.setGameMode('best-of-3');
    
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
    
    // Add visibility change handler
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && game.gameActive && game.timerInterval) {
            // Pause timer when window is hidden if needed
            // Currently the game continues
        }
    });
    
    // Console information
    console.log('⭕ Tic Tac Toe Game - Desktop Edition Loaded');
    console.log('');
    console.log('🎮 Features:');
    console.log('  ✓ Complete tic-tac-toe rules implementation');
    console.log('  ✓ Advanced AI with 4 difficulty levels');
    console.log('  ✓ Multiple game modes (Best of 1/3/5, Infinite)');
    console.log('  ✓ Timer system and comprehensive statistics');
    console.log('  ✓ Achievement system with 6 unlockable achievements');
    console.log('  ✓ Move history and undo functionality');
    console.log('  ✓ Hint system for strategic gameplay');
    console.log('  ✓ Mobile responsive design with touch controls');
    console.log('  ✓ Sound effects and smooth animations');
    console.log('  ✓ Keyboard shortcuts for all actions');
    console.log('');
    
    if (game.isMobile) {
        console.log('📱 Mobile controls detected - Touch to play!');
    } else {
        console.log('⌨️ Desktop controls:');
        console.log('  SPACE: New round or new game');
        console.log('  ESC: New game');
        console.log('  H: Show hint');
        console.log('  R: Reset round');
        console.log('  N: New game');
        console.log('  Ctrl+Z: Undo move');
        console.log('  1-9: Select cell by number');
    }
    
    console.log('');
    console.log('🏆 Game Modes:');
    console.log('  • Best of 1: Single round wins');
    console.log('  • Best of 3: First to 2 wins');
    console.log('  • Best of 5: First to 3 wins');
    console.log('  • Infinite: Play unlimited rounds');
    
    console.log('');
    console.log('🤖 AI Difficulty Levels:');
    console.log('  • Easy: Random moves');
    console.log('  • Medium: Strategic with 40% randomness');
    console.log('  • Hard: Full strategic play');
    console.log('  • Impossible: Perfect minimax algorithm');
    
    // Set initial status
    game.updateGameStatus('Pressione NOVO JOGO para começar');
    
    // Make game globally accessible for debugging
    window.game = game;
});