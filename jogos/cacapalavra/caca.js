class WordSearchGame {
    constructor() {
        // Game state
        this.gridSize = 15;
        this.grid = [];
        this.words = [];
        this.foundWords = [];
        this.selectedCells = [];
        this.isSelecting = false;
        this.startCell = null;
        this.endCell = null;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameStartTime = 0;
        this.gameTime = 0;
        this.hintsUsed = 0;
        this.wordLines = []; // Store visual lines for found words
        
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
            totalAttempts: 0,
            correctAttempts: 0,
            easyCompleted: 0,
            mediumCompleted: 0,
            hardCompleted: 0,
            expertCompleted: 0
        };
        
        // Achievements
        this.achievements = {
            firstWord: { unlocked: false, name: 'Primeira Palavra', desc: 'Complete seu primeiro caça palavras' },
            speedster: { unlocked: false, name: 'Velocista', desc: 'Complete em menos de 3 minutos' },
            perfectionist: { unlocked: false, name: 'Perfeccionista', desc: 'Complete sem usar dicas' },
            master: { unlocked: false, name: 'Mestre', desc: 'Complete nível Expert' }
        };
        
        // Expanded word lists with more Brazilian Portuguese words
        this.wordLists = {
            easy: [
                'CASA', 'GATO', 'SOL', 'LUA', 'MAR', 'RIO', 'CÉU', 'PAZ', 'AMOR', 'VIDA',
                'FLOR', 'ÁGUA', 'FOGO', 'TERRA', 'VENTO', 'CHUVA', 'NEVE', 'LAGO',
                'PEIXE', 'PÁSSARO', 'ÁRVORE', 'FOLHA', 'ROSA', 'NOITE', 'DIA', 'MÃE',
                'PAI', 'FILHO', 'LIVRO', 'MESA', 'PORTA', 'JANELA', 'CAMA', 'SOFÁ',
                'BOLA', 'JOGO', 'FESTA', 'DOCE', 'PÃO', 'LEITE', 'CAFÉ', 'CHÁ',
                'VERDE', 'AZUL', 'BRANCO', 'PRETO', 'ROXO', 'OURO', 'PRATA', 'FERRO'
            ],
            medium: [
                'CACHORRO', 'ESTRELA', 'MONTANHA', 'OCEANO', 'FLORESTA', 'JARDIM', 'LIBERDADE', 'AMIZADE',
                'FELICIDADE', 'NATUREZA', 'PAISAGEM', 'AVENTURA', 'VIAGEM', 'ESCOLA', 'TRABALHO',
                'FAMÍLIA', 'MÚSICA', 'DANÇA', 'TEATRO', 'CINEMA', 'PINTURA', 'ESCULTURA',
                'HISTÓRIA', 'CIÊNCIA', 'MATEMÁTICA', 'PORTUGUÊS', 'GEOGRAFIA', 'BIOLOGIA',
                'QUÍMICA', 'FÍSICA', 'ESPORTE', 'FUTEBOL', 'BASQUETE', 'VÔLEI', 'NATAÇÃO',
                'CORRIDA', 'BICICLETA', 'CARRO', 'AVIÃO', 'TREM', 'BARCO', 'ÔNIBUS',
                'HOSPITAL', 'MÉDICO', 'ENFERMEIRO', 'FARMÁCIA', 'REMÉDIO', 'SAÚDE',
                'EDUCAÇÃO', 'PROFESSOR', 'ALUNO', 'UNIVERSIDADE', 'FACULDADE', 'FORMATURA'
            ],
            hard: [
                'COMPUTADOR', 'TECNOLOGIA', 'PROGRAMAÇÃO', 'INTERNET', 'SMARTPHONE', 'NOTEBOOK',
                'ELEFANTE', 'GIRAFA', 'RINOCERONTE', 'HIPOPÓTAMO', 'CROCODILO', 'LEOPARDO',
                'REFRIGERADOR', 'MICROONDAS', 'ASPIRADOR', 'LIQUIDIFICADOR', 'BATEDEIRA',
                'BICICLETA', 'MOTOCICLETA', 'AUTOMÓVEL', 'CAMINHÃO', 'HELICÓPTERO',
                'ASTRONAUTA', 'TELESCÓPIO', 'MICROSCÓPIO', 'LABORATÓRIO', 'EXPERIMENTO',
                'ARQUEOLOGIA', 'PALEONTOLOGIA', 'ANTROPOLOGIA', 'SOCIOLOGIA', 'PSICOLOGIA',
                'ENGENHARIA', 'ARQUITETURA', 'CONSTRUÇÃO', 'PROJETO', 'PLANEJAMENTO',
                'MEDICINA', 'CIRURGIA', 'DIAGNÓSTICO', 'TRATAMENTO', 'PREVENÇÃO',
                'FILOSOFIA', 'LITERATURA', 'POESIA', 'ROMANCE', 'CRÔNICA',
                'DEMOCRACIA', 'CONSTITUIÇÃO', 'CIDADANIA', 'REPÚBLICA', 'FEDERAÇÃO',
                'ECONOMIA', 'AGRICULTURA', 'INDÚSTRIA', 'COMÉRCIO', 'TURISMO',
                'ECOLOGIA', 'SUSTENTABILIDADE', 'BIODIVERSIDADE', 'CONSERVAÇÃO'
            ],
            expert: [
                'EXTRAORDINÁRIO', 'PARALELEPÍPEDO', 'OTORRINOLARINGOLOGISTA', 'PNEUMOULTRAMICROSCÓPICO',
                'ANTICONSTITUCIONALMENTE', 'INCONSTITUCIONALISSIMAMENTE', 'CONTRARREVOLUCIONÁRIO',
                'PNEUMATÓLOGO', 'GASTROENTEROLOGIA', 'OFTALMOLOGISTA', 'DERMATOLOGISTA',
                'CARDIOLOGISTA', 'NEUROLOGISTA', 'ENDOCRINOLOGISTA', 'REUMATOLOGISTA',
                'OTORRINOLARINGOLOGIA', 'ANESTESIOLOGISTA', 'GINECOLOGISTA', 'UROLOGISTA',
                'PNEUMOENCEFALOGRAFIA', 'ELETROENCEFALOGRAMA', 'ELETROCARDIOGRAMA',
                'RADIOIMUNOELETROFORESE', 'ESPECTROFOTOMETRIA', 'CROMATOGRAFIA',
                'DESOXIRRIBONUCLEICO', 'RIBONUCLEOPROTEÍNA', 'FOSFATIDILETANOLAMINA',
                'NEUROTRANSMISSORES', 'ACETILCOLINESTERASE', 'IMUNOGLOBULINAS',
                'FOTOSSÍNTESE', 'QUIMIOSSÍNTESE', 'BIOLUMINESCÊNCIA',
                'TERMODINÂMICA', 'ELETROMAGNETISMO', 'MECÂNICA', 'RELATIVIDADE',
                'SUPERCONDUTIVIDADE', 'RADIOATIVIDADE', 'ESPECTROSCOPIA',
                'CRISTALOGRAFIA', 'ESPECTROMETRIA', 'MAGNETORESSONÂNCIA',
                'ANTROPOGEOGRAFIA', 'PALEOCLIMATOLOGIA', 'BIOGEOQUÍMICA',
                'PSICONEUROIMUNOLOGIA', 'NEUROPSICOFARMACOLOGIA', 'PSICOFARMACOLOGIA'
            ]
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
        this.updateGridSize();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
               window.innerWidth <= 768;
    }
    
    updateGridSize() {
        const sizes = {
            easy: 10,
            medium: 12,
            hard: 15,
            expert: 20
        };
        
        if (this.isMobile) {
            this.gridSize = Math.max(8, sizes[this.difficulty] - 3);
        } else {
            this.gridSize = sizes[this.difficulty];
        }
        
        // Ajustar tamanho das células para expert
        if (this.difficulty === 'expert') {
            document.documentElement.style.setProperty('--expert-cell-size', this.isMobile ? '0.6rem' : '0.8rem');
        } else {
            document.documentElement.style.setProperty('--expert-cell-size', this.isMobile ? '0.7rem' : '1rem');
        }
    }
    
    initializeElements() {
        // Stats elements
        this.gameTimeElement = document.getElementById('gameTime');
        this.bestTimeElement = document.getElementById('bestTime');
        this.currentDifficultyElement = document.getElementById('currentDifficulty');
        this.wordsFoundElement = document.getElementById('wordsFound');
        this.gameStatusElement = document.getElementById('gameStatus');
        
        // Control buttons
        this.newGameBtn = document.getElementById('newGameBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
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
        this.wordSearchGrid = document.getElementById('wordSearchGrid');
        this.mobileControls = document.getElementById('mobileControls');
        this.wordsListElement = document.getElementById('wordsList');
        
        // Progress elements
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // Words section elements
        this.wordsCounterText = document.getElementById('wordsCounterText');
        this.wordsProgressFill = document.getElementById('wordsProgressFill');
        
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
        this.finalWordsElement = document.getElementById('finalWords');
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
        if (this.newGameBtn) this.newGameBtn.addEventListener('click', () => this.newGame());
        if (this.pauseBtn) this.pauseBtn.addEventListener('click', () => this.togglePause());
        if (this.resetBtn) this.resetBtn.addEventListener('click', () => this.resetGame());
        if (this.hintBtn) this.hintBtn.addEventListener('click', () => this.giveHint());
        
        // Mobile buttons
        if (this.mobileNewGameBtn) this.mobileNewGameBtn.addEventListener('click', () => this.newGame());
        if (this.mobilePauseBtn) this.mobilePauseBtn.addEventListener('click', () => this.togglePause());
        if (this.mobileResetBtn) this.mobileResetBtn.addEventListener('click', () => this.resetGame());
        if (this.mobileHintBtn) this.mobileHintBtn.addEventListener('click', () => this.giveHint());
        
        // Settings
        if (this.soundToggle) {
            this.soundToggle.addEventListener('change', (e) => {
                this.soundEnabled = e.target.checked;
            });
        }
        
        if (this.highlightToggle) {
            this.highlightToggle.addEventListener('change', (e) => {
                this.highlightEnabled = e.target.checked;
            });
        }
        
        if (this.difficultySelect) {
            this.difficultySelect.addEventListener('change', (e) => {
                this.difficulty = e.target.value;
                this.updateGridSize();
                this.updateUI();
            });
        }
        
        if (this.hintsToggle) {
            this.hintsToggle.addEventListener('change', (e) => {
                this.hintsEnabled = e.target.checked;
                if (this.hintBtn) this.hintBtn.disabled = !e.target.checked;
                if (this.mobileHintBtn) this.mobileHintBtn.disabled = !e.target.checked;
            });
        }
        
        // Modal controls
        if (this.playAgainBtn) this.playAgainBtn.addEventListener('click', () => this.newGame());
        if (this.mainMenuBtn) this.mainMenuBtn.addEventListener('click', () => this.resetGame());
        if (this.resumeBtn) this.resumeBtn.addEventListener('click', () => this.togglePause());
        if (this.pauseResetBtn) this.pauseResetBtn.addEventListener('click', () => this.resetGame());
        if (this.modalClose) this.modalClose.addEventListener('click', () => this.closeAllModals());
        
        // Modal click outside to close
        if (this.victoryModal) {
            this.victoryModal.addEventListener('click', (e) => {
                if (e.target === this.victoryModal) this.closeAllModals();
            });
        }
        
        if (this.pauseMenu) {
            this.pauseMenu.addEventListener('click', (e) => {
                if (e.target === this.pauseMenu) this.togglePause();
            });
        }
        
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
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    createGrid() {
        if (!this.wordSearchGrid) return;
        
        this.wordSearchGrid.innerHTML = '';
        this.wordSearchGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        this.wordSearchGrid.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;
        
        // Ajustar tamanho do grid para expert
        if (this.difficulty === 'expert') {
            this.wordSearchGrid.style.width = this.isMobile ? 
                'min(380px, calc(100vw - 20px))' : 
                'min(600px, calc(100vh - 200px))';
            this.wordSearchGrid.style.height = this.isMobile ? 
                'min(380px, calc(100vh - 140px))' : 
                'min(600px, calc(100vh - 200px))';
        } else {
            this.wordSearchGrid.style.width = this.isMobile ? 
                'min(300px, calc(100vw - 20px))' : 
                'min(500px, calc(100vh - 200px))';
            this.wordSearchGrid.style.height = this.isMobile ? 
                'min(300px, calc(100vh - 140px))' : 
                'min(500px, calc(100vh - 200px))';
        }
        
        // Clear any existing word lines
        this.clearWordLines();
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Ajustar tamanho da fonte para expert
                if (this.difficulty === 'expert') {
                    cell.style.fontSize = this.isMobile ? '0.6rem' : '0.8rem';
                } else {
                    cell.style.fontSize = '';
                }
                
                // Mouse events
                cell.addEventListener('mousedown', (e) => this.startSelection(row, col, e));
                cell.addEventListener('mouseenter', (e) => this.continueSelection(row, col, e));
                cell.addEventListener('mouseup', (e) => this.endSelection(row, col, e));
                
                // Touch events
                cell.addEventListener('touchstart', (e) => this.startSelection(row, col, e));
                cell.addEventListener('touchmove', (e) => this.handleTouchMove(e));
                cell.addEventListener('touchend', (e) => this.handleTouchEnd(e));
                
                this.wordSearchGrid.appendChild(cell);
            }
        }
        
        // Prevent text selection and context menu
        this.wordSearchGrid.addEventListener('selectstart', (e) => e.preventDefault());
        this.wordSearchGrid.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Global mouse up event
        document.addEventListener('mouseup', () => this.globalEndSelection());
    }
    
    generatePuzzle() {
        if (!this.wordSearchGrid) return;
        
        this.wordSearchGrid.classList.add('loading');
        
        // Initialize empty grid
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(''));
        this.words = [];
        this.foundWords = [];
        this.wordLines = [];
        
        // Select words based on difficulty with randomization
        const wordList = this.shuffleArray(this.wordLists[this.difficulty]);
        let numWords;
        
        // Ajustar número de palavras baseado na dificuldade e tamanho da tela
        switch (this.difficulty) {
            case 'easy':
                numWords = this.isMobile ? 6 : 8;
                break;
            case 'medium':
                numWords = this.isMobile ? 8 : 10;
                break;
            case 'hard':
                numWords = this.isMobile ? 8 : 12;
                break;
            case 'expert':
                numWords = this.isMobile ? 6 : 10;
                break;
            default:
                numWords = 8;
        }
        
        numWords = Math.min(numWords, wordList.length);
        
        // Randomly select words ensuring different words each game
        const selectedWords = wordList.slice(0, numWords);
        
        // Place words in grid with improved placement algorithm
        selectedWords.forEach(word => {
            this.placeWordInGrid(word);
        });
        
        // Fill empty cells with random letters
        this.fillEmptyCells();
        
        // Update words list display
        this.updateWordsList();
        
        setTimeout(() => {
            if (this.wordSearchGrid) {
                this.wordSearchGrid.classList.remove('loading');
            }
        }, 500);
    }
    
    placeWordInGrid(word) {
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal down-right
            [1, -1],  // diagonal down-left
            [0, -1],  // horizontal backwards
            [-1, 0],  // vertical backwards
            [-1, -1], // diagonal up-left
            [-1, 1]   // diagonal up-right
        ];
        
        let placed = false;
        let attempts = 0;
        const maxAttempts = 500; // Increased attempts for better placement
        
        while (!placed && attempts < maxAttempts) {
            const direction = directions[Math.floor(Math.random() * directions.length)];
            const [dx, dy] = direction;
            
            // Find a random starting position with better spacing
            const margin = Math.max(1, Math.floor(this.gridSize * 0.1));
            const startRow = margin + Math.floor(Math.random() * (this.gridSize - 2 * margin));
            const startCol = margin + Math.floor(Math.random() * (this.gridSize - 2 * margin));
            
            // Check if word fits
            if (this.canPlaceWord(word, startRow, startCol, dx, dy)) {
                // Place the word
                for (let i = 0; i < word.length; i++) {
                    const row = startRow + dx * i;
                    const col = startCol + dy * i;
                    this.grid[row][col] = word[i];
                }
                
                // Store word info
                this.words.push({
                    word: word,
                    startRow: startRow,
                    startCol: startCol,
                    endRow: startRow + dx * (word.length - 1),
                    endCol: startCol + dy * (word.length - 1),
                    direction: direction,
                    found: false
                });
                
                placed = true;
            }
            
            attempts++;
        }
        
        if (!placed) {
            console.warn(`Could not place word: ${word}`);
            // Try to place a shorter version of the word if possible
            if (word.length > 4) {
                this.placeWordInGrid(word.substring(0, Math.max(4, word.length - 3)));
            }
        }
    }
    
    canPlaceWord(word, startRow, startCol, dx, dy) {
        // Check if word fits within grid bounds
        const endRow = startRow + dx * (word.length - 1);
        const endCol = startCol + dy * (word.length - 1);
        
        if (endRow < 0 || endRow >= this.gridSize || endCol < 0 || endCol >= this.gridSize) {
            return false;
        }
        
        // Check if cells are empty or contain the same letter
        for (let i = 0; i < word.length; i++) {
            const row = startRow + dx * i;
            const col = startCol + dy * i;
            const currentCell = this.grid[row][col];
            
            if (currentCell !== '' && currentCell !== word[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    fillEmptyCells() {
        // Use weighted letter frequency for Portuguese
        const letters = 'AAAAAEEEEEIIIIOOOOUUUBCDFFGHJKLMNPQRSTVWXYZ';
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === '') {
                    this.grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }
    
    updateGrid() {
        if (!this.wordSearchGrid) return;
        
        const cells = this.wordSearchGrid.querySelectorAll('.grid-cell');
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / this.gridSize);
            const col = index % this.gridSize;
            
            if (this.grid[row] && this.grid[row][col] !== undefined) {
                cell.textContent = this.grid[row][col];
                
                // Reset cell classes
                cell.className = 'grid-cell';
                
                // Add letter appearance animation
                cell.classList.add('new-letter');
                setTimeout(() => {
                    cell.classList.remove('new-letter');
                }, 500);
                
                // Mark found cells
                if (this.isCellInFoundWord(row, col)) {
                    cell.classList.add('found');
                }
            }
        });
        
        // Redraw word lines for found words
        this.drawWordLines();
    }
    
    isCellInFoundWord(row, col) {
        return this.foundWords.some(wordInfo => {
            const { startRow, startCol, direction, word } = wordInfo;
            const [dx, dy] = direction;
            
            for (let i = 0; i < word.length; i++) {
                const wordRow = startRow + dx * i;
                const wordCol = startCol + dy * i;
                
                if (wordRow === row && wordCol === col) {
                    return true;
                }
            }
            
            return false;
        });
    }
    
    clearWordLines() {
        this.wordLines.forEach(line => {
            if (line.parentNode) {
                line.parentNode.removeChild(line);
            }
        });
        this.wordLines = [];
    }
    
    drawWordLines() {
        this.clearWordLines();
        
        this.foundWords.forEach(wordInfo => {
            this.createWordLine(wordInfo);
        });
    }
    
    createWordLine(wordInfo) {
        if (!this.wordSearchGrid) return;
        
        const { startRow, startCol, endRow, endCol } = wordInfo;
        
        const startCell = this.wordSearchGrid.querySelector(`[data-row="${startRow}"][data-col="${startCol}"]`);
        const endCell = this.wordSearchGrid.querySelector(`[data-row="${endRow}"][data-col="${endCol}"]`);
        
        if (!startCell || !endCell) return;
        
        const gridRect = this.wordSearchGrid.getBoundingClientRect();
        const startRect = startCell.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();
        
        // Calculate relative positions
        const startX = startRect.left - gridRect.left + startRect.width / 2;
        const startY = startRect.top - gridRect.top + startRect.height / 2;
        const endX = endRect.left - gridRect.left + endRect.width / 2;
        const endY = endRect.top - gridRect.top + endRect.height / 2;
        
        // Calculate line properties
        const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
        
        // Create line element
        const line = document.createElement('div');
        line.className = 'word-line';
        line.style.cssText = `
            position: absolute;
            left: ${startX}px;
            top: ${startY}px;
            width: ${length}px;
            height: 4px;
            transform: rotate(${angle}deg);
            transform-origin: 0 50%;
            pointer-events: none;
            z-index: 3;
        `;
        
        this.wordSearchGrid.appendChild(line);
        this.wordLines.push(line);
    }
    
    startSelection(row, col, event) {
        if (!this.gameRunning || this.gamePaused) return;
        
        event.preventDefault();
        this.isSelecting = true;
        this.startCell = { row, col };
        this.selectedCells = [{ row, col }];
        
        this.updateSelection();
        this.playSound('select');
        
        // Add visual feedback for start cell
        const cell = this.wordSearchGrid?.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('selecting-start');
        }
    }
    
    continueSelection(row, col, event) {
        if (!this.isSelecting || !this.gameRunning || this.gamePaused) return;
        
        event.preventDefault();
        this.endCell = { row, col };
        
        // Calculate selection path
        this.selectedCells = this.calculateSelectionPath(this.startCell, this.endCell);
        this.updateSelection();
        
        // Add visual feedback for end cell
        const cells = this.wordSearchGrid?.querySelectorAll('.grid-cell') || [];
        cells.forEach(cell => {
            cell.classList.remove('selecting-end');
        });
        
        const endCell = this.wordSearchGrid?.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (endCell && this.selectedCells.length > 1) {endCell.classList.add('selecting-end');
        }
    }
    
    endSelection(row, col, event) {
        if (!this.isSelecting || !this.gameRunning || this.gamePaused) return;
        
        event.preventDefault();
        this.endCell = { row, col };
        this.isSelecting = false;
        
        // Check if selection forms a valid word
        this.checkSelection();
        
        // Remove selection visual feedback
        const cells = this.wordSearchGrid?.querySelectorAll('.grid-cell') || [];
        cells.forEach(cell => {
            cell.classList.remove('selecting-start', 'selecting-end');
        });
    }
    
    globalEndSelection() {
        if (this.isSelecting) {
            this.isSelecting = false;
            this.checkSelection();
            
            // Remove selection visual feedback
            const cells = this.wordSearchGrid?.querySelectorAll('.grid-cell') || [];
            cells.forEach(cell => {
                cell.classList.remove('selecting-start', 'selecting-end');
            });
        }
    }
    
    handleTouchMove(event) {
        if (!this.isSelecting) return;
        
        event.preventDefault();
        const touch = event.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && element.classList.contains('grid-cell')) {
            const row = parseInt(element.dataset.row);
            const col = parseInt(element.dataset.col);
            this.continueSelection(row, col, event);
        }
    }
    
    handleTouchEnd(event) {
        if (!this.isSelecting) return;
        
        event.preventDefault();
        this.endSelection(this.endCell?.row || this.startCell.row, this.endCell?.col || this.startCell.col, event);
    }
    
    calculateSelectionPath(start, end) {
        if (!start || !end) return [start].filter(Boolean);
        
        const path = [];
        const dx = end.row - start.row;
        const dy = end.col - start.col;
        
        // Check if selection is in a valid direction (horizontal, vertical, or diagonal)
        if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
            const steps = Math.max(Math.abs(dx), Math.abs(dy));
            const stepX = steps === 0 ? 0 : dx / steps;
            const stepY = steps === 0 ? 0 : dy / steps;
            
            for (let i = 0; i <= steps; i++) {
                const row = start.row + Math.round(stepX * i);
                const col = start.col + Math.round(stepY * i);
                
                if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
                    path.push({ row, col });
                }
            }
        } else {
            // Invalid direction, just return start cell
            path.push(start);
        }
        
        return path;
    }
    
    updateSelection() {
        if (!this.wordSearchGrid) return;
        
        // Clear previous selection
        const cells = this.wordSearchGrid.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.classList.remove('selected', 'selecting');
        });
        
        // Highlight selected cells
        this.selectedCells.forEach(({ row, col }) => {
            const cell = this.wordSearchGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('selecting');
            }
        });
    }
    
    checkSelection() {
        if (this.selectedCells.length < 2) {
            this.clearSelection();
            return;
        }
        
        // Get selected word
        const selectedWord = this.selectedCells.map(({ row, col }) => this.grid[row][col]).join('');
        const reverseWord = selectedWord.split('').reverse().join('');
        
        // Check if selected word matches any unfound words
        const foundWordInfo = this.words.find(wordInfo => 
            !wordInfo.found && (wordInfo.word === selectedWord || wordInfo.word === reverseWord)
        );
        
        this.stats.totalAttempts++;
        
        if (foundWordInfo) {
            // Word found!
            foundWordInfo.found = true;
            this.foundWords.push(foundWordInfo);
            this.stats.correctAttempts++;
            
            this.playSound('correct');
            this.updateWordsList();
            this.updateProgress();
            this.createWordFoundEffect(this.selectedCells);
            this.createWordLine(foundWordInfo);
            this.createSuccessRipple();
            
            // Update words counter
            this.updateWordsCounter();
            
            // Check if all words are found
            if (this.foundWords.length === this.words.length) {
                setTimeout(() => {
                    this.completePuzzle();
                }, 1000);
            }
        } else {
            // Invalid selection
            this.playSound('error');
            this.createInvalidSelectionEffect();
        }
        
        this.clearSelection();
        this.updateUI();
    }
    
    createSuccessRipple() {
        if (this.selectedCells.length === 0) return;
        
        const middleIndex = Math.floor(this.selectedCells.length / 2);
        const middleCell = this.selectedCells[middleIndex];
        const cellElement = this.wordSearchGrid?.querySelector(`[data-row="${middleCell.row}"][data-col="${middleCell.col}"]`);
        
        if (!cellElement) return;
        
        const rect = cellElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const ripple = document.createElement('div');
        ripple.className = 'success-ripple';
        ripple.style.cssText = `
            position: fixed;
            left: ${centerX}px;
            top: ${centerY}px;
            width: 0;
            height: 0;
            margin-left: 0;
            margin-top: 0;
            border: 2px solid var(--success-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    clearSelection() {
        this.selectedCells = [];
        this.startCell = null;
        this.endCell = null;
        this.isSelecting = false;
        
        const cells = this.wordSearchGrid?.querySelectorAll('.grid-cell') || [];
        cells.forEach(cell => {
            cell.classList.remove('selected', 'selecting', 'selecting-start', 'selecting-end');
        });
    }
    
    createWordFoundEffect(cells) {
        cells.forEach((cellPos, index) => {
            setTimeout(() => {
                const cell = this.wordSearchGrid?.querySelector(`[data-row="${cellPos.row}"][data-col="${cellPos.col}"]`);
                if (cell) {
                    cell.classList.add('word-found');
                    
                    // Create particle effect
                    this.createParticleEffect(cell);
                    
                    // Add floating score
                    this.createFloatingScore(cell, '+100');
                }
            }, index * 50);
        });
    }
    
    createFloatingScore(cell, score) {
        const rect = cell.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const scoreElement = document.createElement('div');
        scoreElement.className = 'floating-score';
        scoreElement.textContent = score;
        scoreElement.style.cssText = `
            position: fixed;
            left: ${centerX}px;
            top: ${centerY}px;
            color: var(--success-color);
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            font-size: 1.2rem;
            pointer-events: none;
            z-index: 1000;
            transform: translateX(-50%) translateY(-50%);
        `;
        
        document.body.appendChild(scoreElement);
        
        // Remove score after animation
        setTimeout(() => {
            if (scoreElement.parentNode) {
                scoreElement.parentNode.removeChild(scoreElement);
            }
        }, 1000);
    }
    
    createInvalidSelectionEffect() {
        this.selectedCells.forEach(cellPos => {
            const cell = this.wordSearchGrid?.querySelector(`[data-row="${cellPos.row}"][data-col="${cellPos.col}"]`);
            if (cell) {
                cell.classList.add('invalid-selection');
                setTimeout(() => {
                    cell.classList.remove('invalid-selection');
                }, 300);
            }
        });
    }
    
    createParticleEffect(cell) {
        const rect = cell.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.cssText = `
                    position: fixed;
                    left: ${centerX}px;
                    top: ${centerY}px;
                    width: 4px;
                    height: 4px;
                    background: var(--success-color);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1000;
                `;
                
                document.body.appendChild(particle);
                
                // Remove particle after animation
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 1000);
            }, i * 50);
        }
    }
    
    giveHint() {
        if (!this.hintsEnabled || !this.gameRunning || this.gamePaused) return;
        
        // Find first unfound word
        const unfoundWord = this.words.find(wordInfo => !wordInfo.found);
        
        if (!unfoundWord) {
            this.updateGameStatus('Todas as palavras já foram encontradas!');
            return;
        }
        
        this.hintsUsed++;
        
        // Highlight first letter of the word with enhanced effect
        const startRow = unfoundWord.startRow;
        const startCol = unfoundWord.startCol;
        
        const cell = this.wordSearchGrid?.querySelector(`[data-row="${startRow}"][data-col="${startCol}"]`);
        if (cell) {
            cell.classList.add('hint-glow');
            setTimeout(() => {
                cell.classList.remove('hint-glow');
            }, 3000);
            
            // Also highlight the word in the words list
            this.highlightWordInList(unfoundWord.word);
        }
        
        this.updateGameStatus(`Dica: Procure por "${unfoundWord.word}" (${unfoundWord.word.length} letras)`);
        this.playSound('hint');
        this.updateUI();
    }
    
    highlightWordInList(word) {
        if (!this.wordsListElement) return;
        
        const wordItems = this.wordsListElement.querySelectorAll('.word-item');
        wordItems.forEach(item => {
            const wordText = item.querySelector('.word-text');
            if (wordText && wordText.textContent === word) {
                item.classList.add('hint');
                setTimeout(() => {
                    item.classList.remove('hint');
                }, 3000);
            }
        });
    }
    
    updateWordsList() {
        if (!this.wordsListElement) return;
        
        this.wordsListElement.innerHTML = '';
        
        this.words.forEach(wordInfo => {
            const wordElement = document.createElement('div');
            wordElement.className = `word-item ${wordInfo.found ? 'found' : ''}`;
            
            wordElement.innerHTML = `
                <span class="word-text">${wordInfo.word}</span>
                <span class="word-status">${wordInfo.found ? '✓' : '○'}</span>
            `;
            
            // Add click event to highlight word location (for hints)
            if (!wordInfo.found) {
                wordElement.style.cursor = 'pointer';
                wordElement.addEventListener('click', () => {
                    if (this.hintsEnabled && this.gameRunning && !this.gamePaused) {
                        this.giveHint();
                    }
                });
            }
            
            this.wordsListElement.appendChild(wordElement);
        });
    }
    
    updateWordsCounter() {
        const totalWords = this.words.length;
        const foundWords = this.foundWords.length;
        
        if (this.wordsCounterText) {
            this.wordsCounterText.textContent = `${foundWords}/${totalWords} palavras encontradas`;
        }
        
        if (this.wordsProgressFill) {
            const percentage = totalWords > 0 ? (foundWords / totalWords) * 100 : 0;
            this.wordsProgressFill.style.width = percentage + '%';
        }
    }
    
    updateProgress() {
        const totalWords = this.words.length;
        const foundWords = this.foundWords.length;
        const percentage = totalWords > 0 ? Math.round((foundWords / totalWords) * 100) : 0;
        
        if (this.progressFill) {
            this.progressFill.style.width = percentage + '%';
        }
        if (this.progressText) {
            this.progressText.textContent = `${foundWords}/${totalWords}`;
        }
        
        // Update words counter as well
        this.updateWordsCounter();
    }
    
    newGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameStartTime = Date.now();
        this.gameTime = 0;
        this.hintsUsed = 0;
        this.foundWords = [];
        this.selectedCells = [];
        this.isSelecting = false;
        this.startCell = null;
        this.endCell = null;
        
        this.updateGridSize();
        this.createGrid();
        this.generatePuzzle();
        this.updateGrid();
        this.updateUI();
        this.updateProgress();
        this.closeAllModals();
        
        if (this.pauseBtn) this.pauseBtn.disabled = false;
        if (this.mobilePauseBtn) this.mobilePauseBtn.disabled = false;
        
        this.updateGameStatus('Encontre todas as palavras escondidas!');
        this.playSound('start');
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameTime = 0;
        this.hintsUsed = 0;
        this.foundWords = [];
        this.words = [];
        this.selectedCells = [];
        this.isSelecting = false;
        this.startCell = null;
        this.endCell = null;
        
        // Clear grid and visual elements
        this.grid = [];
        if (this.wordSearchGrid) this.wordSearchGrid.innerHTML = '';
        if (this.wordsListElement) this.wordsListElement.innerHTML = '';
        this.clearWordLines();
        
        this.updateUI();
        this.updateProgress();
        this.closeAllModals();
        
        if (this.pauseBtn) this.pauseBtn.disabled = true;
        if (this.mobilePauseBtn) this.mobilePauseBtn.disabled = true;
        
        this.updateGameStatus('Pressione NOVO JOGO para começar');
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.updateGameStatus('Jogo pausado');
            this.showPauseMenu();
        } else {
            this.updateGameStatus('Continue encontrando as palavras...');
            this.closeAllModals();
        }
        
        this.updateButtonText();
    }
    
    updateButtonText() {
        // Desktop buttons
        if (this.pauseBtn) {
            const pauseIcon = this.pauseBtn.querySelector('.btn-icon');
            const pauseText = this.pauseBtn.querySelector('.btn-text');
            
            if (pauseIcon && pauseText) {
                if (this.gamePaused) {
                    pauseIcon.textContent = '▶';
                    pauseText.textContent = 'CONTINUAR';
                } else {
                    pauseIcon.textContent = '⏸';
                    pauseText.textContent = 'PAUSAR';
                }
            }
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
    
    completePuzzle() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Update statistics
        this.stats.gamesCompleted++;
        this.stats[this.difficulty + 'Completed']++;
        this.stats.accuracy = Math.round((this.stats.correctAttempts / this.stats.totalAttempts) * 100) || 100;
        
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
        if (this.pauseBtn) this.pauseBtn.disabled = true;
        if (this.mobilePauseBtn) this.mobilePauseBtn.disabled = true;
        this.updateGameStatus('🎉 Puzzle completado! Parabéns! 🎉');
        
        // Add victory effect to grid
        if (this.wordSearchGrid) {
            this.wordSearchGrid.classList.add('victory');
            setTimeout(() => {
                if (this.wordSearchGrid) {
                    this.wordSearchGrid.classList.remove('victory');
                }
            }, 2000);
        }
    }
    
    updateUI() {
        if (this.gameTimeElement) this.gameTimeElement.textContent = this.formatTime(this.gameTime);
        if (this.bestTimeElement) this.bestTimeElement.textContent = this.stats.bestTime ? this.formatTime(this.stats.bestTime) : '--:--';
        if (this.currentDifficultyElement) this.currentDifficultyElement.textContent = this.difficulty.toUpperCase();
        if (this.wordsFoundElement) this.wordsFoundElement.textContent = `${this.foundWords.length}/${this.words.length}`;
        
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
    
    updateGameStatus(message) {
        if (this.gameStatusElement) {
            this.gameStatusElement.textContent = message;
            
            // Add pulse animation for important messages
            this.gameStatusElement.style.animation = 'none';
            setTimeout(() => {
                if (this.gameStatusElement) {
                    this.gameStatusElement.style.animation = 'pulse 2s ease-in-out infinite';
                }
            }, 10);
        }
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
        
        // First Word
        if (!this.achievements.firstWord.unlocked && this.stats.gamesCompleted >= 1) {
            this.achievements.firstWord.unlocked = true;
            newAchievements.push('firstWord');
        }
        
        // Speedster
        if (!this.achievements.speedster.unlocked && this.gameTime < 180) {
            this.achievements.speedster.unlocked = true;
            newAchievements.push('speedster');
        }
        
        // Perfectionist
        if (!this.achievements.perfectionist.unlocked && this.hintsUsed === 0) {
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
            if (this.achievementsEarnedElement) {
                const notification = document.createElement('div');
                notification.className = 'achievement-notification';
                notification.textContent = `🏆 ${achievement.name} desbloqueada!`;
                this.achievementsEarnedElement.appendChild(notification);
            }
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
            firstWord: '🥇',
            speedster: '⚡',
            perfectionist: '🎯',
            master: '🧠'
        };
        return icons[key] || '🏆';
    }
    
    showVictoryModal(isNewRecord) {
        if (this.finalTimeElement) this.finalTimeElement.textContent = this.formatTime(this.gameTime);
        if (this.finalDifficultyElement) this.finalDifficultyElement.textContent = this.difficulty.toUpperCase();
        if (this.finalWordsElement) this.finalWordsElement.textContent = `${this.foundWords.length}/${this.words.length}`;
        if (this.newRecordElement) this.newRecordElement.style.display = isNewRecord ? 'block' : 'none';
        
        // Clear previous achievements
        if (this.achievementsEarnedElement) this.achievementsEarnedElement.innerHTML = '';
        
        if (this.victoryModal) this.victoryModal.style.display = 'block';
        
        // Add confetti effect
        this.createConfettiEffect();
    }
    
    createConfettiEffect() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    top: -10px;
                    left: ${Math.random() * 100}%;
                    width: 8px;
                    height: 8px;
                    background: ${['#ff0080', '#00d4ff', '#ff6b35', '#28a745'][Math.floor(Math.random() * 4)]};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 2000;
                    animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 5000);
            }, i * 50);
        }
        
        // Add confetti animation to CSS
        if (!document.querySelector('#confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        transform: translateY(-10px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showPauseMenu() {
        if (this.pauseTimeElement) this.pauseTimeElement.textContent = this.formatTime(this.gameTime);
        if (this.pauseDifficultyElement) this.pauseDifficultyElement.textContent = this.difficulty.toUpperCase();
        if (this.pauseProgressElement) this.pauseProgressElement.textContent = `${this.foundWords.length}/${this.words.length}`;
        if (this.pauseMenu) this.pauseMenu.style.display = 'block';
    }
    
    closeAllModals() {
        if (this.victoryModal) this.victoryModal.style.display = 'none';
        if (this.pauseMenu) this.pauseMenu.style.display = 'none';
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
                    break;
                case 'correct':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    break;
                case 'error':
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    break;
                case 'hint':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                    break;
                case 'victory':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.5);
                    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                    break;
                case 'achievement':
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    break;
                case 'start':
                    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                    break;
            }
            
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }
    
    loadStats() {
        try {
            const saved = JSON.parse(localStorage.getItem('wordSearchStats') || '{}');
            this.stats = { ...this.stats, ...saved };
            
            const savedAchievements = JSON.parse(localStorage.getItem('wordSearchAchievements') || '{}');
            Object.keys(savedAchievements).forEach(key => {
                if (this.achievements[key]) {
                    this.achievements[key].unlocked = savedAchievements[key].unlocked;
                }
            });
        } catch (error) {
            console.warn('Could not load stats:', error);
        }
    }
    
    saveStats() {
        try {
            localStorage.setItem('wordSearchStats', JSON.stringify(this.stats));
            localStorage.setItem('wordSearchAchievements', JSON.stringify(this.achievements));
        } catch (error) {
            console.warn('Could not save stats:', error);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new WordSearchGame();
    
    // Make game globally accessible for debugging
    window.wordSearchGame = game;
    
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
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (game.foundWords.length > 0) {
            setTimeout(() => {
                game.drawWordLines();
            }, 100);
        }
    });
    
    // Add performance monitoring
    let performanceData = {
        gameLoads: 0,
        averageGameTime: 0,
        totalPlayTime: 0
    };
    
    // Track game performance
    const originalNewGame = game.newGame.bind(game);
    game.newGame = function() {
        performanceData.gameLoads++;
        console.log(`🎮 Game #${performanceData.gameLoads} started`);
        return originalNewGame();
    };
    
    const originalCompletePuzzle = game.completePuzzle.bind(game);
    game.completePuzzle = function() {
        performanceData.totalPlayTime += game.gameTime;
        performanceData.averageGameTime = performanceData.totalPlayTime / game.stats.gamesCompleted;
        console.log(`✅ Game completed in ${game.formatTime(game.gameTime)}. Average: ${game.formatTime(Math.round(performanceData.averageGameTime))}`);
        return originalCompletePuzzle();
    };
    
    // Error handling for missing elements
    const checkElementExists = (selector, name) => {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element missing: ${name} (${selector})`);
        }
        return element;
    };
    
    // Validate essential elements
    checkElementExists('#wordSearchGrid', 'Word Search Grid');
    checkElementExists('#newGameBtn', 'New Game Button');
    checkElementExists('#gameStatus', 'Game Status');
    checkElementExists('#wordsList', 'Words List');
    
    console.log('🔍 Caça Palavras - Desktop Edition v3.0');
    console.log('Melhorias da versão 3.0:');
    console.log('  ✅ Base de palavras expandida significativamente');
    console.log('  ✅ Algoritmo de randomização aprimorado');
    console.log('  ✅ Palavras diferentes a cada novo jogo');
    console.log('  ✅ Melhor distribuição de dificuldade');
    console.log('  ✅ Sistema de colocação de palavras otimizado');
    console.log('  ✅ Tratamento robusto de erros');
    console.log('  ✅ Performance melhorada');
    console.log('  ✅ Compatibilidade mobile aprimorada');
    console.log('');
    console.log('Estatísticas das palavras:');
    console.log(`  📝 Fácil: ${game.wordLists.easy.length} palavras`);
    console.log(`  📝 Médio: ${game.wordLists.medium.length} palavras`);
    console.log(`  📝 Difícil: ${game.wordLists.hard.length} palavras`);
    console.log(`  📝 Expert: ${game.wordLists.expert.length} palavras`);
    console.log('');
    console.log('Controles:');
    if (game.isMobile) {
        console.log('  📱 Toque e arraste: Selecione palavras');
        console.log('  📱 Toque na palavra: Dica rápida');
        console.log('  📱 Controles no rodapé da tela');
    } else {
        console.log('  🖱️  Click e arraste: Selecione palavras');
        console.log('  ⌨️  ESC: Cancelar seleção');
        console.log('  ⌨️  ESPAÇO: Pausar/Continuar');
        console.log('  ⌨️  H: Dica');
        console.log('  ⌨️  N: Novo jogo');
        console.log('  ⌨️  R: Reiniciar');
        console.log('  🖱️  Click na palavra: Dica rápida');
    }
    console.log('');
    console.log('Para testar palavras específicas, use: wordSearchGame.wordLists[difficulty]');
    console.log('Para forçar novo jogo: wordSearchGame.newGame()');
    
    // Auto-start first game after 1 second
    setTimeout(() => {
        if (!game.gameRunning) {
            console.log('🎮 Iniciando primeiro jogo automaticamente...');
            game.newGame();
        }
    }, 1000);
    
    // Add debug functions to window for testing
    window.debugWordSearch = {
        showAllWords: () => {
            console.log('📝 Palavras do jogo atual:');
            game.words.forEach((wordInfo, index) => {
                console.log(`${index + 1}. ${wordInfo.word} - ${wordInfo.found ? '✅ Encontrada' : '❌ Não encontrada'}`);
            });
        },
        
        findWord: (word) => {
            const wordInfo = game.words.find(w => w.word === word.toUpperCase());
            if (wordInfo) {
                console.log(`📍 Palavra "${word}" encontrada:`, wordInfo);
                return wordInfo;
            } else {
                console.log(`❌ Palavra "${word}" não está no jogo atual`);
                return null;
            }
        },
        
        completeGame: () => {
            game.words.forEach(wordInfo => {
                if (!wordInfo.found) {
                    wordInfo.found = true;
                    game.foundWords.push(wordInfo);
                }
            });
            game.updateWordsList();
            game.updateProgress();
            game.completePuzzle();
            console.log('🎉 Jogo completado automaticamente!');
        },
        
        testDifficulty: (difficulty) => {
            if (game.wordLists[difficulty]) {
                game.difficulty = difficulty;
                game.difficultySelect.value = difficulty;
                game.newGame();
                console.log(`🎮 Testando dificuldade: ${difficulty}`);
            } else {
                console.log(`❌ Dificuldade "${difficulty}" não existe`);
            }
        },
        
        getStats: () => {
            console.log('📊 Estatísticas do jogo:', game.stats);
            console.log('🏆 Conquistas:', game.achievements);
        }
    };
    
    console.log('🔧 Funções de debug disponíveis em window.debugWordSearch');
});