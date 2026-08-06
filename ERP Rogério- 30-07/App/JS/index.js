// ========================================
// DASHBOARD ERP IMS - INDEX
// ========================================

(function() {
    "use strict";

    // ========================================
    // CONTROLE DE TEMA
    // ========================================
    
    function toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeBtn = document.querySelector('.theme-toggle');
        if (themeBtn) {
            themeBtn.textContent = newTheme === 'light' ? '🌙' : '☀️';
        }
        
        if (window.ERPStore) {
            window.ERPStore.setTheme(newTheme);
        }
        
        showToast(`Modo ${newTheme === 'light' ? 'claro' : 'escuro'} ativado`, 'info');
        updateChartColors();
    }
    
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeBtn = document.querySelector('.theme-toggle');
        if (themeBtn) {
            themeBtn.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }
    
    loadTheme();

    // ========================================
    // TOAST
    // ========================================
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { 
            success: '✅', 
            error: '❌', 
            info: 'ℹ️', 
            warning: '⚠️' 
        };
        toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // ========================================
    // FUNDO TECNOLÓGICO
    // ========================================
    function criarBolinhas() {
        const container = document.getElementById('particles');
        if (!container) return;
        container.innerHTML = '';
        
        const numBolinhas = 60;
        const cores = [
            'rgba(255, 204, 102, 0.2)',
            'rgba(255, 214, 128, 0.15)',
            'rgba(255, 224, 160, 0.12)',
            'rgba(230, 184, 76, 0.12)',
        ];
        
        const animacoes = [
            'moveRandom1', 'moveRandom2', 'moveRandom3', 
            'moveRandom4', 'moveRandom5', 'moveRandom6'
        ];
        
        for (let i = 0; i < numBolinhas; i++) {
            const bolinha = document.createElement('div');
            bolinha.className = 'particle';
            const tamanho = Math.random() * 12 + 3;
            bolinha.style.width = tamanho + 'px';
            bolinha.style.height = tamanho + 'px';
            bolinha.style.left = Math.random() * 100 + '%';
            bolinha.style.top = Math.random() * 100 + '%';
            const corIndex = Math.floor(Math.random() * cores.length);
            bolinha.style.background = cores[corIndex];
            bolinha.style.boxShadow = `0 0 ${tamanho * 2}px ${cores[corIndex]}`;
            const animacao = animacoes[Math.floor(Math.random() * animacoes.length)];
            const duracao = Math.random() * 15 + 15;
            const delay = Math.random() * 10;
            bolinha.style.animation = `${animacao} ${duracao}s ease-in-out ${delay}s infinite`;
            bolinha.style.opacity = Math.random() * 0.3 + 0.1;
            container.appendChild(bolinha);
        }
    }

    criarBolinhas();

    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(criarBolinhas, 500);
    });

    // ========================================
    // UTILITÁRIOS
    // ========================================
    function formatarDataHora(dt) {
        if (!dt) return '—';
        try {
            const d = new Date(dt);
            if (isNaN(d.getTime())) return dt;
            return d.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (_) {
            return dt;
        }
    }

    // ========================================
    // ATUALIZAR DASHBOARD
    // ========================================
    let chartMovimento = null;
    let chartProdutos = null;

    function atualizarDashboard() {
        if (!window.ERPStore) {
            console.warn('Store não disponível');
            return;
        }
        
        const stats = window.ERPStore.getStats();
        
        // Atualizar cards
        const totalEl = document.getElementById('totalProdutos');
        const baixoEl = document.getElementById('estoqueBaixo');
        const semEl = document.getElementById('semEstoque');
        const movEl = document.getElementById('movimentoHoje');
        
        if (totalEl) totalEl.textContent = stats.totalProdutos || 0;
        if (baixoEl) baixoEl.textContent = stats.estoqueBaixo || 0;
        if (semEl) semEl.textContent = stats.semEstoque || 0;
        if (movEl) movEl.textContent = stats.movHoje || 0;

        // Atualizar tabela
        atualizarTabelaMovimentacoes(stats.ultimasMovimentacoes);
        
        // Atualizar gráficos
        atualizarGraficos();
    }

    function atualizarTabelaMovimentacoes(movimentacoes) {
        const tbody = document.getElementById('ultimasMovimentacoes');
        if (!tbody) return;

        if (movimentacoes && movimentacoes.length > 0) {
            tbody.innerHTML = movimentacoes.map(mov => `
                <tr>
                    <td><strong>${mov.produto || '—'}</strong></td>
                    <td>
                        <span class="badge-status ${mov.tipo || 'entrada'}">
                            ${mov.tipo === 'entrada' ? '📥 Entrada' : '📤 Saída'}
                        </span>
                    </td>
                    <td>${mov.quantidade || 0}</td>
                    <td>${mov.dataHora ? formatarDataHora(mov.dataHora) : '—'}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        <div class="icon">📭</div>
                        Nenhuma movimentação registrada
                    </td>
                </tr>
            `;
        }
    }

    function atualizarGraficos() {
        if (!window.ERPStore) return;
        
        const movs = window.ERPStore.getMovimentacoes() || [];
        
        // Gráfico de Movimentação
        const ctxMovimento = document.getElementById('graficoMovimento');
        if (ctxMovimento && typeof Chart !== 'undefined') {
            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
            const entradas = new Array(6).fill(0);
            const saidas = new Array(6).fill(0);
            
            movs.forEach(mov => {
                if (mov.dataHora) {
                    try {
                        const data = new Date(mov.dataHora);
                        const mes = data.getMonth();
                        if (mes >= 0 && mes < 6) {
                            if (mov.tipo === 'entrada') {
                                entradas[mes] += mov.quantidade || 0;
                            } else if (mov.tipo === 'saida') {
                                saidas[mes] += mov.quantidade || 0;
                            }
                        }
                    } catch (e) {
                        // Ignorar erros de data
                    }
                }
            });

            if (chartMovimento) chartMovimento.destroy();

            chartMovimento = new Chart(ctxMovimento, {
                type: 'line',
                data: {
                    labels: meses,
                    datasets: [{
                        label: '📥 Entradas',
                        data: entradas,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#10B981',
                        pointBorderColor: '#1A1814',
                        pointBorderWidth: 2,
                        pointRadius: 5
                    }, {
                        label: '📤 Saídas',
                        data: saidas,
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#EF4444',
                        pointBorderColor: '#1A1814',
                        pointBorderWidth: 2,
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#94a3b8',
                                font: { size: 11, weight: '600' },
                                boxWidth: 12,
                                padding: 15
                            }
                        }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            grid: { color: 'rgba(255,255,255,0.04)' }, 
                            ticks: { color: '#64748b' } 
                        },
                        x: { 
                            grid: { color: 'rgba(255,255,255,0.04)' }, 
                            ticks: { color: '#64748b' } 
                        }
                    }
                }
            });
        }

        // Gráfico de Produtos Mais Vendidos
        const ctxProdutos = document.getElementById('graficoProdutos');
        if (ctxProdutos && typeof Chart !== 'undefined') {
            const vendas = {};
            
            movs.filter(m => m.tipo === 'saida').forEach(m => {
                if (m.produto) {
                    vendas[m.produto] = (vendas[m.produto] || 0) + (m.quantidade || 0);
                }
            });

            const sorted = Object.entries(vendas)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            
            const labels = sorted.map(item => item[0]);
            const data = sorted.map(item => item[1]);

            if (chartProdutos) chartProdutos.destroy();

            chartProdutos = new Chart(ctxProdutos, {
                type: 'bar',
                data: {
                    labels: labels.length > 0 ? labels : ['Sem dados'],
                    datasets: [{
                        label: 'Vendas',
                        data: data.length > 0 ? data : [0],
                        backgroundColor: [
                            'rgba(99, 102, 241, 0.7)',
                            'rgba(139, 92, 246, 0.7)',
                            'rgba(168, 85, 247, 0.7)',
                            'rgba(99, 102, 241, 0.5)',
                            'rgba(139, 92, 246, 0.5)'
                        ],
                        borderColor: ['#6366f1', '#8b5cf6', '#a855f7', '#6366f1', '#8b5cf6'],
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#94a3b8',
                                font: { size: 11, weight: '600' },
                                boxWidth: 12,
                                padding: 15
                            }
                        }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            grid: { color: 'rgba(255,255,255,0.04)' }, 
                            ticks: { color: '#64748b' } 
                        },
                        x: { 
                            grid: { color: 'rgba(255,255,255,0.04)' }, 
                            ticks: { color: '#64748b' } 
                        }
                    }
                }
            });
        }
    }

    function updateChartColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
        
        if (chartMovimento) {
            chartMovimento.options.plugins.legend.labels.color = textColor;
            chartMovimento.options.scales.y.ticks.color = textColor;
            chartMovimento.options.scales.x.ticks.color = textColor;
            chartMovimento.options.scales.y.grid.color = gridColor;
            chartMovimento.options.scales.x.grid.color = gridColor;
            chartMovimento.update();
        }
        
        if (chartProdutos) {
            chartProdutos.options.plugins.legend.labels.color = textColor;
            chartProdutos.options.scales.y.ticks.color = textColor;
            chartProdutos.options.scales.x.ticks.color = textColor;
            chartProdutos.options.scales.y.grid.color = gridColor;
            chartProdutos.options.scales.x.grid.color = gridColor;
            chartProdutos.update();
        }
    }

    // ========================================
    // EVENTOS
    // ========================================
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }

    // Observar mudanças de tema
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'data-theme') {
                setTimeout(updateChartColors, 100);
            }
        });
    });
    observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['data-theme'] 
    });

    // ========================================
    // INICIALIZAÇÃO
    // ========================================
    function inicializar() {
        console.log('🚀 Inicializando Dashboard...');
        
        if (window.ERPStore) {
            console.log('✅ Store encontrado');
            
            // Atualizar dashboard
            setTimeout(function() {
                atualizarDashboard();
                console.log('📊 Dashboard atualizado');
            }, 100);
            
            // Inscrever para mudanças
            window.ERPStore.subscribe(function(dados) {
                console.log('🔄 Store atualizado, atualizando dashboard...');
                atualizarDashboard();
            });
            
            console.log(`📊 ${window.ERPStore.getProdutos().length} produtos, ${window.ERPStore.getMovimentacoes().length} movimentações`);
        } else {
            console.warn('⚠️ Store não encontrado');
            showToast('⚠️ Sistema não inicializado corretamente', 'error');
            
            // Fallback
            const fallback = {
                totalProdutos: 0,
                estoqueBaixo: 0,
                semEstoque: 0,
                movHoje: 0
            };
            
            document.getElementById('totalProdutos').textContent = fallback.totalProdutos;
            document.getElementById('estoqueBaixo').textContent = fallback.estoqueBaixo;
            document.getElementById('semEstoque').textContent = fallback.semEstoque;
            document.getElementById('movimentoHoje').textContent = fallback.movHoje;
        }
        
        // Atualizar cores dos gráficos
        setTimeout(updateChartColors, 300);
    }

    // Inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

    console.log('🚀 Dashboard ERP IMS carregado com sucesso!');

})();