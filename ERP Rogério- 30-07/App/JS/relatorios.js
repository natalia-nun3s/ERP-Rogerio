// ========================================
// RELATÓRIOS.JS - ERP IMS
// ========================================

(function() {
    "use strict";

    // ========================================
    // CONTROLE DE TEMA
    // ========================================
    function toggleTheme() {
        const html = document.documentElement;
        const newTheme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        document.querySelector('.theme-toggle').textContent = newTheme === 'light' ? '🌙' : '☀️';
        if (window.ERPStore) window.ERPStore.setTheme(newTheme);
        showToast(`Modo ${newTheme === 'light' ? 'claro' : 'escuro'} ativado`, 'info');
        setTimeout(atualizarGraficos, 200);
    }

    function loadTheme() {
        const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
        document.querySelector('.theme-toggle').textContent = theme === 'light' ? '🌙' : '☀️';
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
        const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
        toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // ========================================
    // PARTÍCULAS
    // ========================================
    function criarParticulas() {
        const container = document.getElementById('particles');
        if (!container) return;
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.width = (Math.random() * 3 + 1) + 'px';
            p.style.height = p.style.width;
            p.style.animationDuration = (Math.random() * 20 + 10) + 's';
            p.style.animationDelay = (Math.random() * 20) + 's';
            p.style.opacity = Math.random() * 0.5 + 0.1;
            container.appendChild(p);
        }
    }
    criarParticulas();

    // ========================================
    // RELÓGIO
    // ========================================
    function updateClock() {
        const now = new Date();
        const el = document.getElementById('headerTime');
        if (el) el.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ========================================
    // TABS
    // ========================================
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = {
        'visao-geral': document.getElementById('tab-visao-geral'),
        'historicos': document.getElementById('tab-historicos')
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            Object.keys(tabContents).forEach(key => {
                tabContents[key].style.display = key === this.dataset.tab ? 'block' : 'none';
            });
            
            if (this.dataset.tab === 'visao-geral') {
                setTimeout(atualizarGraficos, 100);
            }
        });
    });

    // ========================================
    // HISTÓRICO DE RELATÓRIOS
    // ========================================
    let relatorios = [];

    function carregarHistorico() {
        try {
            const dados = localStorage.getItem('erp_ims_relatorios');
            if (dados) relatorios = JSON.parse(dados);
        } catch (e) { relatorios = []; }
        renderizarHistorico();
    }

    function salvarHistorico() {
        try {
            localStorage.setItem('erp_ims_relatorios', JSON.stringify(relatorios));
        } catch (e) {}
    }

    function renderizarHistorico() {
        const tbody = document.getElementById('tabelaHistorico');
        const termo = document.getElementById('buscarHistorico').value.toLowerCase().trim();
        
        let filtrados = relatorios;
        if (termo) {
            filtrados = relatorios.filter(r => 
                r.nome.toLowerCase().includes(termo) ||
                r.tipo.toLowerCase().includes(termo) ||
                r.periodo.toLowerCase().includes(termo)
            );
        }

        if (filtrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="icon">📭</div>
                        ${relatorios.length === 0 ? 'Nenhum relatório gerado ainda' : 'Nenhum resultado encontrado'}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtrados.map((r, index) => `
            <tr>
                <td>#${index + 1}</td>
                <td><strong>${r.nome}</strong></td>
                <td>${r.tipo}</td>
                <td>${r.periodo}</td>
                <td>${r.data}</td>
                <td>
                    <button class="btn btn-sm btn-primary visualizar-relatorio" data-index="${index}">👁️</button>
                    <button class="btn btn-sm btn-danger excluir-relatorio" data-index="${index}">🗑</button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.visualizar-relatorio').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.dataset.index);
                const r = relatorios[idx];
                showToast(`📊 ${r.nome} - ${r.tipo} (${r.periodo})`, 'info');
            });
        });

        document.querySelectorAll('.excluir-relatorio').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.dataset.index);
                if (confirm(`⚠️ Tem certeza que deseja excluir "${relatorios[idx].nome}"?`)) {
                    relatorios.splice(idx, 1);
                    salvarHistorico();
                    renderizarHistorico();
                    showToast('🗑 Relatório excluído!', 'info');
                }
            });
        });
    }

    document.getElementById('buscarHistorico').addEventListener('input', renderizarHistorico);

    document.getElementById('limparHistorico').addEventListener('click', function() {
        if (relatorios.length === 0) {
            showToast('📭 Não há relatórios para limpar', 'info');
            return;
        }
        if (confirm('⚠️ Tem certeza que deseja limpar todo o histórico?')) {
            relatorios = [];
            salvarHistorico();
            renderizarHistorico();
            showToast('🗑 Histórico limpo!', 'info');
        }
    });

    // ========================================
    // MODAL RELATÓRIO
    // ========================================
    const modal = document.getElementById('modalRelatorio');

    document.getElementById('btnNovoRelatorio').addEventListener('click', () => {
        document.getElementById('formRelatorio').reset();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    document.getElementById('fecharModalRelatorio').addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    document.getElementById('cancelarRelatorio').addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    document.getElementById('salvarRelatorio').addEventListener('click', function() {
        const nome = document.getElementById('relNome').value.trim();
        const tipo = document.getElementById('relTipo').value;
        const periodo = document.getElementById('relPeriodo').value;
        const descricao = document.getElementById('relDescricao').value.trim();

        if (!nome) {
            showToast('⚠️ O nome do relatório é obrigatório!', 'error');
            return;
        }

        const tipos = {
            'movimentacao': '📈 Movimentação',
            'vendas': '💰 Vendas',
            'estoque': '📦 Estoque',
            'fornecedores': '🏭 Fornecedores'
        };

        const periodos = {
            'dia': '📅 Dia',
            'semana': '📅 Semana',
            'mes': '📅 Mês',
            'ano': '📅 Ano'
        };

        const novoRelatorio = {
            nome: nome,
            tipo: tipos[tipo] || tipo,
            periodo: periodos[periodo] || periodo,
            descricao: descricao || '—',
            data: new Date().toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        relatorios.push(novoRelatorio);
        salvarHistorico();
        renderizarHistorico();
        modal.classList.remove('active');
        document.body.style.overflow = '';
        showToast('✅ Relatório gerado com sucesso!', 'success');

        // Alternar para aba de histórico
        document.querySelector('.tab-btn[data-tab="historicos"]').click();
    });

    // ========================================
    // GRÁFICOS
    // ========================================
    let charts = {};

    function getChartColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            text: isDark ? '#94a3b8' : '#64748b',
            grid: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)',
            entradas: '#10B981',
            saidas: '#EF4444',
            primary: '#6366f1',
            secondary: '#8b5cf6',
            tertiary: '#a855f7'
        };
    }

    function atualizarGraficos() {
        if (!window.ERPStore) {
            setTimeout(atualizarGraficos, 500);
            return;
        }

        const stats = window.ERPStore.getStats();
        const colors = getChartColors();

        // 1. Movimentação Mensal
        const ctx1 = document.getElementById('graficoMovimentacaoMensal');
        if (ctx1 && typeof Chart !== 'undefined') {
            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
            const entradas = new Array(6).fill(0);
            const saidas = new Array(6).fill(0);
            
            const movs = window.ERPStore.getMovimentacoes() || [];
            movs.forEach(mov => {
                if (mov.dataHora) {
                    try {
                        const data = new Date(mov.dataHora);
                        const mes = data.getMonth();
                        if (mes >= 0 && mes < 6) {
                            if (mov.tipo === 'entrada') entradas[mes] += mov.quantidade || 0;
                            else if (mov.tipo === 'saida') saidas[mes] += mov.quantidade || 0;
                        }
                    } catch (e) {}
                }
            });

            if (charts.movimentacaoMensal) charts.movimentacaoMensal.destroy();
            charts.movimentacaoMensal = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: meses,
                    datasets: [
                        { label: 'Entradas', data: entradas, backgroundColor: 'rgba(16, 185, 129, 0.7)', borderColor: '#10B981', borderWidth: 2, borderRadius: 4 },
                        { label: 'Saídas', data: saidas, backgroundColor: 'rgba(239, 68, 68, 0.7)', borderColor: '#EF4444', borderWidth: 2, borderRadius: 4 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { labels: { color: colors.text, font: { size: 11, weight: '600' }, boxWidth: 12, padding: 15 } }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: colors.grid }, ticks: { color: colors.text } },
                        x: { grid: { color: colors.grid }, ticks: { color: colors.text } }
                    }
                }
            });
        }

        // 2. Top 5 Produtos
        const ctx2 = document.getElementById('graficoTopProdutos');
        if (ctx2 && typeof Chart !== 'undefined') {
            const movs = window.ERPStore.getMovimentacoes() || [];
            const vendas = {};
            movs.filter(m => m.tipo === 'saida').forEach(m => {
                if (m.produto) vendas[m.produto] = (vendas[m.produto] || 0) + (m.quantidade || 0);
            });
            const sorted = Object.entries(vendas).sort((a, b) => b[1] - a[1]).slice(0, 5);
            const labels = sorted.map(item => item[0]);
            const data = sorted.map(item => item[1]);

            if (charts.topProdutos) charts.topProdutos.destroy();
            charts.topProdutos = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: labels.length > 0 ? labels : ['Sem dados'],
                    datasets: [{
                        label: 'Vendas',
                        data: data.length > 0 ? data : [0],
                        backgroundColor: ['rgba(99, 102, 241, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(168, 85, 247, 0.7)', 'rgba(99, 102, 241, 0.5)', 'rgba(139, 92, 246, 0.5)'],
                        borderColor: ['#6366f1', '#8b5cf6', '#a855f7', '#6366f1', '#8b5cf6'],
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { labels: { color: colors.text, font: { size: 11, weight: '600' }, boxWidth: 12, padding: 15 } }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: colors.grid }, ticks: { color: colors.text } },
                        x: { grid: { color: colors.grid }, ticks: { color: colors.text } }
                    }
                }
            });
        }

        // 3. Resumo do Estoque
        const ctx3 = document.getElementById('graficoResumoEstoque');
        if (ctx3 && typeof Chart !== 'undefined') {
            const produtos = window.ERPStore.getProdutos() || [];
            const total = produtos.length;
            const baixo = produtos.filter(p => p.estoque > 0 && p.estoque <= p.minimo).length;
            const critico = produtos.filter(p => p.estoque === 0).length;
            const normal = total - baixo - critico;

            if (charts.resumoEstoque) charts.resumoEstoque.destroy();
            charts.resumoEstoque = new Chart(ctx3, {
                type: 'doughnut',
                data: {
                    labels: ['Normal', 'Baixo', 'Crítico'],
                    datasets: [{
                        data: [normal, baixo, critico],
                        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                        borderColor: ['#10B981', '#F59E0B', '#EF4444'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { labels: { color: colors.text, font: { size: 11, weight: '600' }, boxWidth: 12, padding: 15 } }
                    }
                }
            });
            document.getElementById('dataResumo').textContent = `Atualizado ${new Date().toLocaleTimeString('pt-BR')}`;
        }

        // 4. Entradas vs Saídas
        const ctx4 = document.getElementById('graficoEntradaSaida');
        if (ctx4 && typeof Chart !== 'undefined') {
            const movs = window.ERPStore.getMovimentacoes() || [];
            const entradas = movs.filter(m => m.tipo === 'entrada').reduce((s, m) => s + (m.quantidade || 0), 0);
            const saidas = movs.filter(m => m.tipo === 'saida').reduce((s, m) => s + (m.quantidade || 0), 0);

            if (charts.entradaSaida) charts.entradaSaida.destroy();
            charts.entradaSaida = new Chart(ctx4, {
                type: 'doughnut',
                data: {
                    labels: ['Entradas', 'Saídas'],
                    datasets: [{
                        data: [entradas, saidas],
                        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                        borderColor: ['#10B981', '#EF4444'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { labels: { color: colors.text, font: { size: 11, weight: '600' }, boxWidth: 12, padding: 15 } }
                    }
                }
            });
        }
    }

    // ========================================
    // EVENTOS
    // ========================================
    document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);

    // Observer para mudanças de tema
    const observer = new MutationObserver(() => setTimeout(atualizarGraficos, 200));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // ========================================
    // INICIALIZAÇÃO
    // ========================================
    carregarHistorico();
    
    if (window.ERPStore) {
        window.ERPStore.subscribe(() => {
            setTimeout(atualizarGraficos, 100);
        });
        setTimeout(atualizarGraficos, 300);
    }

    // Data no relatório
    document.getElementById('mesAtual').textContent = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    console.log('📊 Relatórios ERP IMS carregado com sucesso!');

})();