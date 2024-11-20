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
    res.status(201).send('criado ');
  } catch (err) {
    console.error('eerrro', err); 
    res.status(500).send('Erro');
  }
});

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM systems');
    res.status(200).json(result.recordset);  
  } catch (err) {
    console.error('erro', err);
    res.status(500).send('erro');
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
      res.status(200).send('atualizado com sucesso');
    } else {
      res.status(404).send('não encontrado');
    }
  } catch (err) {
    console.error('Erro ', err);
    res.status(500).send('Erro ');
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
      res.status(200).send('excluído ');
    } else {
      res.status(404).send(' não encontrado');
    }
  } catch (err) {
    console.error('Erro ', err);
    res.status(500).send('Erro ');
  }
});

module.exports = router;