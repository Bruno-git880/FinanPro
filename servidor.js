const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'minha_chave_secreta_finanpro';

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve os arquivos estáticos (HTML, CSS, JS)

// --- CONEXÃO COM O BANCO DE DADOS (SQLite) ---
const db = new sqlite3.Database('./finanpro.db', (err) => {
  if (err) console.error('Erro ao conectar ao banco:', err.message);
  else console.log('Conectado ao banco de dados SQLite!');
});

// Criar tabelas se não existirem
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      descricao TEXT NOT NULL,
      valor REAL NOT NULL,
      tipo TEXT NOT NULL,
      categoria TEXT NOT NULL,
      data TEXT NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )
  `);
});

// --- ROTAS DE AUTENTICAÇÃO ---

// Cadastro de Usuário
app.post('/api/auth/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos!' });
  }

  const hashSenha = await bcrypt.hash(senha, 10);

  const query = `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`;
  db.run(query, [nome, email, hashSenha], function (err) {
    if (err) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: this.lastID });
  });
});

// Login de Usuário
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;

  db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], async (err, usuario) => {
    if (err || !usuario) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign({ id: usuario.id, nome: usuario.nome }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login bem-sucedido!', token, nome: usuario.nome });
  });
});

// --- MIDDLAWARE DE AUTENTICAÇÃO ---
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acesso não autorizado.' });

  jwt.verify(token, SECRET_KEY, (err, usuario) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
    req.usuario = usuario;
    next();
  });
}

// --- ROTAS DE TRANSAÇÕES ---

// Listar Transações do Usuário
app.get('/api/transacoes', autenticarToken, (req, res) => {
  db.all(`SELECT * FROM transacoes WHERE usuario_id = ? ORDER BY id DESC`, [req.usuario.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar transações.' });
    res.json(rows);
  });
});

// Criar Transação
app.post('/api/transacoes', autenticarToken, (req, res) => {
  const { descricao, valor, tipo, categoria, data } = req.body;

  const query = `INSERT INTO transacoes (usuario_id, descricao, valor, tipo, categoria, data) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(query, [req.usuario.id, descricao, valor, tipo, categoria, data], function (err) {
    if (err) return res.status(500).json({ error: 'Erro ao salvar transação.' });
    res.status(201).json({ id: this.lastID, descricao, valor, tipo, categoria, data });
  });
});

// Deletar Transação
app.delete('/api/transacoes/:id', autenticarToken, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM transacoes WHERE id = ? AND usuario_id = ?`, [id, req.usuario.id], function (err) {
    if (err) return res.status(500).json({ error: 'Erro ao deletar transação.' });
    res.json({ message: 'Transação removida com sucesso!' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor FinanPro rodando em http://localhost:${PORT}`);
});