const express = require('express');
const { poolPromise, sql } = require('../services/db');  
const router = express.Router();


router.post('/', async (req, res) => {
  const { name, email } = req.body; 
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('name', sql.NVarChar, name) 
      .input('email', sql.NVarChar, email) 
      .query('INSERT INTO users (name, email) VALUES (@name, @email)');
    res.status(201).send('Usuário criado com sucesso');
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    res.status(500).send('Erro interno do servidor');
  }
});

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM users');
    res.status(200).json(result.recordset); 
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).send('Erro interno do servidor');
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params; 
  const { name, email } = req.body; 
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .query('UPDATE users SET name = @name, email = @email WHERE id = @id');

    if (result.rowsAffected > 0) {
      res.status(200).send('Usuário atualizado com sucesso');
    } else {
      res.status(404).send('Usuário não encontrado');
    }
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).send('Erro interno do servidor');
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params; 

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query('DELETE FROM users WHERE id = @id');

    if (result.rowsAffected > 0) {
      res.status(200).send('Usuário excluído com sucesso');
    } else {
      res.status(404).send('Usuário não encontrado');
    }
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    res.status(500).send('Erro interno do servidor');
  }
});

module.exports = router;