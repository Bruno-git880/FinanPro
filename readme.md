# 📈 FinanPro — Sistema de Gestão Financeira

O **FinanPro** é uma aplicação web moderna e intuitiva para controle financeiro pessoal, projetada para ajudar os usuários a acompanhar receitas, despesas e saldo em tempo real com transparência e alta performance.

---

## 🚀 Funcionalidades

- **Acesso Demonstrativo (Modo Visitante):** Permite experimentar o sistema imediatamente, sem a necessidade de criar uma conta ou fazer login.
- **Persistência Local (`LocalStorage`):** As transações criadas no modo visitante ficam salvas localmente no navegador do usuário.
- **Resumo Financeiro em Tempo Real:** Cards dinâmicos que exibem *Receita Total*, *Despesas do Mês* e *Saldo Atual*.
- **Gráficos Interativos:** Visualização da proporção entre receitas e despesas utilizando gráficos de rosca (*Chart.js*).
- **Gestão de Transações:**
  - Cadastro de novas receitas e despesas via modal.
  - Tabela organizada de lançamentos recentes com indicação de categorias e valores formatados em **R$**.
  - Opção para limpar os dados armazenados localmente com apenas um clique.
- **Design Responsivo & Dark Mode:** Interface elegante nas cores **Preto, Verde (#10b981) e Vermelho (#ef4444)**, construída com Bootstrap 5.3.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - HTML5 & CSS3 Customizado
  - [Bootstrap 5.3](https://getbootstrap.com/) — Grid, componentes e modais
  - [Font Awesome 6](https://fontawesome.com/) — Ícones vetoriais
  - [Chart.js](https://www.chartjs.org/) — Gráficos interativos
- **Lógica e Armazenamento:**
  - JavaScript (ES6+)
  - `localStorage` API para persistência de dados no cliente

---

## 📂 Estrutura do Projeto

```text
finanpro/
├── index.html          # Landing Page principal com chamada para ação (Hero Section)
├── dashboard.html      # Painel de controle financeiro (Visão Geral e Tabela)
├── login.html          # Tela de autenticação do usuário
├── cadastro.html       # Tela de registro de novos usuários
├── css/
│   ├── global.css      # Estilos e variáveis globais
│   ├── index.css       # Estilos específicos da Landing Page
│   └── dashboard.css   # Estilos do painel, cards, tabelas e modais
└── js/
    └── dashboard.js    # Lógica de renderização, Chart.js e LocalStorage