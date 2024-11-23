const express = require('express');
const { poolPromise, sql } = require('../services/db');  
const router = express.Router();


router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('name', sql.NVarChar, name) 
      .query('INSERT INTO systems (name) VALUES (@name)');
    res.status(201).send('Usuário Cadastrado!');
  } catch (err) {
    console.error('Usário não cadastrado', err); 
    res.status(500).send('Erro');
  }
});

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM systems');
    res.status(200).json(result.recordset);  
  } catch (err) {
    console.error('Usuário não encontrado', err);
    res.status(500).send('Erro');
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .query('UPDATE systems SET name = @name WHERE id = @id');

    if (result.rowsAffected > 0) {
      res.status(200).send('Dados atualizados com sucesso!');
    } else {
      res.status(404).send('Usuário não encontrado');
    }
  } catch (err) {
    console.error('Atualizações não concluidas!', err);
    res.status(500).send('Erro');
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM systems WHERE id = @id');

    if (result.rowsAffected > 0) {
      res.status(200).send('Usuário excluído!');
    } else {
      res.status(404).send('Usuário não encontrado');
    }
  } catch (err) {
    console.error('Usuário não excluido!', err);
    res.status(500).send('Erro');
  }
});

module.exports = router;