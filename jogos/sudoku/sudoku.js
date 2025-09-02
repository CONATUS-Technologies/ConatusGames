class SudokuGame {
    constructor() {
        // Game state
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.initialBoard = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameStartTime = 0;
        this.gameTime = 0;
        this.errorCount = 0;
        this.hintsUsed = 0;
        this.filledCells = 0;
        
        // Settings
        this.difficulty = 'medium';
        this.soundEnabled = true;
        this.highlightEnabled = true;
        this.hintsEnabled = true;
        
        // Statistics
        this.stats = {
            gamesCompleted: 0,
            bestTime: null,
            accuracy: 100,
            totalMoves: 0,
            correctMoves: 0,
            easyCompleted: 0,
            mediumCompleted: 0,
            hardCompleted: 0,
            expertCompleted: 0
        };
        
        // Achievements
        this.achievements = {
            firstSudoku: { unlocked: false, name: 'Primeiro Sudoku', desc: 'Complete seu primeiro sudoku' },
            speedster: { unlocked: false, name: 'Velocista', desc: 'Complete em menos de 5 minutos' },
            perfectionist: { unlocked: false, name: 'Perfeccionista', desc: 'Complete sem erros' },
            master: { unlocked: false, name: 'Mestre', desc: 'Complete sudoku Expert' }
        };
        
        // Mobile detection
        this.isMobile = this.detectMobile();
        
        // Initialize game
        this.initializeElements();
        this.setupEventListeners();
        this.loadStats();
        this.updateUI();
        this.updateAchievements();
        this.createGrid();
        this.startTimer();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
               window.innerWidth <= 768;
    }
    
    initializeElements() {
        // Stats elements
        this.gameTimeElement = document.getElementById('gameTime');
        this.bestTimeElement = document.getElementById('bestTime');
        this.currentDifficultyElement = document.getElementById('currentDifficulty');
        this.errorCountElement = document.getElementById('errorCount');
        this.gameStatusElement = document.getElementById('gameStatus');
        
        // Control buttons
        this.newGameBtn = document.getElementById('newGameBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.solveBtn = document.getElementById('solveBtn');
        this.hintBtn = document.getElementById('hintBtn');
        
        // Mobile buttons
        this.mobileNewGameBtn = document.getElementById('mobileNewGameBtn');
        this.mobilePauseBtn = document.getElementById('mobilePauseBtn');
        this.mobileResetBtn = document.getElementById('mobileResetBtn');
        this.mobileHintBtn = document.getElementById('mobileHintBtn');
        
        // Settings
        this.soundToggle = document.getElementById('soundToggle');
        this.highlightToggle = document.getElementById('highlightToggle');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.hintsToggle = document.getElementById('hintsToggle');
        
        // Modals
        this.victoryModal = document.getElementById('victoryModal');
        this.pauseMenu = document.getElementById('pauseMenu');
        
        // Game elements
        this.sudokuGrid = document.getElementById('sudokuGrid');
        this.numberPad = document.getElementById('numberPad');
        this.mobileControls = document.getElementById('mobileControls');
        
        // Progress elements
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // Stats elements
        this.gamesCompletedElement = document.getElementById('gamesCompleted');
        this.personalBestElement = document.getElementById('personalBest');
        this.accuracyElement = document.getElementById('accuracy');
        this.hintsUsedElement = document.getElementById('hintsUsed');
        
        // Achievement elements
        this.achievementsListElement = document.getElementById('achievementsList');
        this.achievementsEarnedElement = document.getElementById('achievementsEarned');
        
        // Modal elements
        this.finalTimeElement = document.getElementById('finalTime');
        this.finalDifficultyElement = document.getElementById('finalDifficulty');
        this.finalErrorsElement = document.getElementById('finalErrors');
        this.newRecordElement = document.getElementById('newRecord');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.mainMenuBtn = document.getElementById('mainMenuBtn');
        this.modalClose = document.getElementById('modalClose');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.pauseResetBtn = document.getElementById('pauseResetBtn');
        
        // Pause stats
        this.pauseTimeElement = document.getElementById('pauseTime');
        this.pauseDifficultyElement = document.getElementById('pauseDifficulty');
        this.pauseProgressElement = document.getElementById('pauseProgress');
        
        // Difficulty counts
        this.easyCountElement = document.getElementById('easyCount');
        this.mediumCountElement = document.getElementById('mediumCount');
        this.hardCountElement = document.getElementById('hardCount');
        this.expertCountElement = document.getElementById('expertCount');
    }
    
    setupEventListeners() {
        // Control buttons
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.solveBtn.addEventListener('click', () => this.solvePuzzle());
        this.hintBtn.addEventListener('click', () => this.giveHint());
        
        // Mobile buttons
        if (this.mobileNewGameBtn) {
            this.mobileNewGameBtn.addEventListener('click', () => this.newGame());
            this.mobilePauseBtn.addEventListener('click', () => this.togglePause());
            this.mobileResetBtn.addEventListener('click', () => this.resetGame());
            this.mobileHintBtn.addEventListener('click', () => this.giveHint());
        }
        
        // Settings
        this.soundToggle.addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });
        this.highlightToggle.addEventListener('change', (e) => {
            this.highlightEnabled = e.target.checked;
            this.updateHighlights();
        });
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.updateUI();
        });
        this.hintsToggle.addEventListener('change', (e) => {
            this.hintsEnabled = e.target.checked;
            this.hintBtn.disabled = !e.target.checked;
            if (this.mobileHintBtn) {
                this.mobileHintBtn.disabled = !e.target.checked;
            }
        });
        
        // Modal controls
        this.playAgainBtn.addEventListener('click', () => this.newGame());
        this.mainMenuBtn.addEventListener('click', () => this.resetGame());
        this.resumeBtn.addEventListener('click', () => this.togglePause());
        this.pauseResetBtn.addEventListener('click', () => this.resetGame());
        this.modalClose.addEventListener('click', () => this.closeAllModals());
        
        // Modal click outside to close
        this.victoryModal.addEventListener('click', (e) => {
            if (e.target === this.victoryModal) this.closeAllModals();
        });
        this.pauseMenu.addEventListener('click', (e) => {
            if (e.target === this.pauseMenu) this.togglePause();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Number pad (mobile)
        if (this.numberPad) {
            this.numberPad.addEventListener('click', (e) => {
                if (e.target.classList.contains('number-btn')) {
                    const number = parseInt(e.target.dataset.number);
                    if (number === 0) {
                        this.clearCell();
                    } else if (number >= 1 && number <= 9) {
                        this.enterNumber(number);
                    }
                }
            });
        }
        
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
        if (this.isMobile && this.numberPad) {
            this.numberPad.style.display = 'block';
        }
    }
    
    createGrid() {
        this.sudokuGrid.innerHTML = '';
        
        for (let box = 0; box < 9; box++) {
            const boxElement = document.createElement('div');
            boxElement.className = 'sudoku-box';
            
            for (let cell = 0; cell < 9; cell++) {
                const row = Math.floor(box / 3) * 3 + Math.floor(cell / 3);
                const col = (box % 3) * 3 + (cell % 3);
                
                const cellElement = document.createElement('div');
                cellElement.className = 'sudoku-cell';
                cellElement.dataset.row = row;
                cellElement.dataset.col = col;
                
                cellElement.addEventListener('click', () => this.selectCell(row, col));
                
                boxElement.appendChild(cellElement);
            }
            
            this.sudokuGrid.appendChild(boxElement);
        }
    }
    
    generatePuzzle() {
        // Clear the board
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        
        // Generate a complete solution
        this.generateCompleteSolution();
        
        // Copy solution
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.solution[i][j] = this.board[i][j];
            }
        }
        
        // Remove numbers based on difficulty
        this.removeNumbers();
        
        // Store initial board state
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.initialBoard[i][j] = this.board[i][j];
            }
        }
    }
    
    generateCompleteSolution() {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.fillBoard(0, 0, numbers);
    }
    
    fillBoard(row, col, numbers) {
        if (row === 9) return true;
        if (col === 9) return this.fillBoard(row + 1, 0, numbers);
        
        const shuffled = [...numbers].sort(() => Math.random() - 0.5);
        
        for (let num of shuffled) {
            if (this.isValidMove(row, col, num)) {
                this.board[row][col] = num;
                if (this.fillBoard(row, col + 1, numbers)) {
                    return true;
                }
                this.board[row][col] = 0;
            }
        }
        
        return false;
    }
    
    removeNumbers() {
        const difficultySettings = {
            easy: 35,
            medium: 45,
            hard: 55,
            expert: 65
        };
        
        const cellsToRemove = difficultySettings[this.difficulty];
        const positions = [];
        
        // Create array of all positions
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                positions.push([i, j]);
            }
        }
        
        // Shuffle positions
        positions.sort(() => Math.random() - 0.5);
        
        // Remove numbers
        for (let i = 0; i < cellsToRemove; i++) {
            const [row, col] = positions[i];
            this.board[row][col] = 0;
        }
    }
    
    isValidMove(row, col, num) {
        // Check row
        for (let j = 0; j < 9; j++) {
            if (this.board[row][j] === num) return false;
        }
        
        // Check column
        for (let i = 0; i < 9; i++) {
            if (this.board[i][col] === num) return false;
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (this.board[i][j] === num) return false;
            }
        }
        
        return true;
    }
    
    selectCell(row, col) {
        if (!this.gameRunning || this.gamePaused) return;
        if (this.initialBoard[row][col] !== 0) return; // Can't select filled cells
        
        // Remove previous selection
        const prevSelected = this.sudokuGrid.querySelector('.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
        
        // Select new cell
        const cell = this.sudokuGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('selected');
        
        this.selectedCell = { row, col };
        this.updateHighlights();
        this.playSound('select');
    }
    
    enterNumber(num) {
        if (!this.selectedCell || !this.gameRunning || this.gamePaused) return;
        
        const { row, col } = this.selectedCell;
        if (this.initialBoard[row][col] !== 0) return; // Can't modify initial numbers
        
        const previousValue = this.board[row][col];
        this.board[row][col] = num;
        
        this.stats.totalMoves++;
        
        // Check if move is correct
        if (this.solution[row][col] === num) {
            this.stats.correctMoves++;
            this.playSound('correct');
            this.filledCells++;
        } else {
            this.errorCount++;
            this.playSound('error');
            // Remove the incorrect number after a brief moment
            setTimeout(() => {
                this.board[row][col] = 0;
                this.updateBoard();
            }, 500);
        }
        
        this.updateBoard();
        this.updateUI();
        this.updateProgress();
        
        // Check if puzzle is complete
        if (this.isPuzzleComplete()) {
            this.completePuzzle();
        }
    }
    
    clearCell() {
        if (!this.selectedCell || !this.gameRunning || this.gamePaused) return;
        
        const { row, col } = this.selectedCell;
        if (this.initialBoard[row][col] !== 0) return; // Can't clear initial numbers
        
        if (this.board[row][col] !== 0) {
            this.board[row][col] = 0;
            this.filledCells--;
            this.updateBoard();
            this.updateProgress();
            this.playSound('clear');
        }
    }
    
    giveHint() {
        if (!this.hintsEnabled || !this.gameRunning || this.gamePaused) return;
        if (!this.selectedCell) {
            this.updateGameStatus('Selecione uma célula para receber uma dica');
            return;
        }
        
        const { row, col } = this.selectedCell;
        if (this.initialBoard[row][col] !== 0) {
            this.updateGameStatus('Esta célula já está preenchida');
            return;
        }
        
        if (this.board[row][col] !== 0) {
            this.updateGameStatus('Limpe a célula primeiro para receber uma dica');
            return;
        }
        
        this.board[row][col] = this.solution[row][col];
        this.filledCells++;
        this.hintsUsed++;
        
        this.updateBoard();
        this.updateUI();
        this.updateProgress();
        this.playSound('hint');
        
        // Add hint styling
        const cell = this.sudokuGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('hint-cell');
        
        if (this.isPuzzleComplete()) {
            this.completePuzzle();
        }
    }
    
    solvePuzzle() {
        if (!this.gameRunning) return;
        
        // Copy solution to board
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.board[i][j] = this.solution[i][j];
            }
        }
        
        this.updateBoard();
        this.playSound('solve');
        this.updateGameStatus('Puzzle resolvido automaticamente');
        
        // Don't count as completion for achievements
        this.gameRunning = false;
        this.pauseBtn.disabled = true;
        if (this.mobilePauseBtn) {
            this.mobilePauseBtn.disabled = true;
        }
    }
    
    updateBoard() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.sudokuGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const value = this.board[row][col];
                
                cell.textContent = value === 0 ? '' : value;
                
                // Style cells
                cell.className = 'sudoku-cell';
                
                if (this.initialBoard[row][col] !== 0) {
                    cell.classList.add('initial-cell');
                } else if (value !== 0) {
                    cell.classList.add('user-cell');
                }
                
                if (this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col) {
                    cell.classList.add('selected');
                }
                
                // Add error styling for incorrect moves temporarily
                if (value !== 0 && this.solution[row][col] !== value) {
                    cell.classList.add('error-cell');
                }
            }
        }
    }
    
    updateHighlights() {
        if (!this.highlightEnabled || !this.selectedCell) return;
        
        const { row, col } = this.selectedCell;
        const selectedValue = this.board[row][col];
        
        // Clear all highlights
        this.sudokuGrid.querySelectorAll('.highlighted').forEach(cell => {
            cell.classList.remove('highlighted');
        });
        
        // Highlight row, column, and box
        for (let i = 0; i < 9; i++) {
            // Row
            const rowCell = this.sudokuGrid.querySelector(`[data-row="${row}"][data-col="${i}"]`);
            rowCell.classList.add('highlighted');
            
            // Column
            const colCell = this.sudokuGrid.querySelector(`[data-row="${i}"][data-col="${col}"]`);
            colCell.classList.add('highlighted');
        }
        
        // Box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                const boxCell = this.sudokuGrid.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                boxCell.classList.add('highlighted');
            }
        }
        
        // Highlight same numbers
        if (selectedValue !== 0) {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (this.board[i][j] === selectedValue) {
                        const cell = this.sudokuGrid.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                        cell.classList.add('same-number');
                    }
                }
            }
        }
    }
    
    isPuzzleComplete() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j] === 0) return false;
                if (this.board[i][j] !== this.solution[i][j]) return false;
            }
        }
        return true;
    }
    
    completePuzzle() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Update statistics
        this.stats.gamesCompleted++;
        this.stats[this.difficulty + 'Completed']++;
        this.stats.accuracy = Math.round((this.stats.correctMoves / this.stats.totalMoves) * 100) || 100;
        
        // Check for new best time
        let isNewRecord = false;
        if (!this.stats.bestTime || this.gameTime < this.stats.bestTime) {
            this.stats.bestTime = this.gameTime;
            isNewRecord = true;
        }
        
        this.saveStats();
        this.checkAchievements();
        this.playSound('victory');
        this.showVictoryModal(isNewRecord);
        
        // Update UI
        this.pauseBtn.disabled = true;
        if (this.mobilePauseBtn) {
            this.mobilePauseBtn.disabled = true;
        }
        this.updateGameStatus('Puzzle completado!');
    }
    
    newGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameStartTime = Date.now();
        this.gameTime = 0;
        this.errorCount = 0;
        this.hintsUsed = 0;
        this.filledCells = 0;
        this.selectedCell = null;
        
        this.generatePuzzle();
        this.updateBoard();
        this.updateUI();
        this.updateProgress();
        this.closeAllModals();
        
        this.pauseBtn.disabled = false;
        if (this.mobilePauseBtn) {
            this.mobilePauseBtn.disabled = false;
        }
        
        this.updateGameStatus('Boa sorte! Resolva o sudoku');
        this.playSound('start');
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameTime = 0;
        this.errorCount = 0;
        this.hintsUsed = 0;
        this.filledCells = 0;
        this.selectedCell = null;
        
        // Clear board
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.initialBoard = Array(9).fill().map(() => Array(9).fill(0));
        
        this.updateBoard();
        this.updateUI();
        this.updateProgress();
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
            this.updateGameStatus('Continue resolvendo...');
            this.closeAllModals();
        }
        
        this.updateButtonText();
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
    
    updateUI() {
        this.gameTimeElement.textContent = this.formatTime(this.gameTime);
        this.bestTimeElement.textContent = this.stats.bestTime ? this.formatTime(this.stats.bestTime) : '--:--';
        this.currentDifficultyElement.textContent = this.difficulty.toUpperCase();
        this.errorCountElement.textContent = this.errorCount;
        
        // Update statistics
        if (this.gamesCompletedElement) {
            this.gamesCompletedElement.textContent = this.stats.gamesCompleted;
        }
        if (this.personalBestElement) {
            this.personalBestElement.textContent = this.stats.bestTime ? this.formatTime(this.stats.bestTime) : '--:--';
        }
        if (this.accuracyElement) {
            this.accuracyElement.textContent = this.stats.accuracy + '%';
        }
        if (this.hintsUsedElement) {
            this.hintsUsedElement.textContent = this.hintsUsed;
        }
        
        // Update difficulty counts
        if (this.easyCountElement) {
            this.easyCountElement.textContent = this.stats.easyCompleted || 0;
        }
        if (this.mediumCountElement) {
            this.mediumCountElement.textContent = this.stats.mediumCompleted || 0;
        }
        if (this.hardCountElement) {
            this.hardCountElement.textContent = this.stats.hardCompleted || 0;
        }
        if (this.expertCountElement) {
            this.expertCountElement.textContent = this.stats.expertCompleted || 0;
        }
    }
    
    updateProgress() {
        const totalCells = 81;
        const filledCells = this.countFilledCells();
        const percentage = Math.round((filledCells / totalCells) * 100);
        
        if (this.progressFill) {
            this.progressFill.style.width = percentage + '%';
        }
        if (this.progressText) {
            this.progressText.textContent = `${filledCells}/${totalCells}`;
        }
    }
    
    countFilledCells() {
        let count = 0;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j] !== 0) count++;
            }
        }
        return count;
    }
    
    updateGameStatus(message) {
        this.gameStatusElement.textContent = message;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    startTimer() {
        setInterval(() => {
            if (this.gameRunning && !this.gamePaused) {
                this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
                this.updateUI();
            }
        }, 1000);
    }
    
    handleKeyPress(e) {
        switch(e.key) {
            case '1': case '2': case '3': case '4': case '5':
            case '6': case '7': case '8': case '9':
                e.preventDefault();
                this.enterNumber(parseInt(e.key));
                break;
            case '0':
            case 'Delete':
            case 'Backspace':
            case 'Escape':
                e.preventDefault();
                this.clearCell();
                break;
            case ' ':
                e.preventDefault();
                if (this.gameRunning) {
                    this.togglePause();
                } else {
                    this.newGame();
                }
                break;
            case 'h':
            case 'H':
                e.preventDefault();
                this.giveHint();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                this.resetGame();
                break;
            case 'n':
            case 'N':
                e.preventDefault();
                this.newGame();
                break;
        }
    }
    
    checkAchievements() {
        const newAchievements = [];
        
        // First Sudoku
        if (!this.achievements.firstSudoku.unlocked && this.stats.gamesCompleted >= 1) {
            this.achievements.firstSudoku.unlocked = true;
            newAchievements.push('firstSudoku');
        }
        
        // Speedster
        if (!this.achievements.speedster.unlocked && this.gameTime < 300) {
            this.achievements.speedster.unlocked = true;
            newAchievements.push('speedster');
        }
        
        // Perfectionist
        if (!this.achievements.perfectionist.unlocked && this.errorCount === 0) {
            this.achievements.perfectionist.unlocked = true;
            newAchievements.push('perfectionist');
        }
        
        // Master
        if (!this.achievements.master.unlocked && this.difficulty === 'expert') {
            this.achievements.master.unlocked = true;
            newAchievements.push('master');
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
            firstSudoku: '🥇',
            speedster: '⚡',
            perfectionist: '🎯',
            master: '🧠'
        };
        return icons[key] || '🏆';
    }
    
    showVictoryModal(isNewRecord) {
        this.finalTimeElement.textContent = this.formatTime(this.gameTime);
        this.finalDifficultyElement.textContent = this.difficulty.toUpperCase();
        this.finalErrorsElement.textContent = this.errorCount;
        this.newRecordElement.style.display = isNewRecord ? 'block' : 'none';
        
        // Clear previous achievements
        this.achievementsEarnedElement.innerHTML = '';
        
        this.victoryModal.style.display = 'block';
    }
    
    showPauseMenu() {
        this.pauseTimeElement.textContent = this.formatTime(this.gameTime);
        this.pauseDifficultyElement.textContent = this.difficulty.toUpperCase();
        this.pauseProgressElement.textContent = `${this.countFilledCells()}/81`;
        this.pauseMenu.style.display = 'block';
    }
    
    closeAllModals() {
        this.victoryModal.style.display = 'none';
        this.pauseMenu.style.display = 'none';
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
                    break;
                case 'correct':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
                    break;
                case 'error':
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
                    break;
                case 'clear':
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                    break;
                case 'hint':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.2);
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
                case 'solve':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.4);
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
    
    loadStats() {
        // In a real environment, this would use localStorage
        // const saved = localStorage.getItem('sudokuStats');
        // if (saved) {
        //     this.stats = { ...this.stats, ...JSON.parse(saved) };
        // }
    }
    
    saveStats() {
        // In a real environment, this would use localStorage
        // localStorage.setItem('sudokuStats', JSON.stringify(this.stats));
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
    const game = new SudokuGame();
    
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
    
    console.log('🧩 Sudoku Game - Desktop Edition');
    console.log('Controles:');
    if (game.isMobile) {
        console.log('  Toque: Selecione células e use o teclado numérico');
    } else {
        console.log('  Click: Selecionar célula');
        console.log('  1-9: Inserir números');
        console.log('  ESC/Delete: Limpar célula');
        console.log('  ESPAÇO: Pausar/Continuar');
        console.log('  H: Dica');
        console.log('  N: Novo jogo');
        console.log('  R: Reiniciar');
    }
});