document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('finanpro_token');
  const nomeUsuario = localStorage.getItem('finanpro_usuario');

  if (!token) {
    alert('Acesso negado. Por favor, faça login.');
    window.location.href = 'login.html';
    return;
  }

  const userGreeting = document.getElementById('usuarioNome');
  if (userGreeting && nomeUsuario) {
    userGreeting.textContent = `Olá, ${nomeUsuario}`;
  }

  let graficoChart = null;

  // --- 1. BUSCAR TRANSAÇÕES DA API ---
  async function carregarDashboard() {
    try {
      const response = await fetch('http://localhost:3000/api/transacoes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert('Sessão expirada. Faça login novamente.');
          localStorage.clear();
          window.location.href = 'login.html';
          return;
        }
        throw new Error('Erro ao carregar dados');
      }

      const transacoes = await response.json();
      renderizarInterface(transacoes);
    } catch (err) {
      console.error('Erro:', err);
    }
  }

  // --- 2. RENDERIZAR TABELA, TOTALISADORES E GRÁFICO ---
  function renderizarInterface(transacoes) {
  const tabelaBody = document.getElementById('tabelaTransacoes');
  if (!tabelaBody) return;

  tabelaBody.innerHTML = '';

  let totalReceitas = 0;
  let totalDespesas = 0;

  // 1. Somar valores e criar as linhas da tabela
  transacoes.forEach(t => {
    const valor = parseFloat(t.valor);

    if (t.tipo === 'receita') {
      totalReceitas += valor;
    } else {
      totalDespesas += valor;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-white">${t.descricao}</td>
      <td><span class="badge bg-dark text-muted-custom border border-secondary">${t.categoria}</span></td>
      <td class="text-muted-custom">${t.data}</td>
      <td class="text-end fw-bold ${t.tipo === 'receita' ? 'text-green' : 'text-red'}">
        ${t.tipo === 'receita' ? '+' : '-'} R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger btn-deletar" data-id="${t.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tabelaBody.appendChild(tr);
  });

  // 2. Atualizar os Cards de Métricas no topo da página
  const cardReceitas = document.getElementById('cardReceitas');
  const cardDespesas = document.getElementById('cardDespesas');
  const cardSaldo = document.getElementById('cardSaldo');

  const saldo = totalReceitas - totalDespesas;

  if (cardReceitas) {
    cardReceitas.textContent = `R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (cardDespesas) {
    cardDespesas.textContent = `R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (cardSaldo) {
    cardSaldo.textContent = `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Altera a cor do saldo (verde se for >= 0, vermelho se for negativo)
    if (saldo < 0) {
      cardSaldo.className = 'fw-bold text-red mb-0';
    } else {
      cardSaldo.className = 'fw-bold text-white mb-0';
    }
  }

  // 3. Atualizar o gráfico e listeners
  atualizarGrafico(totalReceitas, totalDespesas);
  configurarBotoesDeletar();
}

  // --- 3. ADICIONAR NOVA TRANSAÇÃO ---
  // ID corrigido para bater com id="formTransacao" do HTML
  const formTransacao = document.getElementById('formTransacao');
  formTransacao?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const descricao = document.getElementById('transacaoDesc').value;
    const valor = parseFloat(document.getElementById('transacaoValor').value);
    const tipo = document.getElementById('transacaoTipo').value;
    const categoria = tipo === 'receita' ? 'Receita' : 'Despesa';
    const data = new Date().toLocaleDateString('pt-BR');

    try {
      const response = await fetch('http://localhost:3000/api/transacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ descricao, valor, tipo, categoria, data })
      });

      if (response.ok) {
        formTransacao.reset();
        const modalElement = document.getElementById('modalNovaTransacao');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal?.hide();

        carregarDashboard();
      }
    } catch (err) {
      alert('Erro ao salvar transação.');
    }
  });

  // --- 4. EXCLUIR TRANSAÇÃO ---
  function configurarBotoesDeletar() {
    document.querySelectorAll('.btn-deletar').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('Deseja realmente excluir esta transação?')) {
          await fetch(`http://localhost:3000/api/transacoes/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          carregarDashboard();
        }
      });
    });
  }

  // --- 5. GRÁFICO CHART.JS ---
  function atualizarGrafico(receitas, despesas) {
    const canvas = document.getElementById('graficoFinancas');
    if (!canvas) return;

    if (graficoChart) graficoChart.destroy();

    const ctx = canvas.getContext('2d');
    graficoChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Receitas', 'Despesas'],
        datasets: [{
          data: [receitas, despesas],
          backgroundColor: ['#10b981', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#ffffff' } }
        }
      }
    });
  }

  carregarDashboard();
});