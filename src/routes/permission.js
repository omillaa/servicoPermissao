const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../services/db');


router.post('/', async (req, res) => {
  const { nome, system_id } = req.body; 

  try {
    if (!system_id) {
      return res.status(400).send({ message: 'O campo system_id é obrigatório.' });
    }

    const pool = await poolPromise;

  
    const sistemaResult = await pool.request()
      .input('id', sql.Int, system_id)
      .query('SELECT id FROM dbo.systems WHERE id = @id');

    if (sistemaResult.recordset.length === 0) {
      return res.status(404).send('Sistema não encontrado');
    }

  
    const result = await pool.request()
      .input('name', sql.NVarChar, nome)
      .input('system_id', sql.Int, system_id)
      .query('INSERT INTO dbo.permissions (name, system_id) OUTPUT INSERTED.id VALUES (@name, @system_id)');

    res.status(201).send({ message: 'Permissão criada!', id: result.recordset[0].id });
  } catch (err) {
    console.error('Erro ao criar permissão:', err);
    res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT p.id, p.name AS permissao_nome, s.name AS sistema_nome
      FROM dbo.permissions p
      JOIN dbo.systems s ON p.system_id = s.id
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Erro ao listar permissões:', err);
    res.status(500).send('Erro ao listar permissões');
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, system_id } = req.body;

  try {
    if (!system_id) {
      return res.status(400).send({ message: 'O campo system_id é obrigatório.' });
    }

    const pool = await poolPromise;

    
    const sistemaResult = await pool.request()
      .input('id', sql.Int, system_id)
      .query('SELECT id FROM dbo.systems WHERE id = @id');

    if (sistemaResult.recordset.length === 0) {
      return res.status(404).send('Sistema não encontrado');
    }

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, nome)
      .input('system_id', sql.Int, system_id)
      .query('UPDATE dbo.permissions SET name = @name, system_id = @system_id WHERE id = @id');

    if (result.rowsAffected > 0) {
      res.status(200).send('Permissão atualizada com sucesso');
    } else {
      res.status(404).send('Permissão não encontrada');
    }
  } catch (err) {
    console.error('Erro ao atualizar permissão:', err);
    res.status(500).send('Erro ao atualizar permissão');
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

   
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.permissions WHERE id = @id');

    if (result.rowsAffected > 0) {
      res.status(200).send('Permissão excluída');
    } else {
      res.status(404).send('Permissão não encontrada');
    }
  } catch (err) {
    console.error('Erro ao excluir permissão:', err);
    res.status(500).send('Erro ao excluir permissão');
  }
});

module.exports = router;
