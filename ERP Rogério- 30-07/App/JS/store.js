// ========================================
// STORE - Gerenciamento Central de Dados
// ERP IMS - VERSÃO PREMIUM
// ========================================

(function() {
    "use strict";

    const STORAGE_KEY = 'erp_ims_data_premium';

    const estadoInicial = {
        produtos: [],
        movimentacoes: [],
        fornecedores: [],
        categorias: [],
        usuarios: [],
        configuracoes: {
            theme: 'dark',
            empresa: 'ERP IMS',
            moeda: 'R$',
            notificacoes: true,
            backup_automatico: true
        },
        ultimoId: 0,
        logs: []
    };

    // ========================================
    // DADOS DE EXEMPLO PREMIUM
    // ========================================
    function getDadosExemplo() {
        const categorias = [
            { id: 1, nome: 'Eletrônicos', descricao: 'Dispositivos eletrônicos e acessórios', icone: '📱' },
            { id: 2, nome: 'Roupas', descricao: 'Vestuário e acessórios de moda', icone: '👕' },
            { id: 3, nome: 'Alimentos', descricao: 'Produtos alimentícios e bebidas', icone: '🍕' },
            { id: 4, nome: 'Móveis', descricao: 'Móveis e decoração', icone: '🪑' },
            { id: 5, nome: 'Ferramentas', descricao: 'Ferramentas e equipamentos', icone: '🔧' }
        ];

        const fornecedores = [
            { id: 1, nome: 'TechMaster Distribuidora', cnpj: '12.345.678/0001-90', email: 'contato@techmaster.com', telefone: '(11) 3456-7890', endereco: 'Rua da Tecnologia, 1000 - São Paulo/SP', ativo: true },
            { id: 2, nome: 'ModaFashion Importados', cnpj: '98.765.432/0001-12', email: 'vendas@modafashion.com', telefone: '(11) 9876-5432', endereco: 'Av. da Moda, 500 - São Paulo/SP', ativo: true },
            { id: 3, nome: 'Alimentos Premium Ltda', cnpj: '45.678.912/0001-34', email: 'contato@alimentos-premium.com', telefone: '(11) 4567-8912', endereco: 'Rua dos Sabores, 200 - São Paulo/SP', ativo: true },
            { id: 4, nome: 'Moveis & Cia', cnpj: '78.912.345/0001-56', email: 'vendas@moveisecia.com', telefone: '(11) 7891-2345', endereco: 'Av. dos Móveis, 300 - São Paulo/SP', ativo: false },
            { id: 5, nome: 'Ferramentas Profissionais', cnpj: '23.456.789/0001-78', email: 'contato@ferramentaspro.com', telefone: '(11) 2345-6789', endereco: 'Rua das Oficinas, 150 - São Paulo/SP', ativo: true }
        ];

        const produtos = [
            { id: 1, nome: 'Notebook Dell XPS 13', codigo: 'SKU-001', categoria: 'Eletrônicos', fornecedor: 'TechMaster Distribuidora', custo: 4500.00, venda: 5899.00, estoque: 15, minimo: 5, descricao: 'Notebook ultrabook com tela 4K' },
            { id: 2, nome: 'Mouse Logitech MX Master 3', codigo: 'SKU-002', categoria: 'Eletrônicos', fornecedor: 'TechMaster Distribuidora', custo: 250.00, venda: 399.00, estoque: 30, minimo: 10, descricao: 'Mouse sem fio ergonômico' },
            { id: 3, nome: 'Monitor 27" 4K LG', codigo: 'SKU-003', categoria: 'Eletrônicos', fornecedor: 'TechMaster Distribuidora', custo: 1800.00, venda: 2399.00, estoque: 8, minimo: 3, descricao: 'Monitor 4K UHD 27 polegadas' },
            { id: 4, nome: 'Teclado Mecânico Razer', codigo: 'SKU-004', categoria: 'Eletrônicos', fornecedor: 'TechMaster Distribuidora', custo: 350.00, venda: 499.00, estoque: 0, minimo: 5, descricao: 'Teclado mecânico RGB' },
            { id: 5, nome: 'Webcam 4K Logitech', codigo: 'SKU-005', categoria: 'Eletrônicos', fornecedor: 'TechMaster Distribuidora', custo: 600.00, venda: 899.00, estoque: 12, minimo: 4, descricao: 'Webcam 4K com microfone embutido' },
            { id: 6, nome: 'Camiseta Polo Classic', codigo: 'SKU-006', categoria: 'Roupas', fornecedor: 'ModaFashion Importados', custo: 45.00, venda: 89.90, estoque: 50, minimo: 20, descricao: 'Camiseta polo 100% algodão' },
            { id: 7, nome: 'Calça Jeans Slim', codigo: 'SKU-007', categoria: 'Roupas', fornecedor: 'ModaFashion Importados', custo: 80.00, venda: 149.90, estoque: 35, minimo: 15, descricao: 'Calça jeans slim fit' },
            { id: 8, nome: 'Pizza Margherita Congelada', codigo: 'SKU-008', categoria: 'Alimentos', fornecedor: 'Alimentos Premium Ltda', custo: 12.00, venda: 24.90, estoque: 100, minimo: 30, descricao: 'Pizza margherita 30cm' },
            { id: 9, nome: 'Sofá 3 Lugares', codigo: 'SKU-009', categoria: 'Móveis', fornecedor: 'Moveis & Cia', custo: 800.00, venda: 1299.00, estoque: 5, minimo: 2, descricao: 'Sofá 3 lugares em couro' },
            { id: 10, nome: 'Furadeira Elétrica', codigo: 'SKU-010', categoria: 'Ferramentas', fornecedor: 'Ferramentas Profissionais', custo: 150.00, venda: 249.00, estoque: 20, minimo: 8, descricao: 'Furadeira 500W com 10 brocas' }
        ];

        const agora = new Date();
        const movimentacoes = [];
        const produtosNomes = produtos.map(p => p.nome);
        const responsaveis = ['Ana Beatriz', 'Carlos Eduardo', 'Mariana Silva', 'Rafael Santos', 'Juliana Costa', 'Fernanda Lima', 'Thiago Oliveira', 'Lucas Pereira'];
        const motivos = ['venda', 'reposicao', 'devolucao', 'perda', 'ajuste'];

        for (let i = 0; i < 50; i++) {
            const data = new Date(agora);
            data.setDate(data.getDate() - Math.floor(Math.random() * 30));
            const tipo = Math.random() > 0.4 ? 'entrada' : 'saida';
            const produto = produtosNomes[Math.floor(Math.random() * produtosNomes.length)];
            const qtd = Math.floor(Math.random() * 50) + 1;
            movimentacoes.push({
                id: i + 1,
                tipo: tipo,
                produto: produto,
                quantidade: qtd,
                responsavel: responsaveis[Math.floor(Math.random() * responsaveis.length)],
                motivo: motivos[Math.floor(Math.random() * motivos.length)],
                dataHora: formatarData(data)
            });
        }

        return { produtos, movimentacoes, fornecedores, categorias };
    }

    function formatarData(data) {
        return data.getFullYear() + '-' +
            String(data.getMonth() + 1).padStart(2, '0') + '-' +
            String(data.getDate()).padStart(2, '0') + 'T' +
            String(data.getHours()).padStart(2, '0') + ':' +
            String(data.getMinutes()).padStart(2, '0');
    }

    // ========================================
    // CLASSE STORE PREMIUM
    // ========================================
    class Store {
        constructor() {
            this.dados = this.carregarDados();
            this.listeners = [];
            this.setupStorageListener();
            this.validarIds();
        }

        carregarDados() {
            try {
                const dados = localStorage.getItem(STORAGE_KEY);
                if (dados) {
                    const parsed = JSON.parse(dados);
                    return { ...estadoInicial, ...parsed };
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            }
            
            const exemplos = getDadosExemplo();
            return { ...estadoInicial, ...exemplos, ultimoId: 50 };
        }

        salvarDados() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.dados));
                window.dispatchEvent(new StorageEvent('storage', {
                    key: STORAGE_KEY,
                    newValue: JSON.stringify(this.dados)
                }));
                return true;
            } catch (error) {
                console.error('Erro ao salvar dados:', error);
                return false;
            }
        }

        validarIds() {
            let maxId = this.dados.ultimoId;
            ['produtos', 'movimentacoes', 'fornecedores', 'categorias'].forEach(key => {
                this.dados[key].forEach(item => {
                    if (!item.id) item.id = ++maxId;
                    if (item.id > maxId) maxId = item.id;
                });
            });
            this.dados.ultimoId = maxId;
        }

        setupStorageListener() {
            window.addEventListener('storage', (event) => {
                if (event.key === STORAGE_KEY && event.newValue) {
                    try {
                        this.dados = JSON.parse(event.newValue);
                        this.notificar();
                    } catch (error) {
                        console.error('Erro ao processar mudança de storage:', error);
                    }
                }
            });
        }

        notificar() {
            this.listeners.forEach(listener => {
                try { listener(this.dados); } catch (error) { console.error(error); }
            });
        }

        subscribe(fn) {
            this.listeners.push(fn);
            fn(this.dados);
            return () => { this.listeners = this.listeners.filter(l => l !== fn); };
        }

        // ========================================
        // PRODUTOS
        // ========================================
        getProdutos() { return this.dados.produtos; }
        getProduto(id) { return this.dados.produtos.find(p => p.id === id); }
        getProdutoPorCodigo(codigo) { return this.dados.produtos.find(p => p.codigo === codigo); }
        getProdutosPorCategoria(categoria) { return this.dados.produtos.filter(p => p.categoria === categoria); }

        adicionarProduto(produto) {
            const novo = { id: ++this.dados.ultimoId, ...produto };
            this.dados.produtos.push(novo);
            this.salvarDados();
            this.notificar();
            return novo;
        }

        editarProduto(id, dados) {
            const index = this.dados.produtos.findIndex(p => p.id === id);
            if (index === -1) return null;
            this.dados.produtos[index] = { ...this.dados.produtos[index], ...dados };
            this.salvarDados();
            this.notificar();
            return this.dados.produtos[index];
        }

        excluirProduto(id) {
            const index = this.dados.produtos.findIndex(p => p.id === id);
            if (index === -1) return false;
            this.dados.produtos.splice(index, 1);
            this.salvarDados();
            this.notificar();
            return true;
        }

        // ========================================
        // FORNECEDORES
        // ========================================
        getFornecedores() { return this.dados.fornecedores; }
        getFornecedor(id) { return this.dados.fornecedores.find(f => f.id === id); }

        adicionarFornecedor(fornecedor) {
            const novo = { id: ++this.dados.ultimoId, ...fornecedor, ativo: true };
            this.dados.fornecedores.push(novo);
            this.salvarDados();
            this.notificar();
            return novo;
        }

        editarFornecedor(id, dados) {
            const index = this.dados.fornecedores.findIndex(f => f.id === id);
            if (index === -1) return null;
            this.dados.fornecedores[index] = { ...this.dados.fornecedores[index], ...dados };
            this.salvarDados();
            this.notificar();
            return this.dados.fornecedores[index];
        }

        excluirFornecedor(id) {
            const index = this.dados.fornecedores.findIndex(f => f.id === id);
            if (index === -1) return false;
            this.dados.fornecedores.splice(index, 1);
            this.salvarDados();
            this.notificar();
            return true;
        }

        // ========================================
        // CATEGORIAS
        // ========================================
        getCategorias() { return this.dados.categorias; }
        getCategoria(id) { return this.dados.categorias.find(c => c.id === id); }

        adicionarCategoria(categoria) {
            const novo = { id: ++this.dados.ultimoId, ...categoria };
            this.dados.categorias.push(novo);
            this.salvarDados();
            this.notificar();
            return novo;
        }

        // ========================================
        // MOVIMENTAÇÕES
        // ========================================
        getMovimentacoes() { return this.dados.movimentacoes; }

        adicionarMovimentacao(mov) {
            let produto = this.dados.produtos.find(p => p.nome === mov.produto);
            const novo = { id: ++this.dados.ultimoId, ...mov };
            this.dados.movimentacoes.push(novo);
            
            if (produto) {
                if (mov.tipo === 'entrada') produto.estoque += mov.quantidade;
                else if (mov.tipo === 'saida') {
                    produto.estoque -= mov.quantidade;
                    if (produto.estoque < 0) produto.estoque = 0;
                }
            }
            
            this.salvarDados();
            this.notificar();
            return novo;
        }

        // ========================================
        // ESTATÍSTICAS AVANÇADAS
        // ========================================
        getStats() {
            const { produtos, movimentacoes } = this.dados;
            
            const totalProdutos = produtos.length;
            const estoqueBaixo = produtos.filter(p => p.estoque > 0 && p.estoque <= p.minimo).length;
            const semEstoque = produtos.filter(p => p.estoque === 0).length;
            const valorEstoque = produtos.reduce((sum, p) => sum + (p.custo * p.estoque), 0);
            
            const hoje = new Date().toISOString().slice(0, 10);
            const movHoje = movimentacoes.filter(m => m.dataHora && m.dataHora.startsWith(hoje)).length;
            
            const entradas = movimentacoes.filter(m => m.tipo === 'entrada').length;
            const saidas = movimentacoes.filter(m => m.tipo === 'saida').length;
            
            const produtosUnicos = new Set(movimentacoes.map(m => m.produto)).size;
            
            const ultimasMov = movimentacoes
                .sort((a, b) => (b.dataHora || '').localeCompare(a.dataHora || ''))
                .slice(0, 5);

            // Produtos mais vendidos
            const vendas = {};
            movimentacoes.filter(m => m.tipo === 'saida').forEach(m => {
                vendas[m.produto] = (vendas[m.produto] || 0) + m.quantidade;
            });
            const maisVendidos = Object.entries(vendas)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([nome, qtd]) => ({ nome, quantidade: qtd }));

            // Movimentações por mês
            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const movPorMes = meses.map((_, index) => {
                const mesAtual = new Date().getMonth();
                const mes = (mesAtual - 5 + index + 12) % 12;
                const ano = new Date().getFullYear();
                const dataInicio = new Date(ano, mes, 1);
                const dataFim = new Date(ano, mes + 1, 0);
                const movs = movimentacoes.filter(m => {
                    if (!m.dataHora) return false;
                    const d = new Date(m.dataHora);
                    return d >= dataInicio && d <= dataFim;
                });
                return {
                    mes: meses[mes],
                    entradas: movs.filter(m => m.tipo === 'entrada').reduce((s, m) => s + m.quantidade, 0),
                    saidas: movs.filter(m => m.tipo === 'saida').reduce((s, m) => s + m.quantidade, 0)
                };
            });

            return {
                totalProdutos,
                estoqueBaixo,
                semEstoque,
                movHoje,
                valorEstoque,
                entradas,
                saidas,
                produtosUnicos,
                ultimasMovimentacoes: ultimasMov,
                maisVendidos,
                movPorMes
            };
        }

        // ========================================
        // BACKUP
        // ========================================
        fazerBackup() {
            const dados = JSON.stringify(this.dados, null, 2);
            const blob = new Blob([dados], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_erp_ims_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }

        restaurarBackup(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const dados = JSON.parse(e.target.result);
                    this.dados = { ...estadoInicial, ...dados };
                    this.salvarDados();
                    this.notificar();
                    return true;
                } catch (error) {
                    console.error('Erro ao restaurar backup:', error);
                    return false;
                }
            };
            reader.readAsText(file);
        }

        // ========================================
        // CONFIGURAÇÕES
        // ========================================
        getConfig() { return this.dados.configuracoes; }
        setConfig(config) {
            this.dados.configuracoes = { ...this.dados.configuracoes, ...config };
            this.salvarDados();
            this.notificar();
        }

        setTheme(theme) {
            this.dados.configuracoes.theme = theme;
            this.salvarDados();
            this.notificar();
        }

        salvar() {
            this.salvarDados();
            this.notificar();
        }
    }

    const store = new Store();
    window.ERPStore = store;

    console.log('📦 Store ERP IMS Premium inicializada!');
    console.log(`📊 ${store.getProdutos().length} produtos, ${store.getMovimentacoes().length} movimentações, ${store.getFornecedores().length} fornecedores`);

})();