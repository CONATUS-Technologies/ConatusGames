class PacienciaGame {
    constructor() {
        // Game state
        this.deck = [];
        this.foundations = [[], [], [], []]; // Hearts, Diamonds, Clubs, Spades
        this.tableau = [[], [], [], [], [], [], []]; // 7 columns
        this.stock = [];
        this.waste = [];
        this.selectedCard = null;
        this.selectedPile = null;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameStartTime = 0;
        this.gameTime = 0;
        this.moveCount = 0;
        this.score = 0;
        this.wasteIndex = 0;
        
        // Settings
        this.drawMode = 3; // 1 or 3 cards
        this.soundEnabled = true;
        this.animationEnabled = true;
        this.hintsEnabled = true;
        
        // Statistics
        this.stats = {
            gamesCompleted: 0,
            bestTime: null,
            winRate: 0,
            highScore: 0,
            totalGames: 0,
            mode1Wins: 0,
            mode3Wins: 0,
            currentStreak: 0,
            bestStreak: 0
        };
        
        // Achievements
        this.achievements = {
            firstWin: { unlocked: false, name: 'Primeira Vitória', desc: 'Complete seu primeiro jogo' },
            speedster: { unlocked: false, name: 'Velocista', desc: 'Vença em menos de 3 minutos' },
            strategist: { unlocked: false, name: 'Estrategista', desc: 'Vença com menos de 100 movimentos' },
            cardMaster: { unlocked: false, name: 'Mestre das Cartas', desc: 'Vença 10 jogos consecutivos' }
        };
        
        // Mobile detection
        this.isMobile = this.detectMobile();
        
        // Drag and drop state
        this.dragData = null;
        
        // Initialize game
        this.initializeElements();
        this.setupEventListeners();
        this.loadStats();
        this.updateUI();
        this.updateAchievements();
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
        this.currentScoreElement = document.getElementById('currentScore');
        this.moveCountElement = document.getElementById('moveCount');
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
        this.animationToggle = document.getElementById('animationToggle');
        this.drawModeSelect = document.getElementById('drawModeSelect');
        this.hintsToggle = document.getElementById('hintsToggle');
        this.backBtn = document.getElementById('backBtn');
        
        // Modals
        this.victoryModal = document.getElementById('victoryModal');
        this.pauseMenu = document.getElementById('pauseMenu');
        
        // Game elements
        this.foundationPiles = document.querySelectorAll('.foundation-pile');
        this.tableauColumns = document.querySelectorAll('.tableau-column');
        this.stockPile = document.getElementById('stockPile');
        this.wastePile = document.getElementById('wastePile');
        this.stockCount = document.getElementById('stockCount');
        
        // Progress elements
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // Stats elements
        this.gamesCompletedElement = document.getElementById('gamesCompleted');
        this.personalBestElement = document.getElementById('personalBest');
        this.winRateElement = document.getElementById('winRate');
        this.highScoreElement = document.getElementById('highScore');
        
        // Achievement elements
        this.achievementsListElement = document.getElementById('achievementsList');
        this.achievementsEarnedElement = document.getElementById('achievementsEarned');
        
        // Modal elements
        this.finalTimeElement = document.getElementById('finalTime');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalMovesElement = document.getElementById('finalMoves');
        this.newRecordElement = document.getElementById('newRecord');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.mainMenuBtn = document.getElementById('mainMenuBtn');
        this.modalClose = document.getElementById('modalClose');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.pauseResetBtn = document.getElementById('pauseResetBtn');
        
        // Pause stats
        this.pauseTimeElement = document.getElementById('pauseTime');
        this.pauseScoreElement = document.getElementById('pauseScore');
        this.pauseProgressElement = document.getElementById('pauseProgress');
        
        // Game mode counts
        this.mode1CountElement = document.getElementById('mode1Count');
        this.mode3CountElement = document.getElementById('mode3Count');
        this.currentStreakElement = document.getElementById('currentStreak');
        this.bestStreakElement = document.getElementById('bestStreak');
        
        // Mobile controls
        this.mobileControls = document.getElementById('mobileControls');
    }
    
    setupEventListeners() {
        // Control buttons
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetGame());
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
        this.animationToggle.addEventListener('change', (e) => {
            this.animationEnabled = e.target.checked;
        });
        this.drawModeSelect.addEventListener('change', (e) => {
            this.drawMode = parseInt(e.target.value);
        });
        this.hintsToggle.addEventListener('change', (e) => {
            this.hintsEnabled = e.target.checked;
            this.hintBtn.disabled = !e.target.checked;
            if (this.mobileHintBtn) {
                this.mobileHintBtn.disabled = !e.target.checked;
            }
        });
        
        // Back button
        this.backBtn.addEventListener('click', () => {
            window.history.back();
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
        
        // Stock pile click
        this.stockPile.addEventListener('click', () => this.drawFromStock());
        
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
    
    createDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const suitSymbols = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
        
        this.deck = [];
        
        for (let suit of suits) {
            for (let i = 0; i < ranks.length; i++) {
                this.deck.push({
                    suit: suit,
                    rank: ranks[i],
                    value: i + 1,
                    symbol: suitSymbols[suit],
                    color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black',
                    faceUp: false,
                    id: `${suit}-${ranks[i]}`
                });
            }
        }
        
        // Shuffle deck
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    dealCards() {
        // Clear all piles
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.stock = [];
        this.waste = [];
        this.wasteIndex = 0;
        
        // Deal tableau (1, 2, 3, 4, 5, 6, 7 cards per column)
        let deckIndex = 0;
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = this.deck[deckIndex++];
                card.faceUp = (row === col); // Only top card face up
                this.tableau[col].push(card);
            }
        }
        
        // Remaining cards go to stock
        this.stock = this.deck.slice(deckIndex);
        this.stock.forEach(card => card.faceUp = false);
    }
    
    renderGame() {
        this.renderTableau();
        this.renderFoundations();
        this.renderStock();
        this.renderWaste();
        this.updateProgress();
    }
    
    renderTableau() {
        this.tableauColumns.forEach((column, colIndex) => {
            column.innerHTML = '';
            
            this.tableau[colIndex].forEach((card, cardIndex) => {
                const cardElement = this.createCardElement(card);
                cardElement.style.position = 'absolute';
                cardElement.style.top = `${cardIndex * 25}px`;
                cardElement.style.left = '5px';
                cardElement.style.zIndex = cardIndex + 1;
                
                // Add event listeners
                this.addCardEventListeners(cardElement, card, 'tableau', colIndex);
                
                column.appendChild(cardElement);
            });
        });
    }
    
    renderFoundations() {
        this.foundationPiles.forEach((pile, index) => {
            pile.innerHTML = '<div class="pile-placeholder">' + ['♥', '♦', '♣', '♠'][index] + '</div>';
            
            if (this.foundations[index].length > 0) {
                const topCard = this.foundations[index][this.foundations[index].length - 1];
                const cardElement = this.createCardElement(topCard);
                this.addCardEventListeners(cardElement, topCard, 'foundation', index);
                pile.appendChild(cardElement);
            }
            
            // Add drop zone listeners
            this.addDropZoneListeners(pile, 'foundation', index);
        });
    }
    
    renderStock() {
        const stockElement = this.stockPile;
        stockElement.innerHTML = '';
        
        if (this.stock.length > 0) {
            stockElement.innerHTML = '<div class="card-back"></div>';
        } else {
            stockElement.innerHTML = '<div class="pile-placeholder">🔄</div>';
        }
        
        this.stockCount.textContent = this.stock.length;
    }
    
    renderWaste() {
        this.wastePile.innerHTML = '<div class="pile-placeholder">🗑️</div>';
        
        if (this.waste.length > 0) {
            // Show up to 3 cards in waste pile based on draw mode
            const visibleCards = Math.min(this.drawMode, this.waste.length);
            
            for (let i = 0; i < visibleCards; i++) {
                const cardIndex = this.waste.length - visibleCards + i;
                if (cardIndex >= 0) {
                    const card = this.waste[cardIndex];
                    const cardElement = this.createCardElement(card);
                    cardElement.style.position = 'absolute';
                    cardElement.style.left = `${i * 15}px`;
                    cardElement.style.zIndex = i + 1;
                    
                    // Only top card is interactive
                    if (i === visibleCards - 1) {
                        this.addCardEventListeners(cardElement, card, 'waste', 0);
                    }
                    
                    this.wastePile.appendChild(cardElement);
                }
            }
        }
        
        // Add drop zone listeners
        this.addDropZoneListeners(this.wastePile, 'waste', 0);
    }
    
    createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color}`;
        cardElement.dataset.cardId = card.id;
        
        if (card.faceUp) {
            cardElement.innerHTML = `
                <div class="card-top">
                    <span class="card-rank">${card.rank}</span>
                    <span class="card-suit">${card.symbol}</span>
                </div>
                <div class="card-center">
                    <span class="card-suit">${card.symbol}</span>
                </div>
                <div class="card-bottom">
                    <span class="card-rank">${card.rank}</span>
                    <span class="card-suit">${card.symbol}</span>
                </div>
            `;
            
            // Add special classes for face cards
            if (card.rank === 'K') cardElement.classList.add('king');
            else if (card.rank === 'Q') cardElement.classList.add('queen');
            else if (card.rank === 'J') cardElement.classList.add('jack');
            else if (card.rank === 'A') cardElement.classList.add('ace');
        } else {
            cardElement.classList.add('face-down');
        }
        
        return cardElement;
    }
    
    addCardEventListeners(cardElement, card, pileType, pileIndex) {
        if (!card.faceUp && pileType !== 'foundation') return;
        
        // Click to select
        cardElement.addEventListener('click', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            this.selectCard(card, pileType, pileIndex);
        });
        
        // Double click for auto-move
        cardElement.addEventListener('dblclick', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            e.preventDefault();
            this.autoMoveCard(card, pileType, pileIndex);
        });
        
        // Drag and drop for desktop
        if (!this.isMobile) {
            cardElement.draggable = true;
            
            cardElement.addEventListener('dragstart', (e) => {
                if (!this.gameRunning || this.gamePaused) return;
                this.dragData = { card, pileType, pileIndex };
                cardElement.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            
            cardElement.addEventListener('dragend', (e) => {
                cardElement.classList.remove('dragging');
                this.dragData = null;
            });
        }
    }
    
    addDropZoneListeners(element, pileType, pileIndex) {
        if (this.isMobile) return;
        
        element.addEventListener('dragover', (e) => {
            if (!this.dragData) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (this.canDropCard(this.dragData.card, pileType, pileIndex)) {
                element.classList.add('drop-zone-active');
            } else {
                element.classList.add('drop-zone-invalid');
            }
        });
        
        element.addEventListener('dragleave', (e) => {
            element.classList.remove('drop-zone-active', 'drop-zone-invalid');
        });
        
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('drop-zone-active', 'drop-zone-invalid');
            
            if (this.dragData && this.canDropCard(this.dragData.card, pileType, pileIndex)) {
                this.moveCard(this.dragData.card, this.dragData.pileType, this.dragData.pileIndex, pileType, pileIndex);
            }
        });
    }
    
    selectCard(card, pileType, pileIndex) {
        // Clear previous selection
        document.querySelectorAll('.card.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        if (this.selectedCard === card) {
            // Deselect if clicking same card
            this.selectedCard = null;
            this.selectedPile = null;
            return;
        }
        
        // If we have a selected card, try to move it
        if (this.selectedCard) {
            if (this.canDropCard(this.selectedCard, pileType, pileIndex)) {
                this.moveCard(this.selectedCard, this.selectedPile.type, this.selectedPile.index, pileType, pileIndex);
                this.selectedCard = null;
                this.selectedPile = null;
                return;
            }
        }
        
        // Select new card
        this.selectedCard = card;
        this.selectedPile = { type: pileType, index: pileIndex };
        
        const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
        if (cardElement) {
            cardElement.classList.add('selected');
        }
        
        this.playSound('select');
    }
    
    canDropCard(card, targetPileType, targetPileIndex) {
        if (targetPileType === 'foundation') {
            const foundation = this.foundations[targetPileIndex];
            const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
            
            if (foundation.length === 0) {
                return card.rank === 'A' && card.suit === suits[targetPileIndex];
            } else {
                const topCard = foundation[foundation.length - 1];
                return card.suit === topCard.suit && card.value === topCard.value + 1;
            }
        } else if (targetPileType === 'tableau') {
            const column = this.tableau[targetPileIndex];
            
            if (column.length === 0) {
                return card.rank === 'K';
            } else {
                const topCard = column[column.length - 1];
                return topCard.faceUp && card.color !== topCard.color && card.value === topCard.value - 1;
            }
        }
        
        return false;
    }
    
    moveCard(card, fromPileType, fromPileIndex, toPileType, toPileIndex) {
        // Get cards to move (for tableau sequences)
        const cardsToMove = this.getCardsToMove(card, fromPileType, fromPileIndex);
        
        if (cardsToMove.length === 0) return;
        
        // Validate move for sequences
        if (cardsToMove.length > 1 && toPileType === 'foundation') {
            return; // Can't move sequences to foundation
        }
        
        // Remove cards from source pile
        if (fromPileType === 'tableau') {
            this.tableau[fromPileIndex].splice(-cardsToMove.length);
        } else if (fromPileType === 'waste') {
            this.waste.pop();
        } else if (fromPileType === 'foundation') {
            this.foundations[fromPileIndex].pop();
        }
        
        // Add cards to destination pile
        if (toPileType === 'tableau') {
            this.tableau[toPileIndex].push(...cardsToMove);
        } else if (toPileType === 'foundation') {
            this.foundations[toPileIndex].push(cardsToMove[0]);
        }
        
        // Flip face-down cards in tableau
        if (fromPileType === 'tableau') {
            const sourceColumn = this.tableau[fromPileIndex];
            if (sourceColumn.length > 0 && !sourceColumn[sourceColumn.length - 1].faceUp) {
                sourceColumn[sourceColumn.length - 1].faceUp = true;
                this.playSound('flip');
                if (this.animationEnabled) {
                    this.animateCardFlip(sourceColumn[sourceColumn.length - 1]);
                }
            }
        }
        
        this.moveCount++;
        this.updateScore(cardsToMove[0], fromPileType, toPileType);
        this.renderGame();
        this.updateUI();
        
        this.playSound('move');
        
        // Check for victory
        if (this.checkVictory()) {
            this.completeGame();
        }
        
        // Clear selection
        this.selectedCard = null;
        this.selectedPile = null;
    }
    
    getCardsToMove(card, pileType, pileIndex) {
        if (pileType === 'tableau') {
            const column = this.tableau[pileIndex];
            const cardIndex = column.findIndex(c => c.id === card.id);
            
            if (cardIndex === -1) return [];
            
            const sequence = column.slice(cardIndex);
            
            // Validate sequence (alternating colors, descending values)
            for (let i = 1; i < sequence.length; i++) {
                const prev = sequence[i - 1];
                const curr = sequence[i];
                
                if (!curr.faceUp || curr.color === prev.color || curr.value !== prev.value - 1) {
                    return [];
                }
            }
            
            return sequence;
        } else {
            return [card];
        }
    }
    
    autoMoveCard(card, pileType, pileIndex) {
        // Try to move to foundation first
        for (let i = 0; i < 4; i++) {
            if (this.canDropCard(card, 'foundation', i)) {
                this.moveCard(card, pileType, pileIndex, 'foundation', i);
                return;
            }
        }
        
        // Try to move to tableau
        for (let i = 0; i < 7; i++) {
            if (this.canDropCard(card, 'tableau', i)) {
                this.moveCard(card, pileType, pileIndex, 'tableau', i);
                return;
            }
        }
        
        this.playSound('error');
    }
    
    drawFromStock() {
        if (!this.gameRunning || this.gamePaused) return;
        
        if (this.stock.length === 0) {
            // Reset stock from waste
            if (this.waste.length === 0) return;
            
            this.stock = [...this.waste].reverse();
            this.stock.forEach(card => card.faceUp = false);
            this.waste = [];
            this.wasteIndex = 0;
            this.moveCount++;
            this.playSound('shuffle');
        } else {
            // Draw cards from stock to waste
            const cardsToDraw = Math.min(this.drawMode, this.stock.length);
            
            for (let i = 0; i < cardsToDraw; i++) {
                const card = this.stock.pop();
                card.faceUp = true;
                this.waste.push(card);
            }
            
            this.moveCount++;
            this.playSound('draw');
        }
        
        this.renderStock();
        this.renderWaste();
        this.updateUI();
    }
    
    updateScore(card, fromPileType, toPileType) {
        if (toPileType === 'foundation') {
            this.score += 10;
        } else if (fromPileType === 'waste' && toPileType === 'tableau') {
            this.score += 5;
        } else if (fromPileType === 'foundation' && toPileType === 'tableau') {
            this.score -= 15;
        }
        
        // Bonus for revealing face-down cards
        if (fromPileType === 'tableau') {
            const sourceColumn = this.tableau[this.selectedPile?.index || 0];
            if (sourceColumn.length > 0 && !sourceColumn[sourceColumn.length - 1].faceUp) {
                this.score += 5;
            }
        }
        
        this.score = Math.max(0, this.score);
    }
    
    checkVictory() {
        return this.foundations.every(foundation => foundation.length === 13);
    }
    
    giveHint() {
        if (!this.hintsEnabled || !this.gameRunning || this.gamePaused) return;
        
        // Look for possible moves
        const hints = this.findPossibleMoves();
        
        if (hints.length === 0) {
            this.updateGameStatus('Nenhuma jogada disponível. Tente comprar do baralho.');
            return;
        }
        
        // Show first hint
        const hint = hints[0];
        this.highlightHint(hint);
        this.updateGameStatus(`Dica: Mova ${hint.card.rank}${hint.card.symbol} para ${hint.targetDescription}`);
        this.playSound('hint');
    }
    
    findPossibleMoves() {
        const moves = [];
        
        // Check waste pile
        if (this.waste.length > 0) {
            const topCard = this.waste[this.waste.length - 1];
            this.checkMovesForCard(topCard, 'waste', 0, moves);
        }
        
        // Check tableau piles
        for (let col = 0; col < 7; col++) {
            const column = this.tableau[col];
            if (column.length > 0) {
                const topCard = column[column.length - 1];
                if (topCard.faceUp) {
                    this.checkMovesForCard(topCard, 'tableau', col, moves);
                }
            }
        }
        
        return moves;
    }
    
    checkMovesForCard(card, fromPileType, fromPileIndex, moves) {
        // Check foundation moves
        for (let i = 0; i < 4; i++) {
            if (this.canDropCard(card, 'foundation', i)) {
                moves.push({
                    card,
                    fromType: fromPileType,
                    fromIndex: fromPileIndex,
                    toType: 'foundation',
                    toIndex: i,
                    targetDescription: 'fundação'
                });
            }
        }
        
        // Check tableau moves
        for (let i = 0; i < 7; i++) {
            if (i !== fromPileIndex && this.canDropCard(card, 'tableau', i)) {
                moves.push({
                    card,
                    fromType: fromPileType,
                    fromIndex: fromPileIndex,
                    toType: 'tableau',
                    toIndex: i,
                    targetDescription: `coluna ${i + 1}`
                });
            }
        }
    }
    
    highlightHint(hint) {
        // Remove previous hints
        document.querySelectorAll('.hint-highlight').forEach(el => {
            el.classList.remove('hint-highlight');
        });
        
        // Highlight source card
        const sourceCard = document.querySelector(`[data-card-id="${hint.card.id}"]`);
        if (sourceCard) {
            sourceCard.classList.add('hint-highlight');
        }
        
        // Highlight target pile
        let targetElement;
        if (hint.toType === 'foundation') {
            targetElement = this.foundationPiles[hint.toIndex];
        } else if (hint.toType === 'tableau') {
            targetElement = this.tableauColumns[hint.toIndex];
        }
        
        if (targetElement) {
            targetElement.classList.add('drop-zone-active');
            setTimeout(() => {
                targetElement.classList.remove('drop-zone-active');
            }, 3000);
        }
        
        // Clear hint highlight after delay
        setTimeout(() => {
            document.querySelectorAll('.hint-highlight').forEach(el => {
                el.classList.remove('hint-highlight');
            });
        }, 3000);
    }
    
    newGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameStartTime = Date.now();
        this.gameTime = 0;
        this.moveCount = 0;
        this.score = 0;
        this.selectedCard = null;
        this.selectedPile = null;
        
        this.createDeck();
        this.dealCards();
        this.renderGame();
        this.updateUI();
        this.closeAllModals();
        
        this.pauseBtn.disabled = false;
        if (this.mobilePauseBtn) {
            this.mobilePauseBtn.disabled = false;
        }
        
        this.updateGameStatus('Boa sorte! Organize as cartas nas fundações');
        this.playSound('start');
        
        if (this.animationEnabled) {
            this.animateCardDeal();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameTime = 0;
        this.moveCount = 0;
        this.score = 0;
        this.selectedCard = null;
        this.selectedPile = null;
        
        // Clear all piles
        this.deck = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.stock = [];
        this.waste = [];
        
        this.renderGame();
        this.updateUI();
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
            this.updateGameStatus('Continue jogando...');
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
            if (this.gamePaused) {
                this.mobilePauseBtn.innerHTML = '<span class="btn-icon">▶</span>CONTINUAR';
            } else {
                this.mobilePauseBtn.innerHTML = '<span class="btn-icon">⏸</span>PAUSAR';
            }
        }
    }
    
    completeGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Update statistics
        this.stats.gamesCompleted++;
        this.stats.totalGames++;
        this.stats.currentStreak++;
        
        if (this.drawMode === 1) {
            this.stats.mode1Wins++;
        } else {
            this.stats.mode3Wins++;
        }
        
        if (this.stats.currentStreak > this.stats.bestStreak) {
            this.stats.bestStreak = this.stats.currentStreak;
        }
        
        this.stats.winRate = Math.round((this.stats.gamesCompleted / this.stats.totalGames) * 100);
        
        // Check for new records
        let isNewRecord = false;
        if (!this.stats.bestTime || this.gameTime < this.stats.bestTime) {
            this.stats.bestTime = this.gameTime;
            isNewRecord = true;
        }
        
        if (this.score > this.stats.highScore) {
            this.stats.highScore = this.score;
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
        this.updateGameStatus('Parabéns! Você venceu!');
        
        if (this.animationEnabled) {
            this.animateVictory();
        }
    }
    
    updateUI() {
        this.gameTimeElement.textContent = this.formatTime(this.gameTime);
        this.bestTimeElement.textContent = this.stats.bestTime ? this.formatTime(this.stats.bestTime) : '--:--';
        this.currentScoreElement.textContent = this.score;
        this.moveCountElement.textContent = this.moveCount;
        
        // Update statistics
        if (this.gamesCompletedElement) {
            this.gamesCompletedElement.textContent = this.stats.gamesCompleted;
        }
        if (this.personalBestElement) {
            this.personalBestElement.textContent = this.stats.bestTime ? this.formatTime(this.stats.bestTime) : '--:--';
        }
        if (this.winRateElement) {
            this.winRateElement.textContent = this.stats.winRate + '%';
        }
        if (this.highScoreElement) {
            this.highScoreElement.textContent = this.stats.highScore;
        }
        
        // Update game mode counts
        if (this.mode1CountElement) {
            this.mode1CountElement.textContent = this.stats.mode1Wins;
        }
        if (this.mode3CountElement) {
            this.mode3CountElement.textContent = this.stats.mode3Wins;
        }
        if (this.currentStreakElement) {
            this.currentStreakElement.textContent = this.stats.currentStreak;
        }
        if (this.bestStreakElement) {
            this.bestStreakElement.textContent = this.stats.bestStreak;
        }
    }
    
    updateProgress() {
        const totalCards = 52;
        const foundationCards = this.foundations.reduce((sum, foundation) => sum + foundation.length, 0);
        const percentage = Math.round((foundationCards / totalCards) * 100);
        
        if (this.progressFill) {
            this.progressFill.style.width = percentage + '%';
        }
        if (this.progressText) {
            this.progressText.textContent = `${foundationCards}/${totalCards}`;
        }
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
            case 'Escape':
                e.preventDefault();
                // Clear selection
                document.querySelectorAll('.card.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                this.selectedCard = null;
                this.selectedPile = null;
                break;
        }
    }
    
    checkAchievements() {
        const newAchievements = [];
        
        // First Win
        if (!this.achievements.firstWin.unlocked && this.stats.gamesCompleted >= 1) {
            this.achievements.firstWin.unlocked = true;
            newAchievements.push('firstWin');
        }
        
        // Speedster
        if (!this.achievements.speedster.unlocked && this.gameTime < 180) {
            this.achievements.speedster.unlocked = true;
            newAchievements.push('speedster');
        }
        
        // Strategist
        if (!this.achievements.strategist.unlocked && this.moveCount < 100) {
            this.achievements.strategist.unlocked = true;
            newAchievements.push('strategist');
        }
        
        // Card Master
        if (!this.achievements.cardMaster.unlocked && this.stats.currentStreak >= 10) {
            this.achievements.cardMaster.unlocked = true;
            newAchievements.push('cardMaster');
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
            firstWin: '🥇',
            speedster: '⚡',
            strategist: '🎯',
            cardMaster: '🃏'
        };
        return icons[key] || '🏆';
    }
    
    showVictoryModal(isNewRecord) {
        this.finalTimeElement.textContent = this.formatTime(this.gameTime);
        this.finalScoreElement.textContent = this.score;
        this.finalMovesElement.textContent = this.moveCount;
        this.newRecordElement.style.display = isNewRecord ? 'block' : 'none';
        
        // Clear previous achievements
        this.achievementsEarnedElement.innerHTML = '';
        
        this.victoryModal.style.display = 'block';
    }
    
    showPauseMenu() {
        this.pauseTimeElement.textContent = this.formatTime(this.gameTime);
        this.pauseScoreElement.textContent = this.score;
        
        const foundationCards = this.foundations.reduce((sum, foundation) => sum + foundation.length, 0);
        this.pauseProgressElement.textContent = `${foundationCards}/52`;
        
        this.pauseMenu.style.display = 'block';
    }
    
    closeAllModals() {
        this.victoryModal.style.display = 'none';
        this.pauseMenu.style.display = 'none';
    }
    
    // Animation methods
    animateCardDeal() {
        if (!this.animationEnabled) return;
        
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('deal-animation');
            }, index * 50);
        });
    }
    
    animateCardFlip(card) {
        if (!this.animationEnabled) return;
        
        const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
        if (cardElement) {
            cardElement.classList.add('flip-animation');
            setTimeout(() => {
                cardElement.classList.remove('flip-animation');
            }, 600);
        }
    }
    
    animateVictory() {
        if (!this.animationEnabled) return;
        
        const gameBoard = document.querySelector('.game-board');
        gameBoard.classList.add('victory');
        
        setTimeout(() => {
            gameBoard.classList.remove('victory');
        }, 2000);
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
                case 'move':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
                    break;
                case 'flip':
                    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(700, audioContext.currentTime + 0.2);
                    break;
                case 'draw':
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                    break;
                case 'shuffle':
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
                    break;
                case 'hint':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.2);
                    break;
                case 'victory':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
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
                case 'error':
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
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
        // const saved = localStorage.getItem('pacienciaStats');
        // if (saved) {
        //     this.stats = { ...this.stats, ...JSON.parse(saved) };
        // }
        
        // const savedAchievements = localStorage.getItem('pacienciaAchievements');
        // if (savedAchievements) {
        //     this.achievements = { ...this.achievements, ...JSON.parse(savedAchievements) };
        // }
    }
    
    saveStats() {
        // In a real environment, this would use localStorage
        // localStorage.setItem('pacienciaStats', JSON.stringify(this.stats));
        // localStorage.setItem('pacienciaAchievements', JSON.stringify(this.achievements));
    }
    
    // Auto-complete functionality
    autoComplete() {
        if (!this.gameRunning || this.gamePaused) return;
        
        let foundMove = true;
        while (foundMove) {
            foundMove = false;
            
            // Check waste pile
            if (this.waste.length > 0) {
                const topCard = this.waste[this.waste.length - 1];
                for (let i = 0; i < 4; i++) {
                    if (this.canDropCard(topCard, 'foundation', i)) {
                        this.moveCard(topCard, 'waste', 0, 'foundation', i);
                        foundMove = true;
                        break;
                    }
                }
            }
            
            if (foundMove) continue;
            
            // Check tableau piles
            for (let col = 0; col < 7; col++) {
                const column = this.tableau[col];
                if (column.length > 0) {
                    const topCard = column[column.length - 1];
                    if (topCard.faceUp) {
                        for (let i = 0; i < 4; i++) {
                            if (this.canDropCard(topCard, 'foundation', i)) {
                                this.moveCard(topCard, 'tableau', col, 'foundation', i);
                                foundMove = true;
                                break;
                            }
                        }
                        if (foundMove) break;
                    }
                }
            }
        }
        
        if (this.checkVictory()) {
            this.completeGame();
        }
    }
    
    // Double-click detection for auto-complete
    setupAutoComplete() {
        let clickCount = 0;
        let clickTimer = null;
        
        document.addEventListener('click', (e) => {
            clickCount++;
            
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 300);
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                clickCount = 0;
                
                // Check if clicked on empty area
                if (e.target.classList.contains('game-board') || 
                    e.target.classList.contains('game-board-container')) {
                    this.autoComplete();
                }
            }
        });
    }
    
    // Touch support for mobile
    setupTouchSupport() {
        if (!this.isMobile) return;
        
        let touchStartPos = null;
        let touchElement = null;
        
        document.addEventListener('touchstart', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };
            touchElement = e.target.closest('.card');
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!touchStartPos || !touchElement) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartPos.x;
            const deltaY = touch.clientY - touchStartPos.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance > 10) {
                touchElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.1)`;
                touchElement.style.zIndex = '1000';
                touchElement.classList.add('dragging');
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!touchStartPos || !touchElement) return;
            
            touchElement.style.transform = '';
            touchElement.style.zIndex = '';
            touchElement.classList.remove('dragging');
            
            const touch = e.changedTouches[0];
            const endElement = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (endElement) {
                const pile = endElement.closest('.foundation-pile, .tableau-column');
                if (pile) {
                    // Handle drop
                    const cardData = touchElement.dataset.cardId;
                    const card = this.findCardById(cardData);
                    
                    if (card) {
                        let pileType, pileIndex;
                        
                        if (pile.classList.contains('foundation-pile')) {
                            pileType = 'foundation';
                            pileIndex = Array.from(this.foundationPiles).indexOf(pile);
                        } else if (pile.classList.contains('tableau-column')) {
                            pileType = 'tableau';
                            pileIndex = Array.from(this.tableauColumns).indexOf(pile);
                        }
                        
                        if (this.canDropCard(card, pileType, pileIndex)) {
                            const sourceInfo = this.findCardSource(card);
                            if (sourceInfo) {
                                this.moveCard(card, sourceInfo.type, sourceInfo.index, pileType, pileIndex);
                            }
                        }
                    }
                }
            }
            
            touchStartPos = null;
            touchElement = null;
        }, { passive: true });
    }
    
    findCardById(cardId) {
        // Search in waste
        for (let card of this.waste) {
            if (card.id === cardId) return card;
        }
        
        // Search in tableau
        for (let column of this.tableau) {
            for (let card of column) {
                if (card.id === cardId) return card;
            }
        }
        
        // Search in foundations
        for (let foundation of this.foundations) {
            for (let card of foundation) {
                if (card.id === cardId) return card;
            }
        }
        
        return null;
    }
    
    findCardSource(targetCard) {
        // Search in waste
        for (let i = 0; i < this.waste.length; i++) {
            if (this.waste[i].id === targetCard.id) {
                return { type: 'waste', index: 0 };
            }
        }
        
        // Search in tableau
        for (let col = 0; col < this.tableau.length; col++) {
            for (let i = 0; i < this.tableau[col].length; i++) {
                if (this.tableau[col][i].id === targetCard.id) {
                    return { type: 'tableau', index: col };
                }
            }
        }
        
        // Search in foundations
        for (let i = 0; i < this.foundations.length; i++) {
            for (let j = 0; j < this.foundations[i].length; j++) {
                if (this.foundations[i][j].id === targetCard.id) {
                    return { type: 'foundation', index: i };
                }
            }
        }
        
        return null;
    }
    
    // Undo functionality (limited to last move)
    setupUndo() {
        this.lastMove = null;
        
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.undoLastMove();
            }
        });
    }
    
    saveMove(move) {
        this.lastMove = move;
    }
    
    undoLastMove() {
        if (!this.lastMove || !this.gameRunning) return;
        
        // This would require implementing move history
        // For now, just show a message
        this.updateGameStatus('Desfazer não implementado nesta versão');
    }
    
    // Statistics tracking
    trackGameEnd(won) {
        this.stats.totalGames++;
        
        if (won) {
            this.stats.gamesCompleted++;
            this.stats.currentStreak++;
            
            if (this.stats.currentStreak > this.stats.bestStreak) {
                this.stats.bestStreak = this.stats.currentStreak;
            }
        } else {
            this.stats.currentStreak = 0;
        }
        
        this.stats.winRate = Math.round((this.stats.gamesCompleted / this.stats.totalGames) * 100);
        this.saveStats();
    }
    
    // Game difficulty analysis
    analyzeDifficulty() {
        // This could analyze the current game state and provide difficulty rating
        // For now, return basic assessment
        
        const faceDownCards = this.tableau.reduce((count, column) => {
            return count + column.filter(card => !card.faceUp).length;
        }, 0);
        
        const availableMoves = this.findPossibleMoves().length;
        const stockRemaining = this.stock.length;
        
        if (faceDownCards > 15 && availableMoves < 3) {
            return 'Muito Difícil';
        } else if (faceDownCards > 10 && availableMoves < 5) {
            return 'Difícil';
        } else if (availableMoves > 8) {
            return 'Fácil';
        } else {
            return 'Médio';
        }
    }
    
    // Performance monitoring
    startPerformanceMonitoring() {
        this.performanceStats = {
            renderTime: 0,
            renderCount: 0,
            lastRenderTime: 0
        };
        
        // Override render methods to track performance
        const originalRender = this.renderGame.bind(this);
        this.renderGame = () => {
            const startTime = performance.now();
            originalRender();
            const endTime = performance.now();
            
            this.performanceStats.renderTime += (endTime - startTime);
            this.performanceStats.renderCount++;
            this.performanceStats.lastRenderTime = endTime - startTime;
        };
    }
    
    getPerformanceReport() {
        if (this.performanceStats.renderCount === 0) return 'No performance data';
        
        const avgRenderTime = this.performanceStats.renderTime / this.performanceStats.renderCount;
        return `Avg render: ${avgRenderTime.toFixed(2)}ms, Last: ${this.performanceStats.lastRenderTime.toFixed(2)}ms`;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new PacienciaGame();
    
    // Setup additional features
    game.setupAutoComplete();
    game.setupTouchSupport();
    game.setupUndo();
    game.startPerformanceMonitoring();
    
    // Prevent browser zoom affecting game
    document.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
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
    
    // Context menu for debug info (development)
    document.addEventListener('contextmenu', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            console.log('Game State:', {
                foundations: game.foundations,
                tableau: game.tableau,
                stock: game.stock.length,
                waste: game.waste.length,
                score: game.score,
                moves: game.moveCount,
                difficulty: game.analyzeDifficulty(),
                performance: game.getPerformanceReport()
            });
        }
    });
    
    // Keyboard shortcuts help
    window.showKeyboardHelp = () => {
        const helpText = `
Atalhos do Teclado:
- ESPAÇO: Pausar/Continuar ou Novo Jogo
- H: Mostrar dica
- N: Novo jogo
- R: Reiniciar
- ESC: Limpar seleção
- Ctrl+Z: Desfazer (em desenvolvimento)
- Duplo clique: Auto-completar movimentos possíveis
        `;
        alert(helpText);
    };
    
    // Add keyboard help button (hidden)
    const helpBtn = document.createElement('button');
    helpBtn.style.cssText = 'position: fixed; bottom: 10px; left: 10px; opacity: 0.1; pointer-events: none;';
    helpBtn.textContent = '?';
    helpBtn.onclick = window.showKeyboardHelp;
    document.body.appendChild(helpBtn);
    
    // Development console commands
    window.gameDebug = {
        game: game,
        winGame: () => {
            // Fill all foundations for testing
            const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
            suits.forEach((suit, suitIndex) => {
                for (let value = 1; value <= 13; value++) {
                    const rank = value === 1 ? 'A' : 
                                value === 11 ? 'J' : 
                                value === 12 ? 'Q' : 
                                value === 13 ? 'K' : value.toString();
                    
                    game.foundations[suitIndex].push({
                        suit: suit,
                        rank: rank,
                        value: value,
                        symbol: ['♥', '♦', '♣', '♠'][suitIndex],
                        color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black',
                        faceUp: true,
                        id: `${suit}-${rank}`
                    });
                }
            });
            game.renderGame();
            game.completeGame();
        },
        getStats: () => game.stats,
        resetStats: () => {
            game.stats = {
                gamesCompleted: 0,
                bestTime: null,
                winRate: 0,
                highScore: 0,
                totalGames: 0,
                mode1Wins: 0,
                mode3Wins: 0,
                currentStreak: 0,
                bestStreak: 0
            };
            game.saveStats();
            game.updateUI();
        }
    };
    
    console.log('🃏 Paciência Game - Desktop Edition');
    console.log('Controles:');
    if (game.isMobile) {
        console.log('  Toque: Selecione e arraste cartas');
        console.log('  Duplo toque: Auto-mover carta');
    } else {
        console.log('  Click: Selecionar carta');
        console.log('  Arrastar: Mover cartas');
        console.log('  Duplo click: Auto-mover carta');
        console.log('  ESPAÇO: Pausar/Continuar');
        console.log('  H: Dica');
        console.log('  N: Novo jogo');
        console.log('  R: Reiniciar');
        console.log('  ESC: Limpar seleção');
    }
    console.log('Digite gameDebug no console para comandos de debug');
});