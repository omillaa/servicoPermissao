const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../services/db');


router.post('/', async (req, res) => {
    const { name, sistema_nome } = req.body;
    
    try {
      const pool = await poolPromise;
      const sistemaResult = await pool.request()
            .input('sistema_nome', sql.NVarChar, sistema_nome)
            .query('SELECT id FROM systems WHERE name = @sistema_nome');

            if (sistemaResult.recordset.length === 0) {
              return res.status(404).send('Sistema não encontrado');
          }
  
          const id_sistema = sistemaResult.recordset[0].id;
  
          // Insere a permissão na tabela 'permission'
          const { recordset } = await pool.request()
              .input('nome', sql.NVarChar, nome)
              .input('id_sistema', sql.Int, id_sistema)
              .query('INSERT INTO permission (nome, id_sistema) OUTPUT INSERTED.id VALUES (@nome, @id_sistema)');  
      res.status(201).send('Permissão criada!');
    } catch (err) {
      console.error('Erro ao criar permissão: ', err);
      res.status(500).send('Erro');
    }
  });
  
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT p.id, p.nome AS permissao_nome, s.name AS sistema_nome
      FROM permission p
      JOIN systems s ON p.id_sistema = s.id`);
    res.status(200).json(result.recordset);  
  } catch (err) {
    console.error('Erro: ', err);
    res.status(500).send('Erro');
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, sistema_nome } = req.body; 
  
  try {
      const pool = await poolPromise;

      const sistemaResult = await pool.request()
      .input('sistema_nome', sql.NVarChar, sistema_nome)
      .query('SELECT id FROM systems WHERE name = @sistema_nome');

      if (sistemaResult.recordset.length === 0) {
          return res.status(404).send('Sistema não encontrado');
      }

      const id_sistema = sistemaResult.recordset[0].id;

      const result = await pool.request()
          .input('id', sql.Int, id)
          .input('nome', sql.NVarChar, nome)
          .input('id_sistema', sql.Int, id_sistema)
          .query('UPDATE permission SET nome = @nome, id_sistema = @id_sistema WHERE id = @id');

      if (result.rowsAffected > 0) {
          res.status(200).send('Permissão atualizada com sucesso');
      } else {
          res.status(404).send('Permissão não encontrada');
      }
  } catch (err) {
      console.error('Erro ao atualizar permissão:', err);
      res.status(500).send('Erro');
    }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM permission WHERE id = @id');

    if (result.rowsAffected > 0) {
      res.status(200).send('Permissão excluída');
    } else {
      res.status(404).send('Permissão não encontrada');
    }
  } catch (err) {
    console.error('Erro ao excluir permissão: ', err);
    res.status(500).send('Erro');
  }
});

module.exports = router;
