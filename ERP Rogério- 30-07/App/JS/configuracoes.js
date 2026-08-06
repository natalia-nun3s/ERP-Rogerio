// ========================================
// CONFIGURACOES.JS - ERP IMS
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
        'funcionarios': document.getElementById('tab-funcionarios'),
        'departamentos': document.getElementById('tab-departamentos'),
        'rh': document.getElementById('tab-rh')
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            Object.keys(tabContents).forEach(key => {
                tabContents[key].style.display = key === this.dataset.tab ? 'block' : 'none';
            });
        });
    });

    // ========================================
    // DADOS
    // ========================================
    let funcionarios = [];
    let departamentos = [];
    let rhAcoes = [];
    let editandoId = null;

    function carregarDados() {
        try {
            const f = localStorage.getItem('erp_ims_funcionarios');
            if (f) funcionarios = JSON.parse(f);
            const d = localStorage.getItem('erp_ims_departamentos');
            if (d) departamentos = JSON.parse(d);
            const r = localStorage.getItem('erp_ims_rh_acoes');
            if (r) rhAcoes = JSON.parse(r);
        } catch (e) { 
            funcionarios = [];
            departamentos = [];
            rhAcoes = [];
        }
        renderizarFuncionarios();
        renderizarDepartamentos();
        renderizarRH();
        atualizarResumoRH();
    }

    function salvarDados() {
        try {
            localStorage.setItem('erp_ims_funcionarios', JSON.stringify(funcionarios));
            localStorage.setItem('erp_ims_departamentos', JSON.stringify(departamentos));
            localStorage.setItem('erp_ims_rh_acoes', JSON.stringify(rhAcoes));
        } catch (e) {}
    }

    // ========================================
    // FUNCIONÁRIOS
    // ========================================
    function renderizarFuncionarios() {
        const tbody = document.getElementById('tabelaFuncionarios');
        const termo = document.getElementById('buscarFuncionario').value.toLowerCase().trim();
        
        let filtrados = funcionarios;
        if (termo) {
            filtrados = funcionarios.filter(f => 
                f.nome.toLowerCase().includes(termo) ||
                f.cargo.toLowerCase().includes(termo) ||
                f.departamento.toLowerCase().includes(termo)
            );
        }

        document.getElementById('funcionarioCount').textContent = `${filtrados.length} funcionário${filtrados.length !== 1 ? 's' : ''}`;

        if (filtrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="icon">📭</div>
                        ${funcionarios.length === 0 ? 'Nenhum funcionário cadastrado' : 'Nenhum resultado encontrado'}
                    </td>
                </tr>
            `;
            return;
        }

        const statusMap = {
            'ativo': '<span class="badge-status ativo">🟢 Ativo</span>',
            'inativo': '<span class="badge-status inativo">🔴 Inativo</span>',
            'ferias': '<span class="badge-status ferias">🟡 Férias</span>'
        };

        tbody.innerHTML = filtrados.map((f, index) => `
            <tr data-id="${f.id || index}" onclick="window.selecionarFuncionario(this, ${index})">
                <td><strong>${f.nome}</strong></td>
                <td>${f.cpf || '—'}</td>
                <td>${f.cargo || '—'}</td>
                <td>${f.departamento || '—'}</td>
                <td>${statusMap[f.status] || statusMap['ativo']}</td>
                <td>
                    <button class="btn btn-sm btn-warning editar-func" data-index="${index}">✏️</button>
                    <button class="btn btn-sm btn-danger excluir-func" data-index="${index}">🗑</button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.editar-func').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.dataset.index);
                editarFuncionario(idx);
            });
        });

        document.querySelectorAll('.excluir-func').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.dataset.index);
                if (confirm(`⚠️ Tem certeza que deseja excluir "${funcionarios[idx].nome}"?`)) {
                    funcionarios.splice(idx, 1);
                    salvarDados();
                    renderizarFuncionarios();
                    atualizarResumoRH();
                    showToast(`🗑 Funcionário excluído!`, 'info');
                }
            });
        });

        atualizarResumoRH();
    }

    window.selecionarFuncionario = function(row, index) {
        document.querySelectorAll('#tabelaFuncionarios tr').forEach(tr => tr.classList.remove('selecionado'));
        row.classList.add('selecionado');
        const f = funcionarios[index];
        if (f) {
            document.getElementById('fNome').value = f.nome || '';
            document.getElementById('fCpf').value = f.cpf || '';
            document.getElementById('fTelefone').value = f.telefone || '';
            document.getElementById('fEmail').value = f.email || '';
            document.getElementById('fCargo').value = f.cargo || '';
            document.getElementById('fDepartamento').value = f.departamento || 'Administração';
            document.getElementById('fStatus').value = f.status || 'ativo';
            document.getElementById('formBadge').textContent = 'editar';
            editandoId = index;
        }
    };

    function editarFuncionario(index) {
        const f = funcionarios[index];
        if (f) {
            document.getElementById('fNome').value = f.nome || '';
            document.getElementById('fCpf').value = f.cpf || '';
            document.getElementById('fTelefone').value = f.telefone || '';
            document.getElementById('fEmail').value = f.email || '';
            document.getElementById('fCargo').value = f.cargo || '';
            document.getElementById('fDepartamento').value = f.departamento || 'Administração';
            document.getElementById('fStatus').value = f.status || 'ativo';
            document.getElementById('formBadge').textContent = 'editar';
            editandoId = index;
            document.querySelectorAll('#tabelaFuncionarios tr').forEach(tr => tr.classList.remove('selecionado'));
            document.querySelector(`#tabelaFuncionarios tr[data-id="${f.id}"]`)?.classList.add('selecionado');
        }
    }

    document.getElementById('adicionarFuncionario').addEventListener('click', function() {
        const nome = document.getElementById('fNome').value.trim();
        if (!nome) {
            showToast('⚠️ O nome é obrigatório!', 'error');
            return;
        }

        const dados = {
            id: Date.now(),
            nome: nome,
            cpf: document.getElementById('fCpf').value.trim(),
            telefone: document.getElementById('fTelefone').value.trim(),
            email: document.getElementById('fEmail').value.trim(),
            cargo: document.getElementById('fCargo').value.trim(),
            departamento: document.getElementById('fDepartamento').value,
            status: document.getElementById('fStatus').value
        };

        if (editandoId !== null) {
            funcionarios[editandoId] = { ...funcionarios[editandoId], ...dados };
            showToast('✏️ Funcionário atualizado!', 'success');
        } else {
            funcionarios.push(dados);
            showToast('✅ Funcionário adicionado!', 'success');
        }

        editandoId = null;
        document.getElementById('formBadge').textContent = 'novo';
        document.getElementById('formFuncionario').reset();
        salvarDados();
        renderizarFuncionarios();
        atualizarResumoRH();
    });

    document.getElementById('editarFuncionario').addEventListener('click', function() {
        if (editandoId === null) {
            showToast('⚠️ Selecione um funcionário para editar', 'warning');
            return;
        }
        document.getElementById('adicionarFuncionario').click();
    });

    document.getElementById('excluirFuncionario').addEventListener('click', function() {
        if (editandoId === null) {
            showToast('⚠️ Selecione um funcionário para excluir', 'warning');
            return;
        }
        if (confirm(`⚠️ Tem certeza que deseja excluir "${funcionarios[editandoId].nome}"?`)) {
            funcionarios.splice(editandoId, 1);
            editandoId = null;
            document.getElementById('formBadge').textContent = 'novo';
            document.getElementById('formFuncionario').reset();
            salvarDados();
            renderizarFuncionarios();
            atualizarResumoRH();
            showToast('🗑 Funcionário excluído!', 'info');
        }
    });

    document.getElementById('buscarFuncionario').addEventListener('input', renderizarFuncionarios);

    // ========================================
    // DEPARTAMENTOS
    // ========================================
    function renderizarDepartamentos() {
        const tbody = document.getElementById('tabelaDepartamentos');
        document.getElementById('departamentoCount').textContent = `${departamentos.length} departamento${departamentos.length !== 1 ? 's' : ''}`;

        if (departamentos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        <div class="icon">📭</div>
                        Nenhum departamento cadastrado
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = departamentos.map((d, index) => {
            const count = funcionarios.filter(f => f.departamento === d.nome).length;
            return `
                <tr>
                    <td><strong>${d.nome}</strong></td>
                    <td>${d.responsavel || '—'}</td>
                    <td>${count}</td>
                    <td>
                        <button class="btn btn-sm btn-danger excluir-dep" data-index="${index}">🗑</button>
                    </td>
                </tr>
            `;
        }).join('');

        document.querySelectorAll('.excluir-dep').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.dataset.index);
                if (confirm(`⚠️ Tem certeza que deseja excluir "${departamentos[idx].nome}"?`)) {
                    departamentos.splice(idx, 1);
                    salvarDados();
                    renderizarDepartamentos();
                    showToast('🗑 Departamento excluído!', 'info');
                }
            });
        });
    }

    document.getElementById('adicionarDepartamento').addEventListener('click', function() {
        const nome = document.getElementById('dNome').value.trim();
        if (!nome) {
            showToast('⚠️ O nome do departamento é obrigatório!', 'error');
            return;
        }
        departamentos.push({
            nome: nome,
            responsavel: document.getElementById('dResponsavel').value.trim()
        });
        document.getElementById('formDepartamento').reset();
        salvarDados();
        renderizarDepartamentos();
        showToast('✅ Departamento adicionado!', 'success');
    });

    // ========================================
    // RH
    // ========================================
    function atualizarResumoRH() {
        const total = funcionarios.length;
        const ativos = funcionarios.filter(f => f.status === 'ativo').length;
        const inativos = funcionarios.filter(f => f.status === 'inativo').length;
        const ferias = funcionarios.filter(f => f.status === 'ferias').length;

        document.getElementById('rhTotal').textContent = total;
        document.getElementById('rhAtivos').textContent = ativos;
        document.getElementById('rhInativos').textContent = inativos;
        document.getElementById('rhFerias').textContent = ferias;
    }

    function renderizarRH() {
        const tbody = document.getElementById('tabelaRH');
        if (rhAcoes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        <div class="icon">📭</div>
                        Nenhuma ação registrada
                    </td>
                </tr>
            `;
            return;
        }

        const statusMap = {
            'sucesso': '<span class="badge-status ativo">✅ Sucesso</span>',
            'pendente': '<span class="badge-status ferias">🟡 Pendente</span>',
            'cancelado': '<span class="badge-status inativo">❌ Cancelado</span>'
        };

        tbody.innerHTML = rhAcoes.slice().reverse().map(a => `
            <tr>
                <td>${a.data}</td>
                <td>${a.acao}</td>
                <td><strong>${a.funcionario}</strong></td>
                <td>${statusMap[a.status] || statusMap['sucesso']}</td>
            </tr>
        `).join('');
    }

    function registrarAcaoRH(acao, funcionario, status = 'sucesso') {
        rhAcoes.push({
            data: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            acao: acao,
            funcionario: funcionario,
            status: status
        });
        salvarDados();
        renderizarRH();
    }

    // ========================================
    // MODAL DESLIGAR
    // ========================================
    const modalDesligar = document.getElementById('modalDesligar');

    function atualizarSelectFuncionarios(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        select.innerHTML = '<option value="">Selecione um funcionário</option>';
        funcionarios.filter(f => f.status === 'ativo').forEach(f => {
            const option = document.createElement('option');
            option.value = f.id;
            option.textContent = `${f.nome} (${f.cargo || 'Sem cargo'})`;
            select.appendChild(option);
        });
    }

    document.getElementById('btnDesligarFuncionario').addEventListener('click', function() {
        if (funcionarios.filter(f => f.status === 'ativo').length === 0) {
            showToast('⚠️ Nenhum funcionário ativo para desligar', 'warning');
            return;
        }
        atualizarSelectFuncionarios('desligarFuncionario');
        document.getElementById('desligarData').value = new Date().toISOString().split('T')[0];
        modalDesligar.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    document.getElementById('fecharModalDesligar').addEventListener('click', () => {
        modalDesligar.classList.remove('active');
        document.body.style.overflow = '';
    });

    document.getElementById('cancelarDesligar').addEventListener('click', () => {
        modalDesligar.classList.remove('active');
        document.body.style.overflow = '';
    });

    modalDesligar.addEventListener('click', (e) => {
        if (e.target === modalDesligar) {
            modalDesligar.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    document.getElementById('confirmarDesligar').addEventListener('click', function() {
        const select = document.getElementById('desligarFuncionario');
        const id = parseInt(select.value);
        if (!id) {
            showToast('⚠️ Selecione um funcionário', 'error');
            return;
        }
        const motivo = document.getElementById('desligarMotivo').value;
        const data = document.getElementById('desligarData').value;
        const obs = document.getElementById('desligarObs').value;

        const func = funcionarios.find(f => f.id === id);
        if (func) {
            func.status = 'inativo';
            const motivoMap = {
                'pedido_demissao': 'Pedido de Demissão',
                'justa_causa': 'Justa Causa',
                'reducao_quadro': 'Redução de Quadro',
                'aposentadoria': 'Aposentadoria',
                'outro': 'Outro'
            };
            registrarAcaoRH(
                `🚫 Desligamento - ${motivoMap[motivo] || motivo}`,
                func.nome
            );
            salvarDados();
            renderizarFuncionarios();
            atualizarResumoRH();
            modalDesligar.classList.remove('active');
            document.body.style.overflow = '';
            showToast(`🚫 Funcionário ${func.nome} desligado com sucesso!`, 'success');
            
            // Redirecionar para página de RH (simulação)
            showToast('📋 Redirecionando para página de RH...', 'info');
            setTimeout(() => {
                // Simular redirecionamento - na prática seria window.location.href = 'rh.html'
                showToast('📋 Página de RH (simulação)', 'info');
            }, 1000);
        }
    });

    // ========================================
    // MODAL FÉRIAS
    // ========================================
    const modalFerias = document.getElementById('modalFerias');

    document.getElementById('btnFerias').addEventListener('click', function() {
        if (funcionarios.filter(f => f.status === 'ativo').length === 0) {
            showToast('⚠️ Nenhum funcionário ativo para registrar férias', 'warning');
            return;
        }
        atualizarSelectFuncionarios('feriasFuncionario');
        modalFerias.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    document.getElementById('fecharModalFerias').addEventListener('click', () => {
        modalFerias.classList.remove('active');
        document.body.style.overflow = '';
    });

    document.getElementById('cancelarFerias').addEventListener('click', () => {
        modalFerias.classList.remove('active');
        document.body.style.overflow = '';
    });

    modalFerias.addEventListener('click', (e) => {
        if (e.target === modalFerias) {
            modalFerias.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    document.getElementById('confirmarFerias').addEventListener('click', function() {
        const select = document.getElementById('feriasFuncionario');
        const id = parseInt(select.value);
        if (!id) {
            showToast('⚠️ Selecione um funcionário', 'error');
            return;
        }
        const inicio = document.getElementById('feriasInicio').value;
        const fim = document.getElementById('feriasFim').value;

        if (!inicio || !fim) {
            showToast('⚠️ Selecione as datas de início e fim', 'error');
            return;
        }

        const func = funcionarios.find(f => f.id === id);
        if (func) {
            func.status = 'ferias';
            registrarAcaoRH(
                `🌴 Férias - ${new Date(inicio).toLocaleDateString('pt-BR')} a ${new Date(fim).toLocaleDateString('pt-BR')}`,
                func.nome
            );
            salvarDados();
            renderizarFuncionarios();
            atualizarResumoRH();
            modalFerias.classList.remove('active');
            document.body.style.overflow = '';
            showToast(`🌴 Férias registradas para ${func.nome}!`, 'success');
        }
    });

    // ========================================
    // OUTRAS AÇÕES RH
    // ========================================
    document.getElementById('btnGerarFolha').addEventListener('click', function() {
        const ativos = funcionarios.filter(f => f.status === 'ativo').length;
        showToast(`📄 Gerando folha para ${ativos} funcionários ativos...`, 'info');
        setTimeout(() => {
            showToast('✅ Folha de pagamento gerada com sucesso!', 'success');
        }, 1500);
    });

    document.getElementById('btnGerarRelatorioRH').addEventListener('click', function() {
        const total = funcionarios.length;
        const ativos = funcionarios.filter(f => f.status === 'ativo').length;
        const inativos = funcionarios.filter(f => f.status === 'inativo').length;
        const ferias = funcionarios.filter(f => f.status === 'ferias').length;
        showToast(`📊 Relatório RH: ${total} funcionários (${ativos} ativos, ${inativos} inativos, ${ferias} férias)`, 'info');
    });

    // ========================================
    // EVENTOS GERAIS
    // ========================================
    document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);

    // ========================================
    // INICIALIZAÇÃO
    // ========================================
    carregarDados();
    console.log('⚙️ Configurações/RH ERP IMS carregado com sucesso!');

})();