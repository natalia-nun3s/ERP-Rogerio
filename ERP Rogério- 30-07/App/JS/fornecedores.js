// ========================================
// FORNECEDORES - ERP IMS
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
    // DOM
    // ========================================
    const tabela = document.getElementById('tabelaFornecedores');
    const buscarInput = document.getElementById('buscarFornecedor');
    const totalEl = document.getElementById('totalFornecedores');
    const ativosEl = document.getElementById('ativosFornecedores');
    const inativosEl = document.getElementById('inativosFornecedores');
    const modal = document.getElementById('modalFornecedor');
    const form = document.getElementById('formFornecedor');

    let editandoId = null;

    // ========================================
    // RENDERIZAR
    // ========================================
    function renderizarFornecedores() {
        if (!window.ERPStore) {
            console.warn('Store não disponível');
            return;
        }
        
        const fornecedores = window.ERPStore.getFornecedores();
        const termo = buscarInput.value.toLowerCase().trim();

        let filtrados = fornecedores;
        if (termo) {
            filtrados = fornecedores.filter(f => 
                f.nome.toLowerCase().includes(termo) ||
                (f.cnpj && f.cnpj.includes(termo)) ||
                (f.email && f.email.toLowerCase().includes(termo))
            );
        }

        const ativos = fornecedores.filter(f => f.ativo).length;
        const inativos = fornecedores.filter(f => !f.ativo).length;

        if (totalEl) totalEl.textContent = fornecedores.length;
        if (ativosEl) ativosEl.textContent = ativos;
        if (inativosEl) inativosEl.textContent = inativos;

        if (!tabela) return;

        if (filtrados.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="icon">📭</div>
                        ${fornecedores.length === 0 ? 'Nenhum fornecedor cadastrado' : 'Nenhum fornecedor encontrado'}
                    </td>
                </tr>
            `;
            return;
        }

        tabela.innerHTML = filtrados.map(f => `
            <tr>
                <td><strong>${f.nome || '—'}</strong></td>
                <td>${f.cnpj || '—'}</td>
                <td>${f.email || '—'}</td>
                <td>${f.telefone || '—'}</td>
                <td>
                    <span class="badge ${f.ativo ? 'badge-success' : 'badge-danger'}">
                        ${f.ativo ? '🟢 Ativo' : '🔴 Inativo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning editar-fornecedor" data-id="${f.id}">✏️</button>
                    <button class="btn btn-sm btn-danger excluir-fornecedor" data-id="${f.id}">🗑</button>
                </td>
            </tr>
        `).join('');

        // Eventos dos botões
        document.querySelectorAll('.editar-fornecedor').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = parseInt(this.dataset.id);
                editarFornecedor(id);
            });
        });
        
        document.querySelectorAll('.excluir-fornecedor').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = parseInt(this.dataset.id);
                excluirFornecedor(id);
            });
        });
    }

    // ========================================
    // MODAL
    // ========================================
    function abrirModal(titulo, dados = null) {
        const titleEl = document.getElementById('modalFornecedorTitle');
        if (titleEl) titleEl.textContent = titulo;
        
        if (dados) {
            document.getElementById('fNome').value = dados.nome || '';
            document.getElementById('fCnpj').value = dados.cnpj || '';
            document.getElementById('fTelefone').value = dados.telefone || '';
            document.getElementById('fEmail').value = dados.email || '';
            document.getElementById('fEndereco').value = dados.endereco || '';
            document.getElementById('fStatus').value = dados.ativo ? 'true' : 'false';
            editandoId = dados.id || null;
        } else {
            form.reset();
            editandoId = null;
            document.getElementById('fStatus').value = 'true';
        }
        
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function fecharModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        editandoId = null;
    }

    // Eventos do Modal
    const btnNovo = document.getElementById('btnNovoFornecedor');
    if (btnNovo) {
        btnNovo.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModal('➕ Novo Fornecedor');
        });
    }

    const btnFechar = document.getElementById('fecharModalFornecedor');
    if (btnFechar) {
        btnFechar.addEventListener('click', function(e) {
            e.preventDefault();
            fecharModal();
        });
    }

    const btnCancelar = document.getElementById('cancelarFornecedor');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function(e) {
            e.preventDefault();
            fecharModal();
        });
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                fecharModal();
            }
        });
    }

    // ========================================
    // FUNÇÕES CRUD
    // ========================================
    function editarFornecedor(id) {
        if (!window.ERPStore) return;
        const f = window.ERPStore.getFornecedor(id);
        if (f) {
            abrirModal('✏️ Editar Fornecedor', f);
        } else {
            showToast('⚠️ Fornecedor não encontrado', 'error');
        }
    }

    function excluirFornecedor(id) {
        if (!window.ERPStore) return;
        const f = window.ERPStore.getFornecedor(id);
        if (!f) {
            showToast('⚠️ Fornecedor não encontrado', 'error');
            return;
        }
        
        if (confirm(`⚠️ Tem certeza que deseja excluir o fornecedor "${f.nome}"?`)) {
            const excluido = window.ERPStore.excluirFornecedor(id);
            if (excluido) {
                renderizarFornecedores();
                showToast(`🗑️ Fornecedor "${f.nome}" excluído com sucesso!`, 'success');
            } else {
                showToast('❌ Erro ao excluir fornecedor', 'error');
            }
        }
    }

    // ========================================
    // SALVAR
    // ========================================
    const btnSalvar = document.getElementById('salvarFornecedor');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', function(e) {
            e.preventDefault();
            
            const dados = {
                nome: document.getElementById('fNome').value.trim(),
                cnpj: document.getElementById('fCnpj').value.trim(),
                telefone: document.getElementById('fTelefone').value.trim(),
                email: document.getElementById('fEmail').value.trim(),
                endereco: document.getElementById('fEndereco').value.trim(),
                ativo: document.getElementById('fStatus').value === 'true'
            };

            if (!dados.nome) {
                showToast('⚠️ O nome do fornecedor é obrigatório!', 'error');
                document.getElementById('fNome').focus();
                return;
            }

            if (!window.ERPStore) {
                showToast('⚠️ Sistema não inicializado', 'error');
                return;
            }

            if (editandoId) {
                const atualizado = window.ERPStore.editarFornecedor(editandoId, dados);
                if (atualizado) {
                    showToast('✏️ Fornecedor atualizado com sucesso!', 'success');
                } else {
                    showToast('❌ Erro ao atualizar fornecedor', 'error');
                }
            } else {
                const novo = window.ERPStore.adicionarFornecedor(dados);
                if (novo) {
                    showToast('✅ Fornecedor adicionado com sucesso!', 'success');
                } else {
                    showToast('❌ Erro ao adicionar fornecedor', 'error');
                }
            }

            fecharModal();
            renderizarFornecedores();
        });
    }

    // ========================================
    // BUSCA
    // ========================================
    if (buscarInput) {
        buscarInput.addEventListener('input', function() {
            renderizarFornecedores();
        });

        buscarInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                renderizarFornecedores();
            }
        });
    }

    // ========================================
    // TEMA
    // ========================================
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }

    // ========================================
    // ATALHO TECLADO (ESC)
    // ========================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            fecharModal();
        }
    });

    // ========================================
    // INSCREVER NO STORE
    // ========================================
    function inicializar() {
        if (window.ERPStore) {
            console.log('🏭 Fornecedores conectado ao store');
            renderizarFornecedores();
            
            window.ERPStore.subscribe(function(dados) {
                console.log('🔄 Store atualizado, renderizando fornecedores...');
                renderizarFornecedores();
            });
        } else {
            console.warn('⚠️ Store não encontrado');
            showToast('⚠️ Sistema não inicializado corretamente', 'error');
        }
    }

    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

    console.log('🏭 Gestão de Fornecedores carregada com sucesso!');

})();