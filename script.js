// ===== CONATUSGAMES - JAVASCRIPT PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== VARIÁVEIS GLOBAIS =====
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const gameCards = document.querySelectorAll('.game-card');
    const expandBtn = document.getElementById('expandBtn');
    const hiddenCategories = document.getElementById('hiddenCategories');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const gamePlayButtons = document.querySelectorAll('.game-play-btn');
    
    let isExpanded = false;
    let activeFilter = 'all';
    
    // ===== SISTEMA DE PARTÍCULAS FLUTUANTES =====
    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Posição aleatória horizontal
        particle.style.left = Math.random() * 100 + '%';
        
        // Cores aleatórias das partículas
        const colors = ['#8400FF', '#00D4FF', '#FF0080', '#FF6B35', '#28A745'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Tamanho aleatório
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Duração da animação aleatória
        particle.style.animationDuration = (Math.random() * 15 + 8) + 's';
        particle.style.animationDelay = Math.random() * 3 + 's';
        
        document.querySelector('.particles-container').appendChild(particle);
        
        // Remove a partícula após a animação
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 18000);
    }
    
    // Cria partículas continuamente
    function startParticleSystem() {
        createParticle();
        setTimeout(startParticleSystem, Math.random() * 2000 + 1000);
    }
    
    startParticleSystem();
    
    // ===== SISTEMA DE BUSCA =====
    function filterGames() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const activeCategory = document.querySelector('.filter-btn.active').dataset.filter;
        
        gameCards.forEach(card => {
            const gameTitle = card.querySelector('.game-title').textContent.toLowerCase();
            const gameDescription = card.querySelector('.game-description').textContent.toLowerCase();
            const gameCategory = card.dataset.category;
            
            const matchesSearch = gameTitle.includes(searchTerm) || 
                                gameDescription.includes(searchTerm) ||
                                searchTerm === '';
            
            const matchesCategory = activeCategory === 'all' || gameCategory === activeCategory;
            
            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
                // Animação de entrada
                card.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Atualiza contador de jogos encontrados
        updateGameCount();
    }
    
    // Contador de jogos visíveis
    function updateGameCount() {
        const visibleGames = Array.from(gameCards).filter(card => 
            card.style.display !== 'none'
        ).length;
        
        // Atualiza o título da seção com o contador
        const gamesTitle = document.querySelector('.games-header h2');
        const searchTerm = searchInput.value.trim();
        const activeCategory = document.querySelector('.filter-btn.active').textContent;
        
        if (searchTerm) {
            gamesTitle.textContent = `${visibleGames} JOGO${visibleGames !== 1 ? 'S' : ''} ENCONTRADO${visibleGames !== 1 ? 'S' : ''}`;
        } else if (activeCategory !== 'TODOS') {
            gamesTitle.textContent = `${visibleGames} JOGO${visibleGames !== 1 ? 'S' : ''} DE ${activeCategory}`;
        } else {
            gamesTitle.textContent = 'ESCOLHA SEU JOGO';
        }
    }
    
    // Event listener para busca
    if (searchInput) {
        searchInput.addEventListener('input', filterGames);
        
        // Efeito visual no input de busca
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.05)';
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    }
    
    // ===== SISTEMA DE FILTROS =====
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active de todos os botões
            filterButtons.forEach(button => button.classList.remove('active'));
            
            // Adiciona active ao botão clicado
            this.classList.add('active');
            
            // Aplica o filtro
            activeFilter = this.dataset.filter;
            filterGames();
            
            // Efeito visual no botão
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
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
                this.querySelector('i').className = 'fas fa-times';
            } else {
                hiddenCategories.classList.remove('show');
                setTimeout(() => {
                    hiddenCategories.style.display = 'none';
                }, 300);
                this.classList.remove('active');
                this.querySelector('i').className = 'fas fa-plus';
            }
        });
    }
    
    // ===== SISTEMA DE JOGOS =====
    gamePlayButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const gameCard = this.closest('.game-card');
            const gameType = gameCard.dataset.game;
            
            // Efeito visual de clique
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Simula carregamento do jogo
            showGameLoading(gameType, gameCard);
        });
    });
    
    function showGameLoading(gameType, gameCard) {
        // Cria overlay de carregamento
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'game-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h3>Carregando ${gameCard.querySelector('.game-title').textContent}...</h3>
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
                animation: loadProgress 8s ease-in-out forwards;
            }
            
            @keyframes loadProgress {
                0% { width: 0%; }
                50% { width: 60%; }
                100% { width: 100%; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(loadingOverlay);
        
        // Simula tempo de carregamento
        setTimeout(() => {
            loadingOverlay.remove();
            style.remove();
            
            // Aqui seria onde o jogo real seria iniciado
            showGameNotification(gameType);
        }, 8000);
    }
    
    function showGameNotification(gameType) {
        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-gamepad"></i>
                <h3>Jogo em desenvolvimento!</h3>
                <p>O ${gameType.toUpperCase()} estará disponível em breve.</p>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary">
                    OK
                </button>
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
                min-width: 300px;
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
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
                style.remove();
            }
        }, 5000);
    }
    
    // ===== SISTEMA DE LOGIN/REGISTRO =====
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            showAuthModal('login');
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            showAuthModal('register');
        });
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
        
        // Estilos do modal
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
            
            // Simula processo de autenticação
            const submitBtn = modal.querySelector('.auth-submit');
            const originalText = submitBtn.textContent;
            
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
    
    // Efeito hover nos cards dos jogos
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
    
    // ===== INICIALIZAÇÃO =====
    
    // Aplica filtro inicial
    filterGames();
    
    // Adiciona efeito de entrada aos elementos
    function animateOnLoad() {
        const elements = document.querySelectorAll('.game-card');
        elements.forEach((el, index) => {
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
    
    console.log('🎮 ConatusGames JavaScript carregado com sucesso!');
});