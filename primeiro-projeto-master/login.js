document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.querySelector('form');

  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Erro ao realizar login.');
        return;
      }

      // Guardar o Token JWT e o Nome do Usuário na sessão do navegador
      localStorage.setItem('finanpro_token', data.token);
      localStorage.setItem('finanpro_usuario', data.nome);

      alert('Login realizado com sucesso!');
      window.location.href = 'dashboard.html'; // Redireciona para o painel
    } catch (err) {
      console.error('Erro na requisição:', err);
      alert('Não foi possível conectar ao servidor. Certifique-se de que o backend está a rodar.');
    }
  });
});