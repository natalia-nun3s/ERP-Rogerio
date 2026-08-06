// ========================================
// CADASTRO DE PRODUTOS - ERP IMS
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
    const nome = document.getElementById("nome");
    const codigo = document.getElementById("codigo");
    const categoria = document.getElementById("categoria");
    const fornecedor = document.getElementById("fornecedor");
    const custo = document.getElementById("custo");
    const venda = document.getElementById("venda");
    const estoque = document.getElementById("estoque");
    const minimo = document.getElementById("minimo");
    const tabela = document.getElementById("tabelaProdutos");
    const searchInput = document.getElementById("searchProduto");
    const produtoCount = document.getElementById("produtoCount");

    let linhaSelecionada = null;
    let produtoEditandoId = null;

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
    // LIMPAR CAMPOS
    // ========================================
    function limparCampos() {
        nome.value = "";
        codigo.value = "";
        categoria.value = "";
        fornecedor.value = "";
        custo.value = "";
        venda.value = "";
        estoque.value = "";
        minimo.value = "";
        linhaSelecionada = null;
        produtoEditandoId = null;
        document.querySelectorAll('tr.selecionado').forEach(tr => tr.classList.remove('selecionado'));
    }

    // ========================================
    // ATUALIZAR CONTADOR
    // ========================================
    function atualizarContador() {
        if (produtoCount && window.ERPStore) {
            const produtos = window.ERPStore.getProdutos();
            const total = produtos.length;
            produtoCount.textContent = `${total} produto${total !== 1 ? 's' : ''}`;
            console.log(`📊 Contador: ${total} produtos`);
        }
    }

    // ========================================
    // CLASSES DE ESTOQUE
    // ========================================
    function getEstoqueClass(qtd, minimo) {
        if (qtd === 0) return 'estoque-critico';
        if (qtd <= minimo) return 'estoque-baixo';
        return 'estoque-normal';
    }

    // ========================================
    // SELECIONAR LINHA
    // ========================================
    function selecionarLinha() {
        document.querySelectorAll('tr.selecionado').forEach(tr => tr.classList.remove('selecionado'));
        this.classList.add('selecionado');
        linhaSelecionada = this;
        
        const produtoId = parseInt(this.dataset.id);
        produtoEditandoId = produtoId;
        
        if (window.ERPStore) {
            const produto = window.ERPStore.getProduto(produtoId);
            if (produto) {
                nome.value = produto.nome;
                codigo.value = produto.codigo;
                categoria.value = produto.categoria;
                fornecedor.value = produto.fornecedor;
                custo.value = produto.custo;
                venda.value = produto.venda;
                estoque.value = produto.estoque;
                minimo.value = produto.minimo;
            }
        }
    }

    // ========================================
    // RENDERIZAR PRODUTOS
    // ========================================
    function renderizarProdutos() {
        console.log('🔄 renderizarProdutos() chamado');
        
        if (!window.ERPStore) {
            console.warn('⚠️ Store não disponível');
            return;
        }

        const produtos = window.ERPStore.getProdutos();
        console.log(`📦 ${produtos.length} produtos no store`);
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        let produtosFiltrados = produtos;
        if (searchTerm) {
            produtosFiltrados = window.ERPStore.buscarProdutos(searchTerm);
            console.log(`🔍 Filtrado: ${produtosFiltrados.length} produtos`);
        }
        
        // Limpar tabela
        tabela.innerHTML = '';
        console.log('🧹 Tabela limpa');
        
        if (produtosFiltrados.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <div class="icon">📭</div>
                        ${produtos.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
                    </td>
                </tr>
            `;
            console.log('📭 Nenhum produto para exibir');
            atualizarContador();
            return;
        }
        
        produtosFiltrados.forEach((produto) => {
            const linha = document.createElement('tr');
            linha.dataset.id = produto.id;
            
            linha.innerHTML = `
                <td>${produto.nome || '—'}</td>
                <td>${produto.codigo || '—'}</td>
                <td>${produto.categoria || '—'}</td>
                <td>${produto.fornecedor || '—'}</td>
                <td>R$ ${(produto.custo || 0).toFixed(2)}</td>
                <td>R$ ${(produto.venda || 0).toFixed(2)}</td>
                <td class="${getEstoqueClass(produto.estoque || 0, produto.minimo || 0)}">${produto.estoque || 0}</td>
                <td>${produto.minimo || 0}</td>
            `;
            
            linha.addEventListener("click", selecionarLinha);
            tabela.appendChild(linha);
        });
        
        console.log(`✅ Tabela atualizada com ${produtosFiltrados.length} produtos`);
        atualizarContador();
    }

    // ========================================
    // ADICIONAR PRODUTO
    // ========================================
    document.getElementById("adicionar").addEventListener("click", function(e) {
        e.preventDefault();
        
        console.log('🔘 Botão Adicionar clicado');
        
        if (!window.ERPStore) {
            showToast('⚠️ Sistema não inicializado', 'error');
            return;
        }

        // Validar campos
        if (!nome.value || !codigo.value || !categoria.value || !fornecedor.value || 
            !custo.value || !venda.value || !estoque.value || !minimo.value) {
            showToast('⚠️ Preencha todos os campos!', 'error');
            console.log('❌ Campos vazios');
            return;
        }

        // Validar valores numéricos
        const custoVal = parseFloat(custo.value.replace(',', '.'));
        const vendaVal = parseFloat(venda.value.replace(',', '.'));
        const estoqueVal = parseInt(estoque.value);
        const minimoVal = parseInt(minimo.value);

        console.log('📊 Valores:', { custoVal, vendaVal, estoqueVal, minimoVal });

        if (isNaN(custoVal) || custoVal < 0) {
            showToast('⚠️ Preço de custo inválido!', 'error');
            custo.focus();
            return;
        }

        if (isNaN(vendaVal) || vendaVal < 0) {
            showToast('⚠️ Preço de venda inválido!', 'error');
            venda.focus();
            return;
        }

        if (isNaN(estoqueVal) || estoqueVal < 0) {
            showToast('⚠️ Quantidade em estoque inválida!', 'error');
            estoque.focus();
            return;
        }

        if (isNaN(minimoVal) || minimoVal < 0) {
            showToast('⚠️ Estoque mínimo inválido!', 'error');
            minimo.focus();
            return;
        }

        // Verificar se o SKU já existe
        const existe = window.ERPStore.getProdutoPorCodigo(codigo.value.trim());
        if (existe) {
            showToast('⚠️ Já existe um produto com este código SKU!', 'error');
            codigo.focus();
            return;
        }

        const novoProduto = {
            nome: nome.value.trim(),
            codigo: codigo.value.trim(),
            categoria: categoria.value,
            fornecedor: fornecedor.value.trim(),
            custo: custoVal,
            venda: vendaVal,
            estoque: estoqueVal,
            minimo: minimoVal
        };

        console.log('📦 Adicionando produto:', novoProduto);

        const produtoAdicionado = window.ERPStore.adicionarProduto(novoProduto);
        
        if (produtoAdicionado) {
            console.log('✅ Produto adicionado com sucesso! ID:', produtoAdicionado.id);
            
            // Limpar campos
            limparCampos();
            
            // Renderizar novamente
            renderizarProdutos();
            
            showToast(`✅ Produto "${novoProduto.nome}" adicionado com sucesso!`, 'success');
        } else {
            console.error('❌ Erro ao adicionar produto');
            showToast('❌ Erro ao adicionar produto', 'error');
        }
    });

    // ========================================
    // EDITAR PRODUTO
    // ========================================
    document.getElementById("editar").addEventListener("click", function(e) {
        e.preventDefault();
        
        if (!window.ERPStore) {
            showToast('⚠️ Sistema não inicializado', 'error');
            return;
        }

        if (!linhaSelecionada || !produtoEditandoId) {
            showToast('⚠️ Selecione um produto para editar.', 'warning');
            return;
        }

        if (!nome.value || !codigo.value || !categoria.value || !fornecedor.value || 
            !custo.value || !venda.value || !estoque.value || !minimo.value) {
            showToast('⚠️ Preencha todos os campos!', 'error');
            return;
        }

        const custoVal = parseFloat(custo.value.replace(',', '.'));
        const vendaVal = parseFloat(venda.value.replace(',', '.'));
        const estoqueVal = parseInt(estoque.value);
        const minimoVal = parseInt(minimo.value);

        if (isNaN(custoVal) || isNaN(vendaVal) || isNaN(estoqueVal) || isNaN(minimoVal)) {
            showToast('⚠️ Valores inválidos!', 'error');
            return;
        }

        const existe = window.ERPStore.getProdutoPorCodigo(codigo.value.trim());
        if (existe && existe.id !== produtoEditandoId) {
            showToast('⚠️ Já existe um produto com este código SKU!', 'error');
            codigo.focus();
            return;
        }

        const dadosAtualizados = {
            nome: nome.value.trim(),
            codigo: codigo.value.trim(),
            categoria: categoria.value,
            fornecedor: fornecedor.value.trim(),
            custo: custoVal,
            venda: vendaVal,
            estoque: estoqueVal,
            minimo: minimoVal
        };

        console.log('✏️ Editando produto:', dadosAtualizados);

        const produtoEditado = window.ERPStore.editarProduto(produtoEditandoId, dadosAtualizados);
        
        if (produtoEditado) {
            limparCampos();
            renderizarProdutos();
            showToast(`✏️ Produto "${dadosAtualizados.nome}" atualizado com sucesso!`, 'info');
        } else {
            showToast('❌ Erro ao editar produto', 'error');
        }
    });

    // ========================================
    // EXCLUIR PRODUTO
    // ========================================
    document.getElementById("excluir").addEventListener("click", function(e) {
        e.preventDefault();
        
        if (!window.ERPStore) {
            showToast('⚠️ Sistema não inicializado', 'error');
            return;
        }

        if (!linhaSelecionada || !produtoEditandoId) {
            showToast('⚠️ Selecione um produto para excluir.', 'warning');
            return;
        }

        const nomeProduto = linhaSelecionada.cells[0].textContent;
        if (confirm(`⚠️ Tem certeza que deseja excluir "${nomeProduto}"?`)) {
            const excluido = window.ERPStore.excluirProduto(produtoEditandoId);
            if (excluido) {
                limparCampos();
                renderizarProdutos();
                showToast(`🗑️ Produto "${nomeProduto}" excluído com sucesso!`, 'info');
            } else {
                showToast('❌ Erro ao excluir produto', 'error');
            }
        }
    });

    // ========================================
    // BUSCAR PRODUTO
    // ========================================
    document.getElementById("buscarProduto").addEventListener("click", function(e) {
        e.preventDefault();
        renderizarProdutos();
        const termo = searchInput.value.trim();
        if (termo) {
            showToast(`🔍 Buscando por "${termo}"`, 'info');
        }
    });

    document.getElementById("limparBusca").addEventListener("click", function(e) {
        e.preventDefault();
        searchInput.value = '';
        renderizarProdutos();
        showToast('🧹 Busca limpa', 'info');
    });

    searchInput.addEventListener("keypress", function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById("buscarProduto").click();
        }
    });

    // ========================================
    // EVENTO DO BOTÃO DE TEMA
    // ========================================
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }

    // ========================================
    // ATALHO TECLADO (ESC para limpar)
    // ========================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            limparCampos();
            showToast('🧹 Seleção limpa', 'info');
        }
    });

    // ========================================
    // FORÇAR ATUALIZAÇÃO MANUAL (para debug)
    // ========================================
    window.forcarAtualizacaoProdutos = function() {
        console.log('🔄 Forçando atualização manual...');
        if (window.ERPStore) {
            renderizarProdutos();
            showToast('🔄 Produtos atualizados manualmente', 'info');
        }
    };

    // ========================================
    // INICIALIZAÇÃO
    // ========================================
    function inicializar() {
        console.log('🚀 Inicializando página de produtos...');
        
        // Verificar se os elementos existem
        console.log('📌 Elementos DOM:');
        console.log('  - nome:', !!nome);
        console.log('  - codigo:', !!codigo);
        console.log('  - categoria:', !!categoria);
        console.log('  - fornecedor:', !!fornecedor);
        console.log('  - custo:', !!custo);
        console.log('  - venda:', !!venda);
        console.log('  - estoque:', !!estoque);
        console.log('  - minimo:', !!minimo);
        console.log('  - tabela:', !!tabela);
        console.log('  - searchInput:', !!searchInput);
        console.log('  - produtoCount:', !!produtoCount);
        
        if (window.ERPStore) {
            console.log('✅ Store encontrado');
            
            // Verificar produtos existentes
            const produtos = window.ERPStore.getProdutos();
            console.log(`📦 ${produtos.length} produtos encontrados no store`);
            
            // Renderizar produtos
            renderizarProdutos();
            
            // Inscrever para mudanças no store
            window.ERPStore.subscribe(function(dados) {
                console.log('🔄 Store atualizado, renderizando novamente...');
                renderizarProdutos();
            });
            
            console.log('📦 Cadastro de Produtos conectado ao store central');
        } else {
            console.error('❌ Store não encontrado!');
            showToast('⚠️ Sistema não inicializado corretamente', 'error');
        }
        
        console.log('💡 Use window.forcarAtualizacaoProdutos() para forçar atualização');
    }

    // Aguardar DOM carregar completamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

    console.log('📦 Cadastro de Produtos ERP IMS carregado com sucesso!');

})();