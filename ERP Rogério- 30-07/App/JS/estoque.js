// ========================================
// MOVIMENTAÇÃO DE ESTOQUE - ERP IMS
// ========================================

(function() {
    "use strict";

    // ========================================
    // CONTROLE DE TEMA (CLARO/ESCURO)
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
    // DOM
    // ========================================
    const form = document.getElementById('movimentoForm');
    const tipoMovimento = document.getElementById('tipoMovimento');
    const produtoNome = document.getElementById('produtoNome');
    const quantidade = document.getElementById('quantidade');
    const responsavel = document.getElementById('responsavel');
    const motivo = document.getElementById('motivo');
    const dataHora = document.getElementById('dataHora');

    const filtroData = document.getElementById('filtroData');
    const filtroProduto = document.getElementById('filtroProduto');
    const aplicarFiltrosBtn = document.getElementById('aplicarFiltros');
    const limparFiltrosBtn = document.getElementById('limparFiltros');
    const limparTodosBtn = document.getElementById('limparTodos');

    const tbody = document.getElementById('tabelaHistorico');
    const contadorRegistros = document.getElementById('contadorRegistros');
    const totalCount = document.getElementById('totalCount');
    const entradaCount = document.getElementById('entradaCount');
    const saidaCount = document.getElementById('saidaCount');
    const uniqueCount = document.getElementById('uniqueCount');
    const registroTimestamp = document.getElementById('registroTimestamp');

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
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.width = (Math.random() * 3 + 1) + 'px';
            particle.style.height = particle.style.width;
            particle.style.animationDuration = (Math.random() * 20 + 10) + 's';
            particle.style.animationDelay = (Math.random() * 20) + 's';
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            container.appendChild(particle);
        }
    }
    criarParticulas();

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

    function obterDataHoraAtual() {
        const now = new Date();
        return now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + 'T' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0');
    }

    function atualizarTimestamp() {
        const now = new Date();
        if (registroTimestamp) {
            registroTimestamp.textContent = `Atualizado ${now.toLocaleTimeString('pt-BR')}`;
        }
    }

    // ========================================
    // ANIMAÇÃO DE NÚMEROS
    // ========================================
    function animarNumero(element, target) {
        const current = parseInt(element.textContent) || 0;
        if (current === target) return;
        const diff = target - current;
        const steps = 10;
        const step = diff / steps;
        let count = 0;
        const interval = setInterval(() => {
            count++;
            if (count >= steps) {
                element.textContent = target;
                clearInterval(interval);
                return;
            }
            element.textContent = Math.round(current + step * count);
        }, 30);
    }

    // ========================================
    // ATUALIZAR STATS
    // ========================================
    function atualizarStats() {
        if (!window.ERPStore) return;

        const movimentacoes = window.ERPStore.getMovimentacoes();
        const total = movimentacoes.length;
        const entradas = movimentacoes.filter(m => m.tipo === 'entrada').length;
        const saidas = movimentacoes.filter(m => m.tipo === 'saida').length;
        const unique = new Set(movimentacoes.map(m => m.produto.toLowerCase())).size;

        if (totalCount) animarNumero(totalCount, total);
        if (entradaCount) animarNumero(entradaCount, entradas);
        if (saidaCount) animarNumero(saidaCount, saidas);
        if (uniqueCount) animarNumero(uniqueCount, unique);
        if (contadorRegistros) contadorRegistros.textContent = total;
        atualizarTimestamp();
    }

    // ========================================
    // RENDERIZAR HISTÓRICO
    // ========================================
    function renderizarHistorico() {
        if (!window.ERPStore) return;

        const filtroDataVal = filtroData.value.trim();
        const filtroProdutoVal = filtroProduto.value.trim().toLowerCase();

        let dadosFiltrados = window.ERPStore.getMovimentacoes();

        if (filtroDataVal !== '') {
            dadosFiltrados = dadosFiltrados.filter(mov => {
                if (!mov.dataHora) return false;
                return mov.dataHora.startsWith(filtroDataVal);
            });
        }

        if (filtroProdutoVal !== '') {
            dadosFiltrados = dadosFiltrados.filter(mov =>
                mov.produto && mov.produto.toLowerCase().includes(filtroProdutoVal)
            );
        }

        if (dadosFiltrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="icon">📭</div>
                        ${window.ERPStore.getMovimentacoes().length === 0 ? 
                            'Nenhuma movimentação registrada' : 
                            'Nenhum resultado encontrado'}
                    </td>
                </tr>
            `;
            atualizarStats();
            return;
        }

        const linhas = dadosFiltrados.slice().reverse().map(mov => {
            const tipoLabel = mov.tipo === 'entrada' ? 'Entrada' : 'Saída';
            const tipoBadge = mov.tipo === 'entrada' ? 'entrada' : 'saida';
            return `<tr>
                <td style="white-space:nowrap;">${formatarDataHora(mov.dataHora)}</td>
                <td><span class="badge-tipo ${tipoBadge}">${tipoLabel}</span></td>
                <td><strong>${mov.produto || '—'}</strong></td>
                <td style="font-weight:600;">${mov.quantidade ?? '—'}</td>
                <td>${mov.responsavel || '—'}</td>
                <td>${mov.motivo || '—'}</td>
            </tr>`;
        });

        tbody.innerHTML = linhas.join('');
        atualizarStats();
    }

    // ========================================
    // ATUALIZAR AUTOCOMPLETE DE PRODUTOS
    // ========================================
    function atualizarAutocompleteProdutos() {
        if (!window.ERPStore) return;
        
        const produtos = window.ERPStore.getProdutos();
        const datalist = document.createElement('datalist');
        datalist.id = 'produtosList';
        
        produtos.forEach(prod => {
            const option = document.createElement('option');
            option.value = prod.nome;
            datalist.appendChild(option);
        });
        
        const oldDatalist = document.getElementById('produtosList');
        if (oldDatalist) oldDatalist.remove();
        
        document.body.appendChild(datalist);
        if (produtoNome) {
            produtoNome.setAttribute('list', 'produtosList');
        }
        
        console.log(`📦 Autocomplete atualizado com ${produtos.length} produtos`);
    }

    // ========================================
    // ADICIONAR MOVIMENTO
    // ========================================
    function adicionarMovimento(event) {
        event.preventDefault();

        if (!window.ERPStore) {
            showToast('⚠ Sistema não inicializado', 'error');
            return;
        }

        const tipo = tipoMovimento.value;
        const produto = produtoNome.value.trim();
        const qtd = parseInt(quantidade.value, 10);
        const resp = responsavel.value.trim();
        const mot = motivo.value;
        const dh = dataHora.value;

        // Validações
        if (!produto) {
            showToast('⚠ O campo "Produto" é obrigatório', 'error');
            produtoNome.focus();
            return;
        }
        if (!qtd || qtd < 1) {
            showToast('⚠ Quantidade deve ser um número inteiro positivo', 'error');
            quantidade.focus();
            return;
        }
        if (!resp) {
            showToast('⚠ O campo "Responsável" é obrigatório', 'error');
            responsavel.focus();
            return;
        }
        if (!dh) {
            showToast('⚠ Selecione a data e horário da movimentação', 'error');
            dataHora.focus();
            return;
        }

        // Verificar se o produto existe no cadastro
        const produtos = window.ERPStore.getProdutos();
        const produtoExistente = produtos.find(p => p.nome.toLowerCase() === produto.toLowerCase());
        
        if (!produtoExistente) {
            showToast(`⚠ Produto "${produto}" não encontrado no cadastro!`, 'error');
            produtoNome.focus();
            // Mostrar sugestões de produtos disponíveis
            const sugestoes = produtos.map(p => p.nome).join(', ');
            if (sugestoes) {
                showToast(`💡 Produtos disponíveis: ${sugestoes}`, 'info');
            }
            return;
        }

        // Verificar se há estoque suficiente para saída
        if (tipo === 'saida' && produtoExistente.estoque < qtd) {
            showToast(`⚠ Estoque insuficiente! Disponível: ${produtoExistente.estoque}`, 'error');
            quantidade.focus();
            return;
        }

        const novaMov = {
            tipo: tipo,
            produto: produtoExistente.nome,
            quantidade: qtd,
            responsavel: resp,
            motivo: mot,
            dataHora: dh
        };

        const movAdicionada = window.ERPStore.adicionarMovimentacao(novaMov);
        
        if (movAdicionada) {
            // Limpar campos
            produtoNome.value = '';
            quantidade.value = '';
            responsavel.value = '';
            dataHora.value = obterDataHoraAtual();
            produtoNome.focus();

            renderizarHistorico();
            showToast(`✅ ${tipo === 'entrada' ? 'Entrada' : 'Saída'} de ${qtd}x ${produto} registrada com sucesso!`, 'success');

            // Efeito especial no contador
            if (contadorRegistros) {
                contadorRegistros.style.transition = 'transform 0.15s';
                contadorRegistros.style.transform = 'scale(1.5)';
                setTimeout(() => {
                    contadorRegistros.style.transform = 'scale(1)';
                }, 200);
            }
        } else {
            showToast('❌ Erro ao registrar movimentação', 'error');
        }
    }

    // ========================================
    // LIMPAR HISTÓRICO
    // ========================================
    function limparHistorico() {
        if (!window.ERPStore) return;

        const total = window.ERPStore.getMovimentacoes().length;
        if (total === 0) {
            showToast('📭 O histórico já está vazio', 'info');
            return;
        }

        if (confirm('⚠ Tem certeza que deseja limpar todo o histórico?')) {
            window.ERPStore.dados.movimentacoes = [];
            window.ERPStore.salvar();
            renderizarHistorico();
            showToast('🗑 Histórico limpo com sucesso', 'info');
        }
    }

    // ========================================
    // EVENTOS
    // ========================================
    if (form) form.addEventListener('submit', adicionarMovimento);
    if (aplicarFiltrosBtn) aplicarFiltrosBtn.addEventListener('click', renderizarHistorico);
    
    if (limparFiltrosBtn) {
        limparFiltrosBtn.addEventListener('click', function() {
            filtroData.value = '';
            filtroProduto.value = '';
            renderizarHistorico();
            showToast('🧹 Filtros limpos', 'info');
        });
    }
    
    if (limparTodosBtn) limparTodosBtn.addEventListener('click', limparHistorico);

    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }

    // ========================================
    // KEYBOARD SHORTCUTS
    // ========================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (filtroData) filtroData.value = '';
            if (filtroProduto) filtroProduto.value = '';
            renderizarHistorico();
            showToast('🧹 Filtros limpos (ESC)', 'info');
        }
    });

    // ========================================
    // FORÇAR ATUALIZAÇÃO MANUAL (para debug)
    // ========================================
    window.forcarAtualizacaoEstoque = function() {
        if (window.ERPStore) {
            atualizarAutocompleteProdutos();
            renderizarHistorico();
            showToast('🔄 Dados atualizados manualmente', 'info');
        }
    };

    // ========================================
    // INICIALIZAÇÃO
    // ========================================
    function inicializar() {
        if (dataHora) dataHora.value = obterDataHoraAtual();

        if (window.ERPStore) {
            const produtos = window.ERPStore.getProdutos();
            console.log(`📦 ${produtos.length} produtos encontrados no store`);
            
            renderizarHistorico();
            atualizarAutocompleteProdutos();
            
            window.ERPStore.subscribe(function(dados) {
                renderizarHistorico();
                atualizarAutocompleteProdutos();
            });
            
            console.log('📊 Movimentação de Estoque conectado ao store central');
        } else {
            console.warn('Store não encontrado');
            showToast('⚠ Sistema não inicializado corretamente', 'error');
        }

        setInterval(function() {
            if (dataHora && !dataHora.value) {
                dataHora.value = obterDataHoraAtual();
            }
            atualizarTimestamp();
        }, 60000);
    }

    // Aguardar DOM carregar completamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

    console.log('🚀 ERP IMS · Movimentação de Estoque carregado com sucesso!');
    console.log('💡 Use window.forcarAtualizacaoEstoque() para forçar atualização');

})();