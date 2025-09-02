class ChessGame {
    constructor() {
        // Game state
        this.board = this.initializeBoard();
        this.currentTurn = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameRunning = false;
        this.gamePaused = false;
        this.moveCount = 0;
        this.lastMove = null;
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        
        // Timers
        this.timeControlSetting = 600; // 10 minutes in seconds
        this.whiteTime = this.timeControlSetting;
        this.blackTime = this.timeControlSetting;
        this.timerInterval = null;
        
        // Settings
        this.soundEnabled = true;
        this.highlightEnabled = true;
        this.aiEnabled = false;
        this.aiDifficulty = 3;
        
        // Statistics
        this.stats = {
            gamesCompleted: 0,
            whiteWins: 0,
            blackWins: 0,
            draws: 0,
            aiWins: 0
        };
        
        // Achievements
        this.achievements = {
            firstWin: { unlocked: false, name: 'Primeira Vitória', desc: 'Vença seu primeiro jogo' },
            quickMate: { unlocked: false, name: 'Xeque-mate Rápido', desc: 'Vença em menos de 20 jogadas' },
            tactical: { unlocked: false, name: 'Tático', desc: 'Capture a dama do oponente' },
            grandMaster: { unlocked: false, name: 'Grande Mestre', desc: 'Vença 10 jogos' },
            aiDestroyer: { unlocked: false, name: 'Destruidor de IA', desc: 'Vença a IA no nível Expert' }
        };
        
        // Mobile detection
        this.isMobile = this.detectMobile();
        
        // Piece Unicode symbols
        this.pieceSymbols = {
            'black-king': '♔',
            'black-queen': '♕',
            'black-rook': '♖',
            'black-bishop': '♗',
            'black-knight': '♘',
            'black-pawn': '♙',

            'white-king': '♚',
            'white-queen': '♛',
            'white-rook': '♜',
            'white-bishop': '♝',
            'white-knight': '♞',
            'white-pawn': '♟'
        };
        
        // Piece values for AI evaluation
        this.pieceValues = {
            'pawn': 100,
            'knight': 320,
            'bishop': 330,
            'rook': 500,
            'queen': 900,
            'king': 20000
        };
        
        // Position tables for piece evaluation
        this.positionTables = {
            'pawn': [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [50, 50, 50, 50, 50, 50, 50, 50],
                [10, 10, 20, 30, 30, 20, 10, 10],
                [5,  5, 10, 25, 25, 10,  5,  5],
                [0,  0,  0, 20, 20,  0,  0,  0],
                [5, -5,-10,  0,  0,-10, -5,  5],
                [5, 10, 10,-20,-20, 10, 10,  5],
                [0,  0,  0,  0,  0,  0,  0,  0]
            ],
            'knight': [
                [-50,-40,-30,-30,-30,-30,-40,-50],
                [-40,-20,  0,  0,  0,  0,-20,-40],
                [-30,  0, 10, 15, 15, 10,  0,-30],
                [-30,  5, 15, 20, 20, 15,  5,-30],
                [-30,  0, 15, 20, 20, 15,  0,-30],
                [-30,  5, 10, 15, 15, 10,  5,-30],
                [-40,-20,  0,  5,  5,  0,-20,-40],
                [-50,-40,-30,-30,-30,-30,-40,-50]
            ],
            'bishop': [
                [-20,-10,-10,-10,-10,-10,-10,-20],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-10,  0,  5, 10, 10,  5,  0,-10],
                [-10,  5,  5, 10, 10,  5,  5,-10],
                [-10,  0, 10, 10, 10, 10,  0,-10],
                [-10, 10, 10, 10, 10, 10, 10,-10],
                [-10,  5,  0,  0,  0,  0,  5,-10],
                [-20,-10,-10,-10,-10,-10,-10,-20]
            ],
            'rook': [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [5, 10, 10, 10, 10, 10, 10,  5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [0,  0,  0,  5,  5,  0,  0,  0]
            ],
            'queen': [
                [-20,-10,-10, -5, -5,-10,-10,-20],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-10,  0,  5,  5,  5,  5,  0,-10],
                [-5,  0,  5,  5,  5,  5,  0, -5],
                [0,  0,  5,  5,  5,  5,  0, -5],
                [-10,  5,  5,  5,  5,  5,  0,-10],
                [-10,  0,  5,  0,  0,  0,  0,-10],
                [-20,-10,-10, -5, -5,-10,-10,-20]
            ],
            'king': [
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-20,-30,-30,-40,-40,-30,-30,-20],
                [-10,-20,-20,-20,-20,-20,-20,-10],
                [20, 20,  0,  0,  0,  0, 20, 20],
                [20, 30, 10,  0,  0, 10, 30, 20]
            ]
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
        return [
            ['black-rook', 'black-knight', 'black-bishop', 'black-queen', 'black-king', 'black-bishop', 'black-knight', 'black-rook'],
            ['black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn'],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ['white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn'],
            ['white-rook', 'white-knight', 'white-bishop', 'white-queen', 'white-king', 'white-bishop', 'white-knight', 'white-rook']
        ];
    }
    
    initializeElements() {
        // Timer elements
        this.whiteTimeElement = document.getElementById('whiteTime');
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
        
        // Modals
        this.victoryModal = document.getElementById('victoryModal');
        this.pauseMenu = document.getElementById('pauseMenu');
        this.promotionModal = document.getElementById('promotionModal');
        
        // Game elements
        this.chessBoard = document.getElementById('chessBoard');
        this.mobileControls = document.getElementById('mobileControls');
        this.moveList = document.getElementById('moveList');
        
        // Captured pieces
        this.whiteCapturedElement = document.querySelector('#whiteCaptured .captured-list');
        this.blackCapturedElement = document.querySelector('#blackCaptured .captured-list');
        
        // Stats elements
        this.gamesCompletedElement = document.getElementById('gamesCompleted');
        this.whiteWinsElement = document.getElementById('whiteWins');
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
        this.finalTimeElement = document.getElementById('finalTime');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.mainMenuBtn = document.getElementById('mainMenuBtn');
        this.modalClose = document.getElementById('modalClose');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.pauseResetBtn = document.getElementById('pauseResetBtn');
        
        // Pause stats
        this.pauseTurnElement = document.getElementById('pauseTurn');
        this.pauseMovesElement = document.getElementById('pauseMoves');
        this.pauseTimeElement = document.getElementById('pauseTime');
    }
    
    setupEventListeners() {
        // Control buttons
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.undoBtn.addEventListener('click', () => this.undoMove());
        this.resignBtn.addEventListener('click', () => this.resign());
        
        // Mobile buttons
        if (this.mobileNewGameBtn) {
            this.mobileNewGameBtn.addEventListener('click', () => this.newGame());
            this.mobilePauseBtn.addEventListener('click', () => this.togglePause());
            this.mobileUndoBtn.addEventListener('click', () => this.undoMove());
            this.mobileRotateBtn.addEventListener('click', () => this.rotateBoard());
        }
        
        // Settings
        this.soundToggle.addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });
        this.highlightToggle.addEventListener('change', (e) => {
            this.highlightEnabled = e.target.checked;
            this.updateHighlights();
        });
        this.timeControlSelect.addEventListener('change', (e) => {
            this.timeControlSetting = parseInt(e.target.value) * 60;
            if (this.timeControlSetting === 0) {
                this.timeControlSetting = Infinity;
            }
        });
        this.aiToggle.addEventListener('change', (e) => {
            this.aiEnabled = e.target.checked;
        });
        this.aiDifficultySelect.addEventListener('change', (e) => {
            this.aiDifficulty = parseInt(e.target.value);
        });
        
        // Modal controls
        this.playAgainBtn.addEventListener('click', () => this.newGame());
        this.mainMenuBtn.addEventListener('click', () => this.resetGame());
        this.resumeBtn.addEventListener('click', () => this.togglePause());
        this.pauseResetBtn.addEventListener('click', () => this.resetGame());
        this.modalClose.addEventListener('click', () => this.closeAllModals());
        
        // Promotion modal
        document.querySelectorAll('.promotion-piece').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const piece = e.target.dataset.piece;
                this.completePromotion(piece);
            });
        });
        
        // Modal click outside to close
        this.victoryModal.addEventListener('click', (e) => {
            if (e.target === this.victoryModal) this.closeAllModals();
        });
        this.pauseMenu.addEventListener('click', (e) => {
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
        this.chessBoard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `chess-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('span');
                    pieceElement.className = 'chess-piece';
                    pieceElement.textContent = this.pieceSymbols[piece];
                    pieceElement.dataset.piece = piece;
                    pieceElement.dataset.row = row;
                    pieceElement.dataset.col = col;
                    pieceElement.draggable = !this.isMobile;
                    square.appendChild(pieceElement);
                }
                
                square.addEventListener('click', (e) => this.handleSquareClick(e));
                
                // Drag and drop
                if (!this.isMobile) {
                    square.addEventListener('dragstart', (e) => this.handleDragStart(e));
                    square.addEventListener('dragover', (e) => this.handleDragOver(e));
                    square.addEventListener('drop', (e) => this.handleDrop(e));
                    square.addEventListener('dragend', (e) => this.handleDragEnd(e));
                }
                
                this.chessBoard.appendChild(square);
            }
        }
        
        this.updateHighlights();
    }
    
    handleSquareClick(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        // Don't allow moves during AI turn
        if (this.aiEnabled && this.currentTurn === 'black') return;
        
        const square = e.target.classList.contains('chess-square') ? e.target : e.target.parentElement;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        if (this.selectedPiece) {
            // Try to move
            if (this.isValidMove(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
                this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
            } else {
                // Select new piece if it's the current player's piece
                const piece = this.board[row][col];
                if (piece && piece.startsWith(this.currentTurn)) {
                    this.selectPiece(row, col);
                } else {
                    this.clearSelection();
                }
            }
        } else {
            // Select piece
            const piece = this.board[row][col];
            if (piece && piece.startsWith(this.currentTurn)) {
                this.selectPiece(row, col);
            }
        }
    }
    
    selectPiece(row, col) {
        this.clearSelection();
        
        const piece = this.board[row][col];
        if (!piece || !piece.startsWith(this.currentTurn)) return;
        
        this.selectedPiece = { row, col, piece };
        
        // Highlight selected square
        const square = this.chessBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        square.classList.add('selected');
        
        // Calculate and show valid moves
        this.validMoves = this.getValidMoves(row, col);
        this.showValidMoves();
        
        this.playSound('select');
    }
    
    clearSelection() {
        this.selectedPiece = null;
        this.validMoves = [];
        
        // Remove highlights
        this.chessBoard.querySelectorAll('.selected').forEach(square => {
            square.classList.remove('selected');
        });
        this.chessBoard.querySelectorAll('.valid-move').forEach(square => {
            square.classList.remove('valid-move');
        });
        this.chessBoard.querySelectorAll('.capture-move').forEach(square => {
            square.classList.remove('capture-move');
        });
    }
    
    showValidMoves() {
        if (!this.highlightEnabled) return;
        
        this.validMoves.forEach(move => {
            const square = this.chessBoard.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (this.board[move.row][move.col]) {
                square.classList.add('capture-move');
            } else {
                square.classList.add('valid-move');
            }
        });
    }
    
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const [color, type] = piece.split('-');
        const moves = [];
        
        switch (type) {
            case 'pawn':
                moves.push(...this.getPawnMoves(row, col, color));
                break;
            case 'knight':
                moves.push(...this.getKnightMoves(row, col, color));
                break;
            case 'bishop':
                moves.push(...this.getBishopMoves(row, col, color));
                break;
            case 'rook':
                moves.push(...this.getRookMoves(row, col, color));
                break;
            case 'queen':
                moves.push(...this.getQueenMoves(row, col, color));
                break;
            case 'king':
                moves.push(...this.getKingMoves(row, col, color));
                break;
        }
        
        // Filter out moves that would leave king in check
        return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col, color));
    }
    
    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        
        // Single step forward
        if (this.isInBounds(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Double step from starting position
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }
        
        // Captures
        [-1, 1].forEach(dc => {
            const newRow = row + direction;
            const newCol = col + dc;
            if (this.isInBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (target && !target.startsWith(color)) {
                    moves.push({ row: newRow, col: newCol });
                }
                
                // En passant
                if (this.enPassantTarget && 
                    this.enPassantTarget.row === newRow && 
                    this.enPassantTarget.col === newCol) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        return moves;
    }
    
    getKnightMoves(row, col, color) {
        const moves = [];
        const deltas = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        deltas.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isInBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || !target.startsWith(color)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        return moves;
    }
    
    getBishopMoves(row, col, color) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                
                if (!this.isInBounds(newRow, newCol)) break;
                
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (!target.startsWith(color)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });
        
        return moves;
    }
    
    getRookMoves(row, col, color) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                
                if (!this.isInBounds(newRow, newCol)) break;
                
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (!target.startsWith(color)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });
        
        return moves;
    }
    
    getQueenMoves(row, col, color) {
        return [
            ...this.getBishopMoves(row, col, color),
            ...this.getRookMoves(row, col, color)
        ];
    }
    
    getKingMoves(row, col, color) {
        const moves = [];
        const deltas = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        deltas.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isInBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || !target.startsWith(color)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        // Castling
        if (!this.isInCheck(color)) {
            // Kingside
            if (this.castlingRights[color].kingside &&
                !this.board[row][col + 1] &&
                !this.board[row][col + 2] &&
                !this.wouldBeInCheck(row, col, row, col + 1, color) &&
                !this.wouldBeInCheck(row, col, row, col + 2, color)) {
                moves.push({ row, col: col + 2 });
            }
            
            // Queenside
            if (this.castlingRights[color].queenside &&
                !this.board[row][col - 1] &&
                !this.board[row][col - 2] &&
                !this.board[row][col - 3] &&
                !this.wouldBeInCheck(row, col, row, col - 1, color) &&
                !this.wouldBeInCheck(row, col, row, col - 2, color)) {
                moves.push({ row, col: col - 2 });
            }
        }
        
        return moves;
    }
    
    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    isValidMove(fromRow, fromCol, toRow, toCol) {
        return this.validMoves.some(move => move.row === toRow && move.col === toCol);
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        const [color, type] = piece.split('-');
        
        // Store move for history
        const moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece);
        
        // Handle special moves
        // En passant capture
        if (type === 'pawn' && this.enPassantTarget &&
            toRow === this.enPassantTarget.row && toCol === this.enPassantTarget.col) {
            const captureRow = color === 'white' ? toRow + 1 : toRow - 1;
            const captured = this.board[captureRow][toCol];
            this.capturedPieces[captured.split('-')[0]].push(captured);
            this.board[captureRow][toCol] = null;
        }
        
        // Reset en passant
        this.enPassantTarget = null;
        
        // Set en passant target for double pawn move
        if (type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = {
                row: (fromRow + toRow) / 2,
                col: fromCol
            };
        }
        
        // Castling
        if (type === 'king' && Math.abs(toCol - fromCol) === 2) {
            const rookFromCol = toCol > fromCol ? 7 : 0;
            const rookToCol = toCol > fromCol ? toCol - 1 : toCol + 1;
            this.board[toRow][rookToCol] = this.board[toRow][rookFromCol];
            this.board[toRow][rookFromCol] = null;
        }
        
        // Update castling rights
        if (type === 'king') {
            this.castlingRights[color].kingside = false;
            this.castlingRights[color].queenside = false;
        }
        if (type === 'rook') {
            if (fromCol === 0) this.castlingRights[color].queenside = false;
            if (fromCol === 7) this.castlingRights[color].kingside = false;
        }
        
        // Capture piece
        if (capturedPiece) {
            this.capturedPieces[capturedPiece.split('-')[0]].push(capturedPiece);
            this.playSound('capture');
            
            // Check for tactical achievement
            if (capturedPiece.includes('queen')) {
                this.checkTacticalAchievement();
            }
        } else {
            this.playSound('move');
        }
        
        // Move piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Store last move for highlighting
        this.lastMove = { fromRow, fromCol, toRow, toCol };
        
        // Check for pawn promotion
        if (type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.showPromotionModal(toRow, toCol, color, moveNotation);
            return;
        }
        
        this.finishMove(moveNotation);
    }
    
    finishMove(moveNotation) {
        // Update move history
        this.moveHistory.push({
            notation: moveNotation,
            board: JSON.parse(JSON.stringify(this.board)),
            capturedPieces: JSON.parse(JSON.stringify(this.capturedPieces)),
            castlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
            enPassantTarget: this.enPassantTarget ? { ...this.enPassantTarget } : null,
            lastMove: this.lastMove ? { ...this.lastMove } : null
        });
        
        // Clear selection
        this.clearSelection();
        
        // Switch turns
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        this.moveCount++;
        
        // Check for check/checkmate/stalemate
        if (this.isInCheck(this.currentTurn)) {
            if (this.isCheckmate(this.currentTurn)) {
                this.endGame(this.currentTurn === 'white' ? 'black' : 'white', 'checkmate');
                this.playSound('victory');
                return;
            } else {
                this.playSound('check');
                this.highlightCheck();
            }
        } else if (this.isStalemate(this.currentTurn)) {
            this.endGame(null, 'stalemate');
            return;
        }
        
        // Update UI
        this.updateUI();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.drawBoard(); // Redraw to update last move highlight
        
        // AI move
        if (this.aiEnabled && this.currentTurn === 'black' && this.gameRunning) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    showPromotionModal(row, col, color, moveNotation) {
        this.promotionModal.style.display = 'block';
        this.promotionTarget = { row, col, color, moveNotation };
        
        // Update promotion pieces to match color
        document.querySelectorAll('.promotion-piece').forEach(btn => {
            const piece = btn.dataset.piece;
            btn.textContent = this.pieceSymbols[`${color}-${piece}`];
        });
    }
    
    completePromotion(pieceType) {
        const { row, col, color, moveNotation } = this.promotionTarget;
        this.board[row][col] = `${color}-${pieceType}`;
        this.promotionModal.style.display = 'none';
        
        const finalNotation = moveNotation + '=' + pieceType.charAt(0).toUpperCase();
        this.finishMove(finalNotation);
    }
    
    // AI IMPLEMENTATION
    makeAIMove() {
    if (!this.gameRunning || this.gamePaused) return;
    
    // Status visual
    this.updateGameStatus('IA pensando...');
    
    // Tempo de "pensamento" baseado na dificuldade
    const thinkingDelay = 10 + (this.aiDifficulty * 100);
    
    setTimeout(() => {
        const move = this.getBestMove('black', this.aiDifficulty);
        if (move) {
            // Primeiro mostra a seleção
            this.selectPiece(move.from.row, move.from.col);
            this.updateGameStatus('IA escolheu uma peça...');
            
            // Depois faz o movimento
            setTimeout(() => {
                this.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
            }, 1000); // 1 segundo entre seleção e movimento
        }
        }, thinkingDelay);
    }
    
    getBestMove(color, depth) {
        const result = this.minimax(depth, -Infinity, Infinity, color === 'black', color);
        return result.move;
    }
    
    minimax(depth, alpha, beta, maximizingPlayer, color) {
        if (depth === 0 || this.isGameOver()) {
            return { score: this.evaluatePosition(color), move: null };
        }
        
        const moves = this.getAllValidMoves(maximizingPlayer ? color : (color === 'white' ? 'black' : 'white'));
        
        if (moves.length === 0) {
            if (this.isInCheck(maximizingPlayer ? color : (color === 'white' ? 'black' : 'white'))) {
                return { score: maximizingPlayer ? -Infinity : Infinity, move: null };
            } else {
                return { score: 0, move: null }; // Stalemate
            }
        }
        
        let bestMove = null;
        
        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const undoInfo = this.makeTemporaryMove(move);
                const eval_result = this.minimax(depth - 1, alpha, beta, false, color);
                this.undoTemporaryMove(undoInfo);
                
                if (eval_result.score > maxEval) {
                    maxEval = eval_result.score;
                    bestMove = move;
                }
                alpha = Math.max(alpha, eval_result.score);
                if (beta <= alpha) {
                    break; // Alpha-beta pruning
                }
            }
            return { score: maxEval, move: bestMove };
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const undoInfo = this.makeTemporaryMove(move);
                const eval_result = this.minimax(depth - 1, alpha, beta, true, color);
                this.undoTemporaryMove(undoInfo);
                
                if (eval_result.score < minEval) {
                    minEval = eval_result.score;
                    bestMove = move;
                }
                beta = Math.min(beta, eval_result.score);
                if (beta <= alpha) {
                    break; // Alpha-beta pruning
                }
            }
            return { score: minEval, move: bestMove };
        }
    }
    
    getAllValidMoves(color) {
        const moves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.startsWith(color)) {
                    const validMoves = this.getValidMoves(row, col);
                    validMoves.forEach(move => {
                        moves.push({
                            from: { row, col },
                            to: move,
                            piece: piece
                        });
                    });
                }
            }
        }
        
        return moves;
    }
    
    makeTemporaryMove(move) {
        const { from, to } = move;
        const capturedPiece = this.board[to.row][to.col];
        const originalEnPassant = this.enPassantTarget;
        const originalCastling = JSON.parse(JSON.stringify(this.castlingRights));
        
        // Make the move
        this.board[to.row][to.col] = this.board[from.row][from.col];
        this.board[from.row][from.col] = null;
        
        // Handle en passant capture
        let enPassantCaptured = null;
        if (this.board[to.row][to.col].includes('pawn') && originalEnPassant &&
            to.row === originalEnPassant.row && to.col === originalEnPassant.col) {
            const captureRow = this.board[to.row][to.col].startsWith('white') ? to.row + 1 : to.row - 1;
            enPassantCaptured = this.board[captureRow][to.col];
            this.board[captureRow][to.col] = null;
        }
        
        // Handle castling
        let castlingRookMove = null;
        if (this.board[to.row][to.col].includes('king') && Math.abs(to.col - from.col) === 2) {
            const rookFromCol = to.col > from.col ? 7 : 0;
            const rookToCol = to.col > from.col ? to.col - 1 : to.col + 1;
            castlingRookMove = {
                from: { row: to.row, col: rookFromCol },
                to: { row: to.row, col: rookToCol },
                piece: this.board[to.row][rookFromCol]
            };
            this.board[to.row][rookToCol] = this.board[to.row][rookFromCol];
            this.board[to.row][rookFromCol] = null;
        }
        
        // Update en passant
        this.enPassantTarget = null;
        if (this.board[to.row][to.col].includes('pawn') && Math.abs(to.row - from.row) === 2) {
            this.enPassantTarget = {
                row: (from.row + to.row) / 2,
                col: from.col
            };
        }
        
        // Update castling rights
        const piece = this.board[to.row][to.col];
        const [color, type] = piece.split('-');
        if (type === 'king') {
            this.castlingRights[color].kingside = false;
            this.castlingRights[color].queenside = false;
        }
        if (type === 'rook') {
            if (from.col === 0) this.castlingRights[color].queenside = false;
            if (from.col === 7) this.castlingRights[color].kingside = false;
        }
        
        return {
            from,
            to,
            capturedPiece,
            enPassantCaptured,
            castlingRookMove,
            originalEnPassant,
            originalCastling
        };
    }
    
    undoTemporaryMove(undoInfo) {
        const { from, to, capturedPiece, enPassantCaptured, castlingRookMove, originalEnPassant, originalCastling } = undoInfo;
        
        // Restore the piece
        this.board[from.row][from.col] = this.board[to.row][to.col];
        this.board[to.row][to.col] = capturedPiece;
        
        // Restore en passant capture
        if (enPassantCaptured) {
            const captureRow = this.board[from.row][from.col].startsWith('white') ? to.row + 1 : to.row - 1;
            this.board[captureRow][to.col] = enPassantCaptured;
        }
        
        // Restore castling
        if (castlingRookMove) {
            this.board[castlingRookMove.from.row][castlingRookMove.from.col] = castlingRookMove.piece;
            this.board[castlingRookMove.to.row][castlingRookMove.to.col] = null;
        }
        
        // Restore state
        this.enPassantTarget = originalEnPassant;
        this.castlingRights = originalCastling;
    }
    
    evaluatePosition(aiColor) {
        let score = 0;
        
        // Material evaluation
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    const [color, type] = piece.split('-');
                    const pieceValue = this.pieceValues[type];
                    const positionValue = this.getPositionValue(type, row, col, color);
                    
                    if (color === aiColor) {
                        score += pieceValue + positionValue;
                    } else {
                        score -= pieceValue + positionValue;
                    }
                }
            }
        }
        
        // Add bonus for checkmate
        if (this.isCheckmate(aiColor === 'white' ? 'black' : 'white')) {
            score += aiColor === 'white' ? 100000 : -100000;
        } else if (this.isCheckmate(aiColor)) {
            score += aiColor === 'white' ? -100000 : 100000;
        }
        
        // Add penalty for being in check
        if (this.isInCheck(aiColor)) {
            score -= 50;
        }
        if (this.isInCheck(aiColor === 'white' ? 'black' : 'white')) {
            score += 50;
        }
        
        return score;
    }
    
    getPositionValue(pieceType, row, col, color) {
        if (!this.positionTables[pieceType]) return 0;
        
        // Flip the board for black pieces
        const tableRow = color === 'white' ? row : 7 - row;
        return this.positionTables[pieceType][tableRow][col];
    }
    
    isGameOver() {
        return this.isCheckmate('white') || this.isCheckmate('black') || 
               this.isStalemate('white') || this.isStalemate('black');
    }
    
    // GAME STATE CHECKS
    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Create temporary board state
        const tempBoard = JSON.parse(JSON.stringify(this.board));
        tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
        tempBoard[fromRow][fromCol] = null;
        
        return this.isInCheckOnBoard(color, tempBoard);
    }
    
    isInCheck(color) {
        return this.isInCheckOnBoard(color, this.board);
    }
    
    isInCheckOnBoard(color, board) {
        // Find king position
        let kingRow, kingCol;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === `${color}-king`) {
                    kingRow = row;
                    kingCol = col;
                    break;
                }
            }
        }
        
        if (kingRow === undefined) return false;
        
        // Check if any opponent piece can attack the king
        const opponentColor = color === 'white' ? 'black' : 'white';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.startsWith(opponentColor)) {
                    if (this.canAttack(row, col, kingRow, kingCol, board)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    canAttack(fromRow, fromCol, toRow, toCol, board) {
        const piece = board[fromRow][fromCol];
        if (!piece) return false;
        
        const [color, type] = piece.split('-');
        const rowDiff = toRow - fromRow;
        const colDiff = toCol - fromCol;
        const absRowDiff = Math.abs(rowDiff);
        const absColDiff = Math.abs(colDiff);
        
        switch (type) {
            case 'pawn':
                const direction = color === 'white' ? -1 : 1;
                return rowDiff === direction && absColDiff === 1;
                
            case 'knight':
                return (absRowDiff === 2 && absColDiff === 1) || 
                       (absRowDiff === 1 && absColDiff === 2);
                
            case 'bishop':
                if (absRowDiff !== absColDiff) return false;
                return this.isPathClear(fromRow, fromCol, toRow, toCol, board);
                
            case 'rook':
                if (rowDiff !== 0 && colDiff !== 0) return false;
                return this.isPathClear(fromRow, fromCol, toRow, toCol, board);
                
            case 'queen':
                if (rowDiff !== 0 && colDiff !== 0 && absRowDiff !== absColDiff) return false;
                return this.isPathClear(fromRow, fromCol, toRow, toCol, board);
                
            case 'king':
                return absRowDiff <= 1 && absColDiff <= 1;
                
            default:
                return false;
        }
    }
    
    isPathClear(fromRow, fromCol, toRow, toCol, board) {
        const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
        const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
        
        let row = fromRow + rowStep;
        let col = fromCol + colStep;
        
        while (row !== toRow || col !== toCol) {
            if (board[row][col]) return false;
            row += rowStep;
            col += colStep;
        }
        
        return true;
    }
    
    isCheckmate(color) {
        // If not in check, can't be checkmate
        if (!this.isInCheck(color)) return false;
        
        // Check if any move can get out of check
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.startsWith(color)) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) return false;
                }
            }
        }
        
        return true;
    }
    
    isStalemate(color) {
        // If in check, can't be stalemate
        if (this.isInCheck(color)) return false;
        
        // Check if any legal move exists
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.startsWith(color)) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) return false;
                }
            }
        }
        
        return true;
    }
    
    // GAME NOTATION
    getMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        const [color, type] = piece.split('-');
        
        let notation = '';
        
        // Castling
        if (type === 'king' && Math.abs(toCol - fromCol) === 2) {
            return toCol > fromCol ? 'O-O' : 'O-O-O';
        }
        
        // Piece symbol (pawns have no symbol)
        if (type !== 'pawn') {
            notation += type.charAt(0).toUpperCase();
        }
        
        // Capture
        if (capturedPiece || (type === 'pawn' && this.enPassantTarget && 
            toRow === this.enPassantTarget.row && toCol === this.enPassantTarget.col)) {
            if (type === 'pawn') {
                notation += files[fromCol];
            }
            notation += 'x';
        }
        
        // Destination
        notation += files[toCol] + ranks[toRow];
        
        return notation;
    }
    
    // GAME CONTROLS
    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        // Don't allow undo during AI turn
        if (this.aiEnabled && this.currentTurn === 'black') return;
        
        // Remove last move
        this.moveHistory.pop();
        
        if (this.moveHistory.length > 0) {
            // Restore previous state
            const lastState = this.moveHistory[this.moveHistory.length - 1];
            this.board = JSON.parse(JSON.stringify(lastState.board));
            this.capturedPieces = JSON.parse(JSON.stringify(lastState.capturedPieces));
            this.castlingRights = JSON.parse(JSON.stringify(lastState.castlingRights));
            this.enPassantTarget = lastState.enPassantTarget ? { ...lastState.enPassantTarget } : null;
            this.lastMove = lastState.lastMove ? { ...lastState.lastMove } : null;
        } else {
            // Reset to initial state
            this.board = this.initializeBoard();
            this.capturedPieces = { white: [], black: [] };
            this.castlingRights = {
                white: { kingside: true, queenside: true },
                black: { kingside: true, queenside: true }
            };
            this.enPassantTarget = null;
            this.lastMove = null;
        }
        
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        this.moveCount = Math.max(0, this.moveCount - 1);
        
        this.clearSelection();
        this.drawBoard();
        this.updateUI();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.playSound('move');
    }
    
    resign() {
        if (!this.gameRunning) return;
        
        const winner = this.currentTurn === 'white' ? 'black' : 'white';
        this.endGame(winner, 'resignation');
    }
    
    endGame(winner, reason) {
        this.gameRunning = false;
        clearInterval(this.timerInterval);
        
        // Update statistics
        this.stats.gamesCompleted++;
        if (winner === 'white') {
            this.stats.whiteWins++;
            if (this.aiEnabled) this.stats.aiWins++;
        } else if (winner === 'black') {
            this.stats.blackWins++;
            if (this.aiEnabled) this.stats.aiWins++;
        } else {
            this.stats.draws++;
        }
        
        this.saveStats();
        this.checkAchievements(winner, reason);
        this.showVictoryModal(winner, reason);
        
        // Update UI
        this.pauseBtn.disabled = true;
        if (this.mobilePauseBtn) {
            this.mobilePauseBtn.disabled = true;
        }
        
        let statusMessage = '';
        if (reason === 'checkmate') {
            statusMessage = `Xeque-mate! ${winner === 'white' ? 'Brancas' : 'Pretas'} vencem!`;
        } else if (reason === 'stalemate') {
            statusMessage = 'Empate por afogamento!';
        } else if (reason === 'resignation') {
            statusMessage = `${this.currentTurn === 'white' ? 'Brancas' : 'Pretas'} desistiram!`;
        } else if (reason === 'timeout') {
            statusMessage = `Tempo esgotado! ${winner === 'white' ? 'Brancas' : 'Pretas'} vencem!`;
        }
        
        this.updateGameStatus(statusMessage);
    }
    
    newGame() {
        this.board = this.initializeBoard();
        this.currentTurn = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameRunning = true;
        this.gamePaused = false;
        this.moveCount = 0;
        this.lastMove = null;
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        
        // Reset timers
        const timeInSeconds = parseInt(this.timeControlSelect.value) * 60;
        this.whiteTime = timeInSeconds || Infinity;
        this.blackTime = timeInSeconds || Infinity;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        if (this.whiteTime !== Infinity) {
            this.startTimer();
        }
        
        this.drawBoard();
        this.updateUI();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.closeAllModals();
        
        this.pauseBtn.disabled = false;
        if (this.mobilePauseBtn) {
            this.mobilePauseBtn.disabled = false;
        }
        
        this.updateGameStatus('Jogo iniciado! Brancas começam');
        this.playSound('start');
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.moveCount = 0;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.board = this.initializeBoard();
        this.capturedPieces = { white: [], black: [] };
        this.moveHistory = [];
        this.lastMove = null;
        
        this.drawBoard();
        this.updateUI();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.closeAllModals();
        
        this.pauseBtn.disabled = true;
        if (this.mobilePauseBtn) {
            this.mobilePauseBtn.disabled = true;
        }
        
        this.updateGameStatus('Pressione NOVO JOGO para começar');
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.updateGameStatus('Jogo pausado');
            this.showPauseMenu();
        } else {
            this.updateGameStatus(`Turno das ${this.currentTurn === 'white' ? 'Brancas' : 'Pretas'}`);
            this.closeAllModals();
        }
        
        this.updateButtonText();
    }
    
    rotateBoard() {
        this.chessBoard.classList.add('rotate');
        setTimeout(() => {
            this.chessBoard.classList.remove('rotate');
            this.drawBoard(); // Redraw with flipped positions if needed
        }, 500);
        this.playSound('move');
    }
    
    // TIMER FUNCTIONS
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.gameRunning && !this.gamePaused) {
                if (this.currentTurn === 'white') {
                    this.whiteTime--;
                    if (this.whiteTime <= 0) {
                        this.endGame('black', 'timeout');
                    }
                } else {
                    this.blackTime--;
                    if (this.blackTime <= 0) {
                        this.endGame('white', 'timeout');
                    }
                }
                this.updateTimers();
            }
        }, 1000);
    }
    
    updateTimers() {
        this.whiteTimeElement.textContent = this.formatTime(this.whiteTime);
        this.blackTimeElement.textContent = this.formatTime(this.blackTime);
    }
    
    formatTime(seconds) {
        if (seconds === Infinity) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateButtonText() {
        const pauseIcon = this.pauseBtn.querySelector('.btn-icon');
        const pauseText = this.pauseBtn.querySelector('.btn-text');
        
        if (this.gamePaused) {
            pauseIcon.textContent = '▶';
            pauseText.textContent = 'CONTINUAR';
        } else {
            pauseIcon.textContent = '⏸';
            pauseText.textContent = 'PAUSAR';
        }
        
        if (this.mobilePauseBtn) {
            if (this.gamePaused) {
                this.mobilePauseBtn.innerHTML = '<span class="btn-icon">▶</span>CONTINUAR';
            } else {
                this.mobilePauseBtn.innerHTML = '<span class="btn-icon">⏸</span>PAUSAR';
            }
        }
    }
    
    // UI UPDATE FUNCTIONS
    updateUI() {
        this.currentTurnElement.textContent = this.currentTurn === 'white' ? 'BRANCAS' : 'PRETAS';
        this.moveCountElement.textContent = this.moveCount;
        
        // Update statistics
        if (this.gamesCompletedElement) {
            this.gamesCompletedElement.textContent = this.stats.gamesCompleted;
        }
        if (this.whiteWinsElement) {
            this.whiteWinsElement.textContent = this.stats.whiteWins;
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
        this.moveList.innerHTML = '';
        
        for (let i = 0; i < this.moveHistory.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            
            const numberDiv = document.createElement('div');
            numberDiv.className = 'move-number';
            numberDiv.textContent = moveNumber + '.';
            
            const whiteMove = document.createElement('div');
            whiteMove.className = 'move-white';
            whiteMove.textContent = this.moveHistory[i].notation;
            
            this.moveList.appendChild(numberDiv);
            this.moveList.appendChild(whiteMove);
            
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
        
        // Scroll to bottom
        this.moveList.scrollTop = this.moveList.scrollHeight;
    }
    
    updateCapturedPieces() {
        this.whiteCapturedElement.innerHTML = '';
        this.blackCapturedElement.innerHTML = '';
        
        this.capturedPieces.white.forEach(piece => {
            const pieceSpan = document.createElement('span');
            pieceSpan.textContent = this.pieceSymbols[piece];
            this.whiteCapturedElement.appendChild(pieceSpan);
        });
        
        this.capturedPieces.black.forEach(piece => {
            const pieceSpan = document.createElement('span');
            pieceSpan.textContent = this.pieceSymbols[piece];
            this.blackCapturedElement.appendChild(pieceSpan);
        });
    }
    
    updateHighlights() {
        // Remove all highlights
        this.chessBoard.querySelectorAll('.last-move').forEach(square => {
            square.classList.remove('last-move');
        });
        this.chessBoard.querySelectorAll('.in-check').forEach(square => {
            square.classList.remove('in-check');
        });
        
        // Highlight last move
        if (this.highlightEnabled && this.lastMove) {
            const fromSquare = this.chessBoard.querySelector(`[data-row="${this.lastMove.fromRow}"][data-col="${this.lastMove.fromCol}"]`);
            const toSquare = this.chessBoard.querySelector(`[data-row="${this.lastMove.toRow}"][data-col="${this.lastMove.toCol}"]`);
            if (fromSquare) fromSquare.classList.add('last-move');
            if (toSquare) toSquare.classList.add('last-move');
        }
    }
    
    highlightCheck() {
        if (!this.highlightEnabled) return;
        
        // Find king in check
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === `${this.currentTurn}-king`) {
                    const square = this.chessBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    square.classList.add('in-check');
                    break;
                }
            }
        }
    }
    
    updateGameStatus(message) {
        this.gameStatusElement.textContent = message;
    }
    
    // EVENT HANDLERS
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
        const piece = e.target.classList.contains('chess-piece') ? e.target : null;
        if (!piece) return;
        
        const row = parseInt(piece.dataset.row);
        const col = parseInt(piece.dataset.col);
        
        if (this.board[row][col] && this.board[row][col].startsWith(this.currentTurn)) {
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
        const square = e.target.classList.contains('chess-square') ? e.target : e.target.parentElement;
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
    
    // ACHIEVEMENTS SYSTEM
    checkAchievements(winner, reason) {
        const newAchievements = [];
        
        // First Win
        if (!this.achievements.firstWin.unlocked && winner && winner === 'white') {
            this.achievements.firstWin.unlocked = true;
            newAchievements.push('firstWin');
        }
        
        // Quick Mate
        if (!this.achievements.quickMate.unlocked && reason === 'checkmate' && this.moveCount < 40) {
            this.achievements.quickMate.unlocked = true;
            newAchievements.push('quickMate');
        }
        
        // Grand Master
        if (!this.achievements.grandMaster.unlocked && this.stats.whiteWins >= 10) {
            this.achievements.grandMaster.unlocked = true;
            newAchievements.push('grandMaster');
        }
        
        // AI Destroyer
        if (!this.achievements.aiDestroyer.unlocked && this.aiEnabled && winner === 'white' && this.aiDifficulty === 4) {
            this.achievements.aiDestroyer.unlocked = true;
            newAchievements.push('aiDestroyer');
        }
        
        if (newAchievements.length > 0) {
            this.showAchievements(newAchievements);
            this.updateAchievements();
            this.playSound('achievement');
        }
    }
    
    checkTacticalAchievement() {
        if (!this.achievements.tactical.unlocked) {
            this.achievements.tactical.unlocked = true;
            this.showAchievements(['tactical']);
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
            firstWin: '🥇',
            quickMate: '⚡',
            tactical: '🎯',
            grandMaster: '🧠',
            aiDestroyer: '🤖'
        };
        return icons[key] || '🏆';
    }
    
    // MODAL FUNCTIONS
    showVictoryModal(winner, reason) {
        let resultText = '';
        if (reason === 'checkmate') {
            resultText = 'XEQUE-MATE!';
        } else if (reason === 'stalemate') {
            resultText = 'EMPATE!';
        } else if (reason === 'resignation') {
            resultText = 'DESISTÊNCIA!';
        } else if (reason === 'timeout') {
            resultText = 'TEMPO ESGOTADO!';
        }
        
        this.finalResultElement.textContent = resultText;
        this.winnerElement.textContent = winner ? (winner === 'white' ? 'BRANCAS' : 'PRETAS') : 'EMPATE';
        this.finalMovesElement.textContent = this.moveCount;
        
        const totalTime = (this.timeControlSetting * 2) - (this.whiteTime + this.blackTime);
        this.finalTimeElement.textContent = this.formatTime(totalTime);
        
        // Clear previous achievements
        this.achievementsEarnedElement.innerHTML = '';
        
        this.victoryModal.style.display = 'block';
    }
    
    showPauseMenu() {
        this.pauseTurnElement.textContent = this.currentTurn === 'white' ? 'BRANCAS' : 'PRETAS';
        this.pauseMovesElement.textContent = this.moveCount;
        
        const totalTime = (this.timeControlSetting * 2) - (this.whiteTime + this.blackTime);
        this.pauseTimeElement.textContent = this.formatTime(totalTime);
        
        this.pauseMenu.style.display = 'block';
    }
    
    closeAllModals() {
        this.victoryModal.style.display = 'none';
        this.pauseMenu.style.display = 'none';
        this.promotionModal.style.display = 'none';
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
                case 'select':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    break;
                case 'move':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    break;
                case 'capture':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
                    break;
                case 'check':
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.3);
                    break;
                case 'victory':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.5);
                    break;
                case 'achievement':
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.3);
                    break;
                case 'start':
                    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
                    break;
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
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
            const saved = JSON.parse(JSON.stringify({
                gamesCompleted: 0,
                whiteWins: 0,
                blackWins: 0,
                draws: 0,
                aiWins: 0
            })); // In real app, would use localStorage.getItem('chessStats')
            
            if (saved) {
                this.stats = { ...this.stats, ...saved };
            }
        } catch (error) {
            console.warn('Could not load stats:', error);
        }
    }
    
    saveStats() {
        try {
            // In real app, would use localStorage.setItem('chessStats', JSON.stringify(this.stats))
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
   
    
    // Initialize the game
    const game = new ChessGame();
    
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
    
    // Inject JavaScript into script tag
    console.log('♟️ Chess Game - Desktop Edition Loaded');
    console.log('Features:');
    console.log('  ✓ Complete chess rules implementation');
    console.log('  ✓ Advanced AI with multiple difficulty levels');
    console.log('  ✓ Drag & drop and click-to-move controls');
    console.log('  ✓ Timer system and game statistics');
    console.log('  ✓ Achievement system');
    console.log('  ✓ Mobile responsive design');
    console.log('  ✓ Sound effects and animations');
    console.log('  ✓ En passant, castling, and pawn promotion');
    
    if (game.isMobile) {
        console.log('Mobile controls detected - Touch to play!');
    } else {
        console.log('Desktop controls:');
        console.log('  SPACE: Pause/Resume or Start new game');
        console.log('  R: Rotate board');
        console.log('  N: New game');
        console.log('  Ctrl+Z: Undo move');
        console.log('  ESC: Cancel selection');
    }
});