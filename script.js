// ===== CONATUSGAMES - JAVASCRIPT CORRIGIDO E ROBUSTO =====

// Configuração de Debug
const DEBUG_MODE = true; // Mude para false em produção
const LOG_PREFIX = '🎮 ConatusGames:';

// Sistema de Log Condicional
function debugLog(message, data = null) {
    if (DEBUG_MODE) {
        if (data) {
            console.log(`${LOG_PREFIX} ${message}`, data);
        } else {
            console.log(`${LOG_PREFIX} ${message}`);
        }
    }
}

// Verificação de Compatibilidade do Navegador
function checkBrowserCompatibility() {
    const features = {
        cssAnimation: CSS.supports('animation', 'test 1s'),
        cssTransform: CSS.supports('transform', 'translateZ(0)'),
        cssFilter: CSS.supports('filter', 'blur(10px)'),
        backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
        webGL: !!document.createElement('canvas').getContext('webgl'),
        localStorage: (() => {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch {
                return false;
            }
        })()
    };
    
    debugLog('Compatibilidade do navegador:', features);
    return features;
}

// Inicialização Principal
document.addEventListener('DOMContentLoaded', function() {
    debugLog('DOM Carregado - Iniciando sistemas...');
    
    // Verificar compatibilidade
    const compatibility = checkBrowserCompatibility();
    
    // ===== VARIÁVEIS GLOBAIS =====
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const gameCards = document.querySelectorAll('.game-card');
    const expandBtn = document.getElementById('expandBtn');
    const hiddenCategories = document.getElementById('hiddenCategories');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const gamePlayButtons = document.querySelectorAll('.game-play-btn');
    const particlesContainer = document.getElementById('particlesContainer');
    const modalContainer = document.getElementById('modalContainer');
    
    let isExpanded = false;
    let activeFilter = 'all';
    let particleCount = 0;
    let modalCount = 0;
    let particleInterval = null;
    
    // ===== SISTEMA DE PARTÍCULAS CORRIGIDO =====
    function createParticle() {
        try {
            // Verificar se o container existe
            if (!particlesContainer) {
                debugLog('❌ Container de partículas não encontrado!');
                return false;
            }
            
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Aplicar estilos inline como fallback
            const colors = ['#8400FF', '#00D4FF', '#FF0080', '#FF6B35', '#28A745'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 6 + 3;
            const leftPosition = Math.random() * window.innerWidth;
            const duration = Math.random() * 15 + 8;
            const delay = Math.random() * 3;
            
            // Estilos inline forçados para garantir visibilidade
            particle.style.cssText = `
                position: absolute !important;
                width: ${size}px !important;
                height: ${size}px !important;
                background: ${color} !important;
                border-radius: 50% !important;
                left: ${leftPosition}px !important;
                bottom: -10px !important;
                pointer-events: none !important;
                z-index: 2 !important;
                opacity: 0 !important;
                animation: float ${duration}s ${delay}s infinite linear !important;
                will-change: transform, opacity !important;
                transform: translateZ(0) !important;
            `;
            
            // Adicionar classe de debug se necessário
            if (DEBUG_MODE && particleCount < 5) {
                particle.classList.add('particle-visible');
                debugLog(`✅ Partícula ${particleCount + 1} criada:`, {
                    color,
                    size: `${size}px`,
                    position: `${leftPosition}px`,
                    duration: `${duration}s`
                });
            }
            
            particlesContainer.appendChild(particle);
            particleCount++;
            
            // Atualizar contador no debug panel
            updateDebugCounter('particleCount', particleCount);
            
            // Remover após a animação
            setTimeout(() => {
                if (particle && particle.parentNode) {
                    particle.remove();
                    particleCount--;
                    updateDebugCounter('particleCount', particleCount);
                }
            }, (duration + delay) * 1000);
            
            return true;
        } catch (error) {
            debugLog('❌ Erro ao criar partícula:', error);
            return false;
        }
    }
    
    // Sistema contínuo de partículas com verificação
    function startParticleSystem() {
        if (!compatibility.cssAnimation) {
            debugLog('⚠️ Animações CSS não suportadas - partículas desativadas');
            return;
        }
        
        // Criar partícula inicial
        createParticle();
        
        // Criar partículas continuamente
        particleInterval = setInterval(() => {
            if (particleCount < 20) { // Limitar número de partículas
                createParticle();
            }
        }, Math.random() * 2000 + 1000);
        
        debugLog('✅ Sistema de partículas iniciado');
    }
    
    // ===== SISTEMA DE BUSCA =====
    function filterGames() {
        try {
            const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const activeCategory = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            
            let visibleCount = 0;
            
            gameCards.forEach(card => {
                const gameTitle = card.querySelector('.game-title')?.textContent.toLowerCase() || '';
                const gameDescription = card.querySelector('.game-description')?.textContent.toLowerCase() || '';
                const gameCategory = card.dataset.category || '';
                
                const matchesSearch = !searchTerm || 
                                    gameTitle.includes(searchTerm) || 
                                    gameDescription.includes(searchTerm);
                
                const matchesCategory = activeCategory === 'all' || gameCategory === activeCategory;
                
                if (matchesSearch && matchesCategory) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            updateGameCount(visibleCount);
            debugLog(`Filtro aplicado: ${visibleCount} jogos visíveis`);
        } catch (error) {
            debugLog('❌ Erro no sistema de busca:', error);
        }
    }
    
    // Contador de jogos visíveis
    function updateGameCount(count = null) {
        try {
            const gamesTitle = document.querySelector('.games-header h2');
            if (!gamesTitle) return;
            
            if (count === null) {
                count = Array.from(gameCards).filter(card => 
                    card.style.display !== 'none'
                ).length;
            }
            
            const searchTerm = searchInput?.value.trim() || '';
            const activeCategory = document.querySelector('.filter-btn.active')?.textContent || 'TODOS';
            
            if (searchTerm) {
                gamesTitle.textContent = `${count} JOGO${count !== 1 ? 'S' : ''} ENCONTRADO${count !== 1 ? 'S' : ''}`;
            } else if (activeCategory !== 'TODOS') {
                gamesTitle.textContent = `${count} JOGO${count !== 1 ? 'S' : ''} DE ${activeCategory}`;
            } else {
                gamesTitle.textContent = 'ESCOLHA SEU JOGO';
            }
        } catch (error) {
            debugLog('❌ Erro ao atualizar contador:', error);
        }
    }
    
    // Event listeners para busca
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
    }
    
    // ===== SISTEMA DE FILTROS =====
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            try {
                filterButtons.forEach(button => button.classList.remove('active'));
                this.classList.add('active');
                activeFilter = this.dataset.filter;
                filterGames();
                
                // Efeito visual
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                debugLog(`Filtro ativo: ${activeFilter}`);
            } catch (error) {
                debugLog('❌ Erro no sistema de filtros:', error);
            }
        });
    });
    
    // ===== EXPANSÃO DE CATEGORIAS =====
    if (expandBtn && hiddenCategories) {
        expandBtn.addEventListener('click', function() {
            try {
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
                
                debugLog(`Categorias expandidas: ${isExpanded}`);
            } catch (error) {
                debugLog('❌ Erro ao expandir categorias:', error);
            }
        });
    }
    
    // ===== SISTEMA DE JOGOS CORRIGIDO =====
    gamePlayButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            try {
                e.preventDefault();
                const gameCard = this.closest('.game-card');
                const gameType = gameCard?.dataset.game || 'unknown';
                
                // Efeito visual
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                debugLog(`Iniciando jogo: ${gameType}`);
                showGameLoading(gameType, gameCard);
            } catch (error) {
                debugLog('❌ Erro ao iniciar jogo:', error);
            }
        });
    });
    
    function showGameLoading(gameType, gameCard) {
        try {
            const gameName = gameCard?.querySelector('.game-title')?.textContent || 'Jogo';
            
            // Criar overlay com z-index máximo garantido
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'game-loading-overlay';
            loadingOverlay.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: rgba(15, 15, 35, 0.98) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 999998 !important;
                backdrop-filter: blur(10px) !important;
            `;
            
            loadingOverlay.innerHTML = `
                <div class="loading-content" style="
                    text-align: center;
                    color: white;
                    max-width: 400px;
                    padding: 40px;
                    background: rgba(0, 0, 0, 0.9);
                    border-radius: 20px;
                    border: 2px solid #8400FF;
                    box-shadow: 0 20px 40px rgba(132, 0, 255, 0.3);
                ">
                    <div class="loading-spinner" style="
                        width: 50px;
                        height: 50px;
                        border: 3px solid rgba(132, 0, 255, 0.3);
                        border-top: 3px solid #8400FF;
                        border-radius: 50%;
                        animation: spin 2s linear infinite;
                        margin: 0 auto 20px;
                    "></div>
                    <h3 style="font-family: 'Orbitron', monospace;">Carregando ${gameName}...</h3>
                    <p style="color: #b0b0b0;">Preparando seu jogo clássico</p>
                    <div style="
                        width: 100%;
                        height: 8px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 4px;
                        overflow: hidden;
                        margin-top: 20px;
                    ">
                        <div style="
                            width: 0%;
                            height: 100%;
                            background: linear-gradient(90deg, #8400FF, #00D4FF);
                            border-radius: 4px;
                            animation: loadProgress 3s ease-out forwards;
                        "></div>
                    </div>
                </div>
            `;
            
            // Adicionar ao modalContainer ou body
            const container = modalContainer || document.body;
            container.appendChild(loadingOverlay);
            
            modalCount++;
            updateDebugCounter('modalCount', modalCount);
            debugLog(`✅ Modal de loading criado para ${gameType}`);
            
            // Simular carregamento
            setTimeout(() => {
                if (loadingOverlay && loadingOverlay.parentNode) {
                    loadingOverlay.remove();
                    modalCount--;
                    updateDebugCounter('modalCount', modalCount);
                    showGameNotification(gameType);
                }
            }, 3000);
            
        } catch (error) {
            debugLog('❌ Erro ao mostrar loading:', error);
        }
    }
    
    function showGameNotification(gameType) {
        try {
            const notification = document.createElement('div');
            notification.className = 'game-notification';
            notification.style.cssText = `
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                z-index: 999999 !important;
                background: rgba(0, 0, 0, 0.95) !important;
                padding: 30px !important;
                border-radius: 15px !important;
                border: 2px solid #8400FF !important;
                box-shadow: 0 20px 40px rgba(132, 0, 255, 0.5) !important;
                min-width: 350px !important;
                max-width: 450px !important;
            `;
            
            notification.innerHTML = `
                <div class="notification-content" style="text-align: center; color: white;">
                    <i class="fas fa-gamepad" style="font-size: 3rem; color: #8400FF; margin-bottom: 15px;"></i>
                    <h3 style="font-family: 'Orbitron', monospace; margin-bottom: 10px;">Avalie o ${gameType.toUpperCase()}!</h3>
                    <p style="color: #b0b0b0; margin-bottom: 20px;">Como você classifica este jogo?</p>
                    
                    <div class="rating-stars" id="ratingStars" style="display: flex; justify-content: center; gap: 5px; margin-bottom: 15px;">
                        <span class="star" data-rating="1" style="font-size: 2rem; cursor: pointer;">⭐</span>
                        <span class="star" data-rating="2" style="font-size: 2rem; cursor: pointer;">⭐</span>
                        <span class="star" data-rating="3" style="font-size: 2rem; cursor: pointer;">⭐</span>
                        <span class="star" data-rating="4" style="font-size: 2rem; cursor: pointer;">⭐</span>
                        <span class="star" data-rating="5" style="font-size: 2rem; cursor: pointer;">⭐</span>
                    </div>
                    
                    <div class="rating-text" id="ratingText" style="color: #8400FF; font-weight: bold; margin-bottom: 15px; min-height: 20px;">
                        Clique nas estrelas para avaliar
                    </div>
                    
                    <textarea 
                        id="gameComment" 
                        placeholder="Deixe um comentário (opcional)..." 
                        maxlength="200"
                        style="
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
                        "
                    ></textarea>
                    
                    <div class="button-group" style="display: flex; gap: 10px; justify-content: center;">
                        <button id="submitRatingBtn" class="btn btn-primary" disabled style="
                            padding: 10px 20px;
                            background: linear-gradient(45deg, #8400FF, #a855f7);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-family: 'Orbitron', monospace;
                            font-weight: bold;
                            opacity: 0.5;
                        ">
                            Enviar Avaliação
                        </button>
                        <button id="skipRatingBtn" class="btn btn-secondary" style="
                            padding: 10px 20px;
                            background: rgba(255, 255, 255, 0.1);
                            color: #b0b0b0;
                            border: 1px solid rgba(255, 255, 255, 0.2);
                            border-radius: 8px;
                            cursor: pointer;
                            font-family: 'Orbitron', monospace;
                            font-weight: bold;
                        ">
                            Pular
                        </button>
                    </div>
                </div>
            `;
            
            // Adicionar ao modalContainer ou body
            const container = modalContainer || document.body;
            container.appendChild(notification);
            
            modalCount++;
            updateDebugCounter('modalCount', modalCount);
            debugLog(`✅ Modal de avaliação criado para ${gameType}`);
            
            // Setup das estrelas
            setupRatingStars(notification, gameType);
            
            // Setup dos botões
            const skipBtn = notification.querySelector('#skipRatingBtn');
            if (skipBtn) {
                skipBtn.addEventListener('click', () => {
                    notification.remove();
                    modalCount--;
                    updateDebugCounter('modalCount', modalCount);
                });
            }
            
            // Auto-remover após 30 segundos
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.remove();
                    modalCount--;
                    updateDebugCounter('modalCount', modalCount);
                }
            }, 30000);
            
        } catch (error) {
            debugLog('❌ Erro ao mostrar notificação:', error);
        }
    }
    
    function setupRatingStars(notification, gameType) {
        try {
            const stars = notification.querySelectorAll('.star');
            const ratingText = notification.querySelector('#ratingText');
            const submitBtn = notification.querySelector('#submitRatingBtn');
            const comment = notification.querySelector('#gameComment');
            let currentRating = 0;
            
            const ratingMessages = {
                1: "Não gostei 😞",
                2: "Poderia ser melhor 😐",
                3: "Bom jogo! 😊",
                4: "Muito bom! 😍",
                5: "Incrível! ⭐"
            };
            
            stars.forEach((star, index) => {
                // Aplicar estilos iniciais
                star.style.filter = 'grayscale(100%)';
                star.style.opacity = '0.5';
                star.style.transition = 'all 0.3s ease';
                
                star.addEventListener('click', () => {
                    currentRating = index + 1;
                    updateStars();
                    if (ratingText) {
                        ratingText.textContent = ratingMessages[currentRating];
                    }
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                        submitBtn.style.cursor = 'pointer';
                    }
                    debugLog(`Avaliação selecionada: ${currentRating} estrelas`);
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
                        star.style.filter = 'grayscale(0%)';
                        star.style.opacity = '1';
                        star.style.transform = 'scale(1.1)';
                    } else {
                        star.style.filter = 'grayscale(100%)';
                        star.style.opacity = '0.5';
                        star.style.transform = 'scale(1)';
                    }
                });
            }
            
            function highlightStars(rating) {
                stars.forEach((star, index) => {
                    if (index < rating) {
                        star.style.filter = 'grayscale(0%)';
                        star.style.opacity = '1';
                        star.style.transform = 'scale(1.2)';
                    } else {
                        star.style.filter = 'grayscale(100%)';
                        star.style.opacity = '0.5';
                        star.style.transform = 'scale(1)';
                    }
                });
            }
            
            // Setup do botão de submit
            if (submitBtn) {
                submitBtn.addEventListener('click', () => {
                    submitRating(gameType, currentRating, comment?.value || '', notification);
                });
            }
            
        } catch (error) {
            debugLog('❌ Erro ao configurar estrelas:', error);
        }
    }
    
    function submitRating(gameType, rating, comment, notification) {
        try {
            const ratingData = {
                game: gameType,
                stars: rating,
                comment: comment.trim(),
                timestamp: new Date().toISOString()
            };
            
            // Salvar no localStorage se disponível
            if (compatibility.localStorage) {
                const existingRatings = JSON.parse(localStorage.getItem('gameRatings') || '[]');
                existingRatings.push(ratingData);
                localStorage.setItem('gameRatings', JSON.stringify(existingRatings));
                debugLog('✅ Avaliação salva:', ratingData);
            }
            
            // Mostrar mensagem de sucesso
            notification.innerHTML = `
                <div class="notification-content" style="text-align: center; color: white; padding: 30px;">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: #00ff00; margin-bottom: 15px;"></i>
                    <h3 style="font-family: 'Orbitron', monospace; margin-bottom: 10px;">Obrigado pela avaliação!</h3>
                    <p style="color: #b0b0b0;">Sua opinião é muito importante para nós.</p>
                    <div style="color: #8400FF; margin: 15px 0; font-weight: bold;">
                        ${rating} estrela${rating !== 1 ? 's' : ''} para ${gameType.toUpperCase()}
                    </div>
                    ${comment ? `<div style="color: #b0b0b0; font-style: italic; margin: 10px 0;">"${comment}"</div>` : ''}
                    <button onclick="this.closest('.game-notification').remove()" style="
                        margin-top: 15px;
                        padding: 10px 20px;
                        background: linear-gradient(45deg, #8400FF, #a855f7);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-family: 'Orbitron', monospace;
                        font-weight: bold;
                    ">
                        Continuar
                    </button>
                </div>
            `;
            
            // Remover após 3 segundos
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.remove();
                    modalCount--;
                    updateDebugCounter('modalCount', modalCount);
                }
            }, 3000);
            
        } catch (error) {
            debugLog('❌ Erro ao enviar avaliação:', error);
        }
    }
    
    // ===== SISTEMA DE LOGIN/REGISTRO CORRIGIDO =====
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
        try {
            const modal = document.createElement('div');
            modal.className = 'auth-modal';
            modal.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: rgba(0, 0, 0, 0.95) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 999999 !important;
                backdrop-filter: blur(5px) !important;
            `;
            
            const isLogin = type === 'login';
            modal.innerHTML = `
                <div class="auth-modal-content" style="
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    padding: 30px;
                    border-radius: 15px;
                    border: 2px solid #8400FF;
                    width: 90%;
                    max-width: 400px;
                    box-shadow: 0 20px 40px rgba(132, 0, 255, 0.3);
                ">
                    <div class="auth-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 25px;
                    ">
                        <h2 style="color: white; font-family: 'Orbitron', monospace; font-size: 1.5rem;">
                            ${isLogin ? 'LOGIN' : 'CADASTRAR'}
                        </h2>
                        <button class="close-btn" style="
                            background: none;
                            border: none;
                            color: #8400FF;
                            font-size: 2rem;
                            cursor: pointer;
                        ">&times;</button>
                    </div>
                    
                    <form class="auth-form" style="display: flex; flex-direction: column; gap: 15px;">
                        ${!isLogin ? '<input type="text" placeholder="Nome completo" required style="padding: 12px 15px; background: rgba(0, 0, 0, 0.5); border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-family: \'Orbitron\', monospace;">' : ''}
                        <input type="email" placeholder="E-mail" required style="padding: 12px 15px; background: rgba(0, 0, 0, 0.5); border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-family: 'Orbitron', monospace;">
                        <input type="password" placeholder="Senha" required style="padding: 12px 15px; background: rgba(0, 0, 0, 0.5); border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-family: 'Orbitron', monospace;">
                        ${!isLogin ? '<input type="password" placeholder="Confirmar senha" required style="padding: 12px 15px; background: rgba(0, 0, 0, 0.5); border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-family: \'Orbitron\', monospace;">' : ''}
                        
                        <button type="submit" class="btn btn-primary auth-submit" style="
                            margin-top: 10px;
                            width: 100%;
                            padding: 12px;
                            background: linear-gradient(45deg, #8400FF, #a855f7);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-family: 'Orbitron', monospace;
                            font-weight: bold;
                        ">
                            ${isLogin ? 'ENTRAR' : 'CADASTRAR'}
                        </button>
                    </form>
                    
                    <div class="auth-switch" style="text-align: center; margin-top: 20px; color: #b0b0b0;">
                        <p>
                            ${isLogin ? 'Não tem conta?' : 'Já tem conta?'}
                            <a href="#" class="switch-link" style="color: #8400FF; text-decoration: none; font-weight: bold;">
                                ${isLogin ? 'Cadastre-se' : 'Faça login'}
                            </a>
                        </p>
                    </div>
                </div>
            `;
            
            // Adicionar ao modalContainer ou body
            const container = modalContainer || document.body;
            container.appendChild(modal);
            
            modalCount++;
            updateDebugCounter('modalCount', modalCount);
            debugLog(`✅ Modal de ${type} criado`);
            
            // Event listeners
            const closeBtn = modal.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.remove();
                    modalCount--;
                    updateDebugCounter('modalCount', modalCount);
                });
            }
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    modalCount--;
                    updateDebugCounter('modalCount', modalCount);
                }
            });
            
            const switchLink = modal.querySelector('.switch-link');
            if (switchLink) {
                switchLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    modal.remove();
                    modalCount--;
                    updateDebugCounter('modalCount', modalCount);
                    showAuthModal(isLogin ? 'register' : 'login');
                });
            }
            
            const form = modal.querySelector('.auth-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    handleAuthSubmit(modal, isLogin);
                });
            }
            
        } catch (error) {
            debugLog('❌ Erro ao mostrar modal de autenticação:', error);
        }
    }
    
    function handleAuthSubmit(modal, isLogin) {
        try {
            const submitBtn = modal.querySelector('.auth-submit');
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'PROCESSANDO...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    modal.remove();
                    modalCount--;
                    updateDebugCounter('modalCount', modalCount);
                    showSuccessMessage(isLogin ? 'Login realizado com sucesso!' : 'Cadastro realizado com sucesso!');
                }, 2000);
            }
        } catch (error) {
            debugLog('❌ Erro ao processar autenticação:', error);
        }
    }
    
    function showSuccessMessage(message) {
        try {
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.style.cssText = `
                position: fixed !important;
                top: 20px !important;
                right: 20px !important;
                background: linear-gradient(45deg, #28a745, #20c997) !important;
                color: white !important;
                padding: 15px 20px !important;
                border-radius: 10px !important;
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                font-family: 'Orbitron', monospace !important;
                font-weight: bold !important;
                z-index: 999999 !important;
                box-shadow: 0 10px 20px rgba(40, 167, 69, 0.3) !important;
            `;
            
            successDiv.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            `;
            
            document.body.appendChild(successDiv);
            debugLog(`✅ Mensagem de sucesso: ${message}`);
            
            setTimeout(() => {
                if (successDiv && successDiv.parentNode) {
                    successDiv.remove();
                }
            }, 4000);
            
        } catch (error) {
            debugLog('❌ Erro ao mostrar mensagem de sucesso:', error);
        }
    }
    
    // ===== EFEITOS VISUAIS ADICIONAIS =====
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (compatibility.cssTransform) {
                this.style.transform = 'translateY(-10px) scale(1.02) translateZ(0)';
            }
            createSoundEffect();
        });
        
        card.addEventListener('mouseleave', function() {
            if (compatibility.cssTransform) {
                this.style.transform = 'translateY(0) scale(1) translateZ(0)';
            }
        });
    });
    
    function createSoundEffect() {
        try {
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
        } catch (error) {
            debugLog('❌ Erro ao criar efeito sonoro:', error);
        }
    }
    
    // ===== FUNÇÕES DE DEBUG =====
    function updateDebugCounter(counterId, value) {
        if (DEBUG_MODE) {
            const counter = document.getElementById(counterId);
            if (counter) {
                counter.textContent = value;
            }
        }
    }
    
    // ===== FUNÇÕES GLOBAIS PARA DEBUG =====
    window.testParticles = function() {
        debugLog('🎯 Teste manual de partículas');
        for(let i = 0; i < 10; i++) {
            setTimeout(() => createParticle(), i * 100);
        }
    };
    
    window.testModal = function() {
        debugLog('🎯 Teste manual de modal');
        showGameNotification('teste');
    };
    
    window.testAnimation = function() {
        debugLog('🎯 Teste manual de animação');
        const cards = document.querySelectorAll('.game-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'pulse 1s ease';
                setTimeout(() => {
                    card.style.animation = '';
                }, 1000);
            }, index * 100);
        });
    };
    
    window.clearDebug = function() {
        debugLog('🧹 Limpando elementos de teste');
        document.querySelectorAll('.particle').forEach(el => el.remove());
        document.querySelectorAll('.auth-modal').forEach(el => el.remove());
        document.querySelectorAll('.game-notification').forEach(el => el.remove());
        document.querySelectorAll('.game-loading-overlay').forEach(el => el.remove());
        particleCount = 0;
        modalCount = 0;
        updateDebugCounter('particleCount', 0);
        updateDebugCounter('modalCount', 0);
    };
    
    window.toggleDebug = function() {
        const panel = document.getElementById('debugPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    };
    
    // ===== INICIALIZAÇÃO =====
    function initializeAnimations() {
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
    
    function handleResize() {
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile-layout');
        } else {
            document.body.classList.remove('mobile-layout');
        }
    }
    
    // ===== TRATAMENTO DE ERROS GLOBAL =====
    window.addEventListener('error', function(e) {
        debugLog('❌ Erro global capturado:', e.message);
        // Não interromper a execução
        return true;
    });
    
    // ===== EXECUTAR INICIALIZAÇÃO =====
    try {
        // Iniciar sistemas
        startParticleSystem();
        filterGames();
        initializeAnimations();
        handleResize();
        
        // Event listeners
        window.addEventListener('resize', handleResize);
        
        debugLog('✅ Todos os sistemas iniciados com sucesso!');
        debugLog('📊 Compatibilidade:', compatibility);
        
        // Verificar elementos críticos
        debugLog('🔍 Verificação de elementos:', {
            particlesContainer: !!particlesContainer,
            modalContainer: !!modalContainer,
            gameCards: gameCards.length,
            filterButtons: filterButtons.length
        });
        
    } catch (error) {
        debugLog('❌ Erro na inicialização:', error);
    }
});

// Log de carregamento do script
console.log('🎮 ConatusGames JavaScript v2.0 - Versão Corrigida e Robusta');
console.log('📝 Debug Mode:', DEBUG_MODE ? 'ATIVADO' : 'DESATIVADO');
console.log('💡 Dica: Use as funções globais testParticles(), testModal(), testAnimation() para testar');