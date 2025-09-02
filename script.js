// ===== CONATUSGAMES - JAVASCRIPT PRINCIPAL (VERSÃO CORRIGIDA) =====
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== FUNÇÃO DE SEGURANÇA PARA ELEMENTOS =====
    function safeQuerySelector(selector, required = false) {
        const element = document.querySelector(selector);
        if (!element && required) {
            console.warn(`❌ Elemento obrigatório não encontrado: ${selector}`);
        }
        return element;
    }
    
    function safeQuerySelectorAll(selector) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
            console.warn(`⚠️ Nenhum elemento encontrado para: ${selector}`);
        }
        return elements;
    }
    
    // ===== VARIÁVEIS GLOBAIS (COM PROTEÇÃO) =====
    const searchInput = safeQuerySelector('#searchInput');
    const filterButtons = safeQuerySelectorAll('.filter-btn');
    const gameCards = safeQuerySelectorAll('.game-card');
    const expandBtn = safeQuerySelector('#expandBtn');
    const hiddenCategories = safeQuerySelector('#hiddenCategories');
    const loginBtn = safeQuerySelector('#loginBtn');
    const registerBtn = safeQuerySelector('#registerBtn');
    const gamePlayButtons = safeQuerySelectorAll('.game-play-btn');
    
    let isExpanded = false;
    let activeFilter = 'all';
    
    // ===== CRIAÇÃO AUTOMÁTICA DO CONTAINER DE PARTÍCULAS =====
    function ensureParticlesContainer() {
        let particlesContainer = safeQuerySelector('.particles-container');
        if (!particlesContainer) {
            particlesContainer = document.createElement('div');
            particlesContainer.className = 'particles-container';
            particlesContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: -1;
                overflow: hidden;
            `;
            document.body.insertBefore(particlesContainer, document.body.firstChild);
            console.log('✅ Container de partículas criado automaticamente');
        }
        return particlesContainer;
    }
    
    // ===== SISTEMA DE PARTÍCULAS FLUTUANTES =====
    function createParticle() {
        const particlesContainer = ensureParticlesContainer();
        
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Posição aleatória horizontal
        particle.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            bottom: -10px;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: ${['#8400FF', '#00D4FF', '#FF0080', '#FF6B35', '#28A745'][Math.floor(Math.random() * 5)]};
            border-radius: 50%;
            pointer-events: none;
            animation: floatUp ${Math.random() * 15 + 8}s linear forwards;
            animation-delay: ${Math.random() * 3}s;
        `;
        
        particlesContainer.appendChild(particle);
        
        // Remove a partícula após a animação
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 18000);
    }
    
    // Adiciona CSS da animação das partículas
    function addParticleStyles() {
        if (document.querySelector('#particle-styles')) return; // Evita duplicação
        
        const style = document.createElement('style');
        style.id = 'particle-styles';
        style.textContent = `
            @keyframes floatUp {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Cria partículas continuamente
    function startParticleSystem() {
        addParticleStyles();
        createParticle();
        setTimeout(startParticleSystem, Math.random() * 2000 + 1000);
    }
    
    startParticleSystem();
    
    // ===== SISTEMA DE BUSCA =====
    function filterGames() {
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        const activeButton = document.querySelector('.filter-btn.active');
        const activeCategory = activeButton ? activeButton.dataset.filter : 'all';
        
        gameCards.forEach(card => {
            const gameTitle = card.querySelector('.game-title');
            const gameDescription = card.querySelector('.game-description');
            
            if (!gameTitle || !gameDescription) {
                console.warn('Card de jogo sem título ou descrição:', card);
                return;
            }
            
            const gameTitleText = gameTitle.textContent.toLowerCase();
            const gameDescriptionText = gameDescription.textContent.toLowerCase();
            const gameCategory = card.dataset.category;
            
            const matchesSearch = gameTitleText.includes(searchTerm) || 
                                gameDescriptionText.includes(searchTerm) ||
                                searchTerm === '';
            
            const matchesCategory = activeCategory === 'all' || gameCategory === activeCategory;
            
            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
        
        updateGameCount();
    }
    
    // Contador de jogos visíveis
    function updateGameCount() {
        if (!searchInput) return;
        
        const visibleGames = Array.from(gameCards).filter(card => 
            card.style.display !== 'none'
        ).length;
        
        const gamesTitle = safeQuerySelector('.games-header h2');
        if (!gamesTitle) return;
        
        const searchTerm = searchInput.value.trim();
        const activeButton = document.querySelector('.filter-btn.active');
        const activeCategory = activeButton ? activeButton.textContent : 'TODOS';
        
        if (searchTerm) {
            gamesTitle.textContent = `${visibleGames} JOGO${visibleGames !== 1 ? 'S' : ''} ENCONTRADO${visibleGames !== 1 ? 'S' : ''}`;
        } else if (activeCategory !== 'TODOS') {
            gamesTitle.textContent = `${visibleGames} JOGO${visibleGames !== 1 ? 'S' : ''} DE ${activeCategory}`;
        } else {
            gamesTitle.textContent = 'ESCOLHA SEU JOGO';
        }
    }
    
    // Event listener para busca (com proteção)
    if (searchInput) {
        searchInput.addEventListener('input', filterGames);
        
        searchInput.addEventListener('focus', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'scale(1.05)';
            }
        });
        
        searchInput.addEventListener('blur', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'scale(1)';
            }
        });
        console.log('✅ Event listeners do campo de busca adicionados');
    }
    
    // ===== SISTEMA DE FILTROS =====
    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active de todos os botões
                filterButtons.forEach(button => button.classList.remove('active'));
                
                // Adiciona active ao botão clicado
                this.classList.add('active');
                
                // Aplica o filtro
                activeFilter = this.dataset.filter || 'all';
                filterGames();
                
                // Efeito visual no botão
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
        });
        console.log(`✅ ${filterButtons.length} botões de filtro configurados`);
    }
    
    // ===== EXPANSÃO DE CATEGORIAS =====
    if (expandBtn && hiddenCategories) {
        expandBtn.addEventListener('click', function() {
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                hiddenCategories.style.display = 'flex';
                setTimeout(() => {
                    hiddenCategories.classList.add('show');
                }, 10);
                this.classList.add('active');
                const icon = this.querySelector('i');
                if (icon) icon.className = 'fas fa-times';
            } else {
                hiddenCategories.classList.remove('show');
                setTimeout(() => {
                    hiddenCategories.style.display = 'none';
                }, 300);
                this.classList.remove('active');
                const icon = this.querySelector('i');
                if (icon) icon.className = 'fas fa-plus';
            }
        });
        console.log('✅ Botão de expansão de categorias configurado');
    }
    
    // ===== SISTEMA DE JOGOS =====
    if (gamePlayButtons.length > 0) {
        gamePlayButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const gameCard = this.closest('.game-card');
                if (!gameCard) {
                    console.error('Card do jogo não encontrado');
                    return;
                }
                
                const gameType = gameCard.dataset.game || 'jogo-desconhecido';
                
                // Efeito visual de clique
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                // Simula carregamento do jogo
                showGameLoading(gameType, gameCard);
            });
        });
        console.log(`✅ ${gamePlayButtons.length} botões de jogo configurados`);
    }
    
    function showGameLoading(gameType, gameCard) {
        const gameTitle = gameCard.querySelector('.game-title');
        const gameName = gameTitle ? gameTitle.textContent : gameType.toUpperCase();
        
        // Cria overlay de carregamento
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'game-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h3>Carregando ${gameName}...</h3>
                <p>Preparando seu jogo clássico</p>
                <div class="loading-bar">
                    <div class="loading-progress"></div>
                </div>
            </div>
        `;
        
        // Adiciona estilos do overlay
        const style = document.createElement('style');
        style.textContent = `
            .game-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(15, 15, 35, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(10px);
            }
            
            .loading-content {
                text-align: center;
                color: white;
                max-width: 400px;
                padding: 40px;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 20px;
                border: 2px solid #8400FF;
                box-shadow: 0 20px 40px rgba(132, 0, 255, 0.3);
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(132, 0, 255, 0.3);
                border-top: 3px solid #8400FF;
                border-radius: 50%;
                animation: spin 2s linear infinite;
                margin: 0 auto 20px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                overflow: hidden;
                margin-top: 20px;
            }
            
            .loading-progress {
                width: 0%;
                height: 100%;
                background: linear-gradient(90deg, #8400FF, #00D4FF);
                border-radius: 4px;
                animation: loadProgress 3s ease-in-out forwards;
            }
            
            @keyframes loadProgress {
                0% { width: 0%; }
                50% { width: 60%; }
                100% { width: 100%; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(loadingOverlay);
        
        // Mostra a tela de avaliação após o carregamento
        setTimeout(() => {
            loadingOverlay.remove();
            style.remove();
            
            // CHAMA A FUNÇÃO DE AVALIAÇÃO
            showGameRating(gameType);
        }, 1000); // Reduzi para 1 segundos para teste
    }
    
    function showGameRating(gameType) {
        console.log('🎮 Mostrando avaliação para:', gameType);
        
        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-gamepad"></i>
                <h3>Avalie o ${gameType.toUpperCase()}!</h3>
                <p>Como você classifica este jogo?</p>
                
                <div class="rating-stars">
                    <span class="star" data-rating="1">⭐</span>
                    <span class="star" data-rating="2">⭐</span>
                    <span class="star" data-rating="3">⭐</span>
                    <span class="star" data-rating="4">⭐</span>
                    <span class="star" data-rating="5">⭐</span>
                </div>
                
                <div class="rating-text" id="ratingText">Clique nas estrelas para avaliar</div>
                
                <textarea 
                    id="gameComment" 
                    placeholder="Deixe um comentário (opcional)..." 
                    maxlength="200"
                ></textarea>
                
                <div class="button-group">
                    <button onclick="submitRating('${gameType}')" class="btn btn-primary" id="submitBtn" disabled>
                        Enviar Avaliação
                    </button>
                    <button onclick="this.close+st('.game-notification').remove()" class="btn btn-secondary">
                        Pular
                    </button>
                </div>
            </div>
        `;
        
        // Estilos da notificação
        const style = document.createElement('style');
        style.textContent = `
            .game-notification {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10000;
                animation: notificationIn 0.5s ease;
            }
            
            .notification-content {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                padding: 30px;
                border-radius: 15px;
                border: 2px solid #8400FF;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
                min-width: 350px;
                max-width: 450px;
            }
            
            .notification-content i {
                font-size: 3rem;
                color: #8400FF;
                margin-bottom: 15px;
            }
            
            .notification-content h3 {
                color: white;
                margin-bottom: 10px;
                font-family: 'Orbitron', monospace;
            }
            
            .notification-content p {
                color: #b0b0b0;
                margin-bottom: 20px;
            }
            
            .rating-stars {
                display: flex;
                justify-content: center;
                gap: 5px;
                margin-bottom: 15px;
            }
            
            .star {
                font-size: 2rem;
                cursor: pointer;
                transition: all 0.3s ease;
                filter: grayscale(100%);
                opacity: 0.5;
            }
            
            .star:hover,
            .star.active {
                filter: grayscale(0%);
                opacity: 1;
                transform: scale(1.2);
            }
            
            .rating-text {
                color: #8400FF;
                font-weight: bold;
                margin-bottom: 15px;
                min-height: 20px;
            }
            
            #gameComment {
                width: 100%;
                min-height: 80px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid #8400FF;
                border-radius: 8px;
                color: white;
                padding: 10px;
                margin-bottom: 20px;
                resize: vertical;
                font-family: inherit;
                box-sizing: border-box;
            }
            
            #gameComment::placeholder {
                color: #b0b0b0;
            }
            
            #gameComment:focus {
                outline: none;
                border-color: #a855f7;
                box-shadow: 0 0 10px rgba(132, 0, 255, 0.3);
            }
            
            .button-group {
                display: flex;
                gap: 10px;
                justify-content: center;
            }
            
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-family: 'Orbitron', monospace;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            .btn-primary {
                background: linear-gradient(45deg, #8400FF, #a855f7);
                color: white;
            }
            
            .btn-primary:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(132, 0, 255, 0.4);
            }
            
            .btn-primary:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: #b0b0b0;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }
            
            @keyframes notificationIn {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                100% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            
            @keyframes successPulse {
                0% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.05); }
                100% { transform: translate(-50%, -50%) scale(1); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Adicionar funcionalidade às estrelas
        const stars = notification.querySelectorAll('.star');
        const ratingText = notification.querySelector('#ratingText');
        const submitBtn = notification.querySelector('#submitBtn');
        let currentRating = 0;
        
        const ratingMessages = {
            1: "Não gostei 😞",
            2: "Poderia ser melhor 😐",
            3: "Bom jogo! 😊",
            4: "Muito bom! 😍",
            5: "Incrível! ⭐"
        };
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                currentRating = index + 1;
                updateStars();
                ratingText.textContent = ratingMessages[currentRating];
                submitBtn.disabled = false;
            });
            
            star.addEventListener('mouseenter', () => {
                highlightStars(index + 1);
            });
        });
        
        notification.addEventListener('mouseleave', () => {
            updateStars();
        });
        
        function updateStars() {
            stars.forEach((star, index) => {
                if (index < currentRating) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
        }
        
        function highlightStars(rating) {
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
        }
        
        // Função global para submeter avaliação
        window.submitRating = function(gameType) {
            const comment = document.getElementById('gameComment').value.trim();
            
            // Simular salvamento da avaliação
            const rating = {
                game: gameType,
                stars: currentRating,
                comment: comment,
                timestamp: new Date().toISOString()
            };
            
            // Salvar no localStorage
            const existingRatings = JSON.parse(localStorage.getItem('gameRatings') || '[]');
            existingRatings.push(rating);
            localStorage.setItem('gameRatings', JSON.stringify(existingRatings));
            
            // Mostrar mensagem de sucesso
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-check-circle" style="color: #00ff00;"></i>
                    <h3>Obrigado pela avaliação!</h3>
                    <p>Sua opinião é muito importante para nós.</p>
                    <div style="color: #8400FF; margin: 15px 0;">
                        ${currentRating} estrela${currentRating !== 1 ? 's' : ''} para ${gameType.toUpperCase()}
                    </div>
                    ${comment ? `<div style="color: #b0b0b0; font-style: italic; margin: 10px 0;">"${comment}"</div>` : ''}
                    <button onclick="this.closest('.game-notification').remove()" class="btn btn-primary">
                        Continuar
                    </button>
                </div>
            `;
            
            notification.style.animation = 'successPulse 0.6s ease';
            
            // Remove automaticamente após 3 segundos
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                    style.remove();
                }
            }, 3000);
        };
        
        // Remove automaticamente após 30 segundos se não interagir
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
                style.remove();
            }
        }, 30000);
    }
    
    // ===== SISTEMA DE LOGIN/REGISTRO =====
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            showAuthModal('login');
        });
        console.log('✅ Botão de login configurado');
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            showAuthModal('register');
        });
        console.log('✅ Botão de registro configurado');
    }
    
    function showAuthModal(type) {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        
        const isLogin = type === 'login';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <div class="auth-header">
                    <h2>${isLogin ? 'LOGIN' : 'CADASTRAR'}</h2>
                    <button class="close-btn">&times;</button>
                </div>
                
                <form class="auth-form">
                    ${!isLogin ? '<input type="text" placeholder="Nome completo" required>' : ''}
                    <input type="email" placeholder="E-mail" required>
                    <input type="password" placeholder="Senha" required>
                    ${!isLogin ? '<input type="password" placeholder="Confirmar senha" required>' : ''}
                    
                    <button type="submit" class="btn btn-primary auth-submit">
                        ${isLogin ? 'ENTRAR' : 'CADASTRAR'}
                    </button>
                </form>
                
                <div class="auth-switch">
                    <p>
                        ${isLogin ? 'Não tem conta?' : 'Já tem conta?'}
                        <a href="#" class="switch-link">
                            ${isLogin ? 'Cadastre-se' : 'Faça login'}
                        </a>
                    </p>
                </div>
            </div>
        `;
        
        // Estilos do modal (mesmos estilos do original)
        const style = document.createElement('style');
        style.textContent = `
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
                animation: modalIn 0.3s ease;
            }
            
            .auth-modal-content {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                padding: 30px;
                border-radius: 15px;
                border: 2px solid #8400FF;
                width: 90%;
                max-width: 400px;
                box-shadow: 0 20px 40px rgba(132, 0, 255, 0.3);
            }
            
            .auth-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
            }
            
            .auth-header h2 {
                color: white;
                font-family: 'Orbitron', monospace;
                font-size: 1.5rem;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: #8400FF;
                font-size: 2rem;
                cursor: pointer;
                transition: color 0.3s ease;
            }
            
            .close-btn:hover {
                color: #00D4FF;
            }
            
            .auth-form {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .auth-form input {
                padding: 12px 15px;
                background: rgba(0, 0, 0, 0.5);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: white;
                font-family: 'Orbitron', monospace;
                transition: border-color 0.3s ease;
            }
            
            .auth-form input:focus {
                outline: none;
                border-color: #8400FF;
            }
            
            .auth-form input::placeholder {
                color: #b0b0b0;
                opacity: 0.7;
            }
            
            .auth-submit {
                margin-top: 10px;
                width: 100%;
            }
            
            .auth-switch {
                text-align: center;
                margin-top: 20px;
                color: #b0b0b0;
            }
            
            .switch-link {
                color: #8400FF;
                text-decoration: none;
                font-weight: bold;
                transition: color 0.3s ease;
            }
            
            .switch-link:hover {
                color: #00D4FF;
            }
            
            @keyframes modalIn {
                0% {
                    opacity: 0;
                    transform: scale(0.9);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Event listeners do modal
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                style.remove();
            }
        });
        
        modal.querySelector('.switch-link').addEventListener('click', (e) => {
            e.preventDefault();
            modal.remove();
            style.remove();
            showAuthModal(isLogin ? 'register' : 'login');
        });
        
        modal.querySelector('.auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = modal.querySelector('.auth-submit');
            submitBtn.textContent = 'PROCESSANDO...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                modal.remove();
                style.remove();
                showSuccessMessage(isLogin ? 'Login realizado com sucesso!' : 'Cadastro realizado com sucesso!');
            }, 2000);
        });
    }

    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .success-message {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(45deg, #28a745, #20c997);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-family: 'Orbitron', monospace;
                font-weight: bold;
                z-index: 10000;
                animation: slideInRight 0.5s ease;
                box-shadow: 0 10px 20px rgba(40, 167, 69, 0.3);
            }
            
            @keyframes slideInRight {
                0% {
                    opacity: 0;
                    transform: translateX(100%);
                }
                100% {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
            style.remove();
        }, 4000);
    }
    
    // ===== EFEITOS VISUAIS ADICIONAIS =====
    
    // Efeito hover nos cards dos jogos (com proteção)
    if (gameCards.length > 0) {
        gameCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
                
                // Efeito sonoro simulado
                createSoundEffect();
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
        console.log(`✅ Efeitos hover adicionados a ${gameCards.length} cards de jogos`);
    }
    
    function createSoundEffect() {
        // Cria um efeito visual que simula som
        const soundEffect = document.createElement('div');
        soundEffect.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: #8400FF;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: soundPulse 0.3s ease-out forwards;
        `;
        
        soundEffect.style.left = Math.random() * window.innerWidth + 'px';
        soundEffect.style.top = Math.random() * window.innerHeight + 'px';
        
        document.body.appendChild(soundEffect);
        
        setTimeout(() => {
            soundEffect.remove();
        }, 300);
    }
    
    // Adiciona animação CSS para o efeito sonoro
    const soundEffectStyle = document.createElement('style');
    soundEffectStyle.textContent = `
        @keyframes soundPulse {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            100% {
                transform: scale(10);
                opacity: 0;
            }
        }
        
        @keyframes fadeInUp {
            0% {
                opacity: 0;
                transform: translateY(30px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    
    document.head.appendChild(soundEffectStyle);
    
    // ===== FUNÇÕES UTILITÁRIAS =====
    
    // Função para ver avaliações salvas
    function viewGameRatings() {
        const ratings = JSON.parse(localStorage.getItem('gameRatings') || '[]');
        if (ratings.length === 0) {
            alert('Nenhuma avaliação encontrada!');
            return;
        }
        
        const ratingsWindow = window.open('', '_blank', 'width=600,height=400');
        ratingsWindow.document.write(`
            <html>
            <head>
                <title>Avaliações dos Jogos</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background: #1a1a2e; color: white; }
                    .rating { border: 1px solid #8400FF; padding: 15px; margin: 10px 0; border-radius: 8px; }
                    .stars { color: #FFD700; font-size: 1.2em; }
                    .game-name { color: #8400FF; font-weight: bold; }
                    .comment { font-style: italic; color: #b0b0b0; margin-top: 10px; }
                    .timestamp { font-size: 0.8em; color: #888; }
                </style>
            </head>
            <body>
                <h2>📊 Suas Avaliações</h2>
                ${ratings.map(rating => `
                    <div class="rating">
                        <div class="game-name">${rating.game.toUpperCase()}</div>
                        <div class="stars">${'⭐'.repeat(rating.stars)} (${rating.stars}/5)</div>
                        ${rating.comment ? `<div class="comment">"${rating.comment}"</div>` : ''}
                        <div class="timestamp">${new Date(rating.timestamp).toLocaleString()}</div>
                    </div>
                `).join('')}
            </body>
            </html>
        `);
    }
    
    // Disponibiliza a função globalmente
    window.viewGameRatings = viewGameRatings;
    
    // ===== INICIALIZAÇÃO =====
    
    // Aplica filtro inicial (com proteção)
    if (searchInput) {
        filterGames();
    }
    
    // Adiciona efeito de entrada aos elementos
    function animateOnLoad() {
        if (gameCards.length === 0) return;
        
        gameCards.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.6s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    animateOnLoad();
    
    // ===== TRATAMENTO DE ERROS =====
    window.addEventListener('error', function(e) {
        console.warn('ConatusGames: Erro capturado:', e.message);
    });
    
    // ===== RESPONSIVIDADE DINÂMICA =====
    function handleResize() {
        // Ajusta layout para mobile
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile-layout');
        } else {
            document.body.classList.remove('mobile-layout');
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Executa na carga inicial
    
    // ===== FUNÇÃO DE TESTE PARA DEBUG =====
    window.conatusDebug = function() {
        console.log('🔍 Debug ConatusGames:');
        console.log('📝 Campo de busca:', searchInput ? '✅' : '❌');
        console.log('🔘 Botões de filtro:', filterButtons.length);
        console.log('🎮 Cards de jogos:', gameCards.length);
        console.log('🎯 Botões de jogar:', gamePlayButtons.length);
        console.log('🔧 Botão expandir:', expandBtn ? '✅' : '❌');
        console.log('📱 Login/Registro:', loginBtn ? '✅' : '❌', registerBtn ? '✅' : '❌');
        
        // Testa o sistema de avaliação
        if (gameCards.length > 0) {
            console.log('🧪 Testando sistema de avaliação...');
            showGameRating('teste');
        }
        
        return {
            searchInput: !!searchInput,
            filterButtons: filterButtons.length,
            gameCards: gameCards.length,
            gamePlayButtons: gamePlayButtons.length,
            expandBtn: !!expandBtn,
            loginBtn: !!loginBtn,
            registerBtn: !!registerBtn
        };
    };
    
    // ===== LOG DE INICIALIZAÇÃO =====
    console.log('🎮 ConatusGames JavaScript carregado com sucesso!');
    console.log('📊 Status dos elementos:');
    console.log('   📝 Campo busca:', searchInput ? '✅' : '❌');
    console.log('   🔘 Filtros:', filterButtons.length);
    console.log('   🎮 Jogos:', gameCards.length);
    console.log('   🎯 Botões jogar:', gamePlayButtons.length);
    console.log('');
    console.log('💡 Para debugar, digite: conatusDebug()');
    console.log('📊 Para ver avaliações, digite: viewGameRatings()');
    
    // ===== VERIFICAÇÃO FINAL =====
    if (gameCards.length === 0) {
        console.warn('⚠️ ATENÇÃO: Nenhum card de jogo encontrado!');
        console.warn('   Certifique-se de ter elementos com a classe "game-card"');
    }
    
    if (filterButtons.length === 0) {
        console.warn('⚠️ ATENÇÃO: Nenhum botão de filtro encontrado!');
        console.warn('   Certifique-se de ter elementos com a classe "filter-btn"');
    }
    
    if (!searchInput) {
        console.warn('⚠️ ATENÇÃO: Campo de busca não encontrado!');
        console.warn('   Certifique-se de ter um elemento com id "searchInput"');
    }
    
});