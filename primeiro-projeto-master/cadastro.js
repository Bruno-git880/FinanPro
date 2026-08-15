document.addEventListener('DOMContentLoaded', () => {
  const formCadastro = document.querySelector('form');

  formCadastro?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome')?.value || 'Utilizador';
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Erro ao criar conta.');
        return;
      }

      alert('Conta criada com sucesso! Redirecionando para o login...');
      window.location.href = 'login.html';
    } catch (err) {
      console.error('Erro na requisição:', err);
      alert('Erro de conexão com o servidor.');
    }
  });
});