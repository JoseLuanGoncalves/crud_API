const express = require('express');
const { Pool } = require('pg'); 
const app = express();
const PORT = 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
});

app.use(express.json());

async function createTable() {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS dados_api (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        value INT,
        modifiedDate TIMESTAMP
      );
    `);
    client.release();
    console.log('Tabela verificada/criada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
  }
}

app.get('/', (req, res) => {
  res.send('API funcionando!');
});

app.get('/get', (req, res) => {
  const { nome } = req.query;
  
  if (!nome) {
    return res.status(400).json({ 
      erro: "Nome é obrigatório!",
      mensagem: "Use: /get?nome=SeuNome" 
    });
  }

  if (nome.trim() === "") {
    return res.status(400).json({
      erro: "Nome inválido!",
      mensagem: "O nome não pode estar vazio."
    });
  }

  res.send(`Olá, ${nome}!`);
});

app.post('/post', (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).send('Nome é obrigatório!');
  res.send(`Olá, ${nome}!`);
});

app.put('/put', (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).send('Nome é obrigatório!');
  res.send(`${nome}, atualizado com sucesso!`);
});

app.delete('/delete/:nome', (req, res) => {
  const { nome } = req.params;
  res.send(`${nome}, deletado com sucesso!`);
});

app.get('/seed', async (req, res) => {
  try {
    const data = [];
    // Gera 4000 registros (igual ao Python)
    // --- 1000 registros para dias entre 10 e 14/08/2025 ---
    for (let i = 0; i < 1000; i++) {
      const day = Math.floor(Math.random() * 5) + 10; // 10 a 14
      const baseDate = new Date(2025, 7, day); // Mês 7 = agosto (0-indexed)
      const randomSeconds = Math.floor(Math.random() * 86400);
      const modifiedDate = new Date(baseDate.getTime() + randomSeconds * 1000);

      data.push({
        name: `Registro-${i + 1}`,
        value: Math.floor(Math.random() * 1000) + 1,
        modifiedDate: modifiedDate.toISOString().replace('T', ' ').substring(0, 19),
      });
    }

    // --- 3000 registros para 15/08/2025 ---
    const baseDate15 = new Date(2025, 7, 15); // 15 de agosto
    for (let i = 1000; i < 4000; i++) {
      const randomSeconds = Math.floor(Math.random() * 86400);
      const modifiedDate = new Date(baseDate15.getTime() + randomSeconds * 1000);

      data.push({
        name: `Registro-${i + 1}`,
        value: Math.floor(Math.random() * 1000) + 1,
        modifiedDate: modifiedDate.toISOString().replace('T', ' ').substring(0, 19),
      });
    }

    // Insere os dados no banco
    const client = await pool.connect();
    for (const record of data) {
      await client.query(
        'INSERT INTO dados_api (name, value, modifiedDate) VALUES ($1, $2, $3)',
        [record.name, record.value, record.modifiedDate]
      );
    }
    client.release();

    res.json({ message: 'Banco populado com sucesso com 4000 registros!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, async () => {
  await createTable(); // ← Garante que a tabela existe
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});