const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../services/db');

// Criar permissão
router.post('/', async (req, res) => {
  const { nome, id_sistema } = req.body;  // Agora é esperado o ID do sistema diretamente

  try {
    const pool = await poolPromise;

    // Verificar se o sistema existe na tabela systems
    const sistemaResult = await pool.request()
      .input('id', sql.Int, id_sistema)  // Utilizando o ID diretamente
      .query('SELECT id FROM dbo.systems WHERE id = @id');  // "dbo" no nome da tabela

    if (sistemaResult.recordset.length === 0) {
      return res.status(404).send('Sistema não encontrado');
    }

    // Inserir permissão
    const result = await pool.request()
      .input('nome', sql.NVarChar, nome)
      .input('system_id', sql.Int, id_sistema)  // Utilizando o ID do sistema
      .query('INSERT INTO permissions (name, system_id) OUTPUT INSERTED.id VALUES (@name, @system_id)');
    
    res.status(201).send({ message: 'Permissão criada!', id: result.recordset[0].id });
  } catch (err) {
    console.error('Erro ao criar permissão: ', err);
    res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
  }
});

// Listar todas as permissões
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT p.id, p.nome AS permissao_nome, s.name AS sistema_nome
      FROM dbo.permission p
      JOIN dbo.systems s ON p.system_id = s.id
    `);  // Corrigido para 'system_id'
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Erro ao listar permissões: ', err);
    res.status(500).send('Erro ao listar permissões');
  }
});

// Atualizar permissão
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, id_sistema } = req.body;  // Agora é esperado o ID do sistema diretamente

  try {
    const pool = await poolPromise;

    // Verificar se o sistema existe
    const sistemaResult = await pool.request()
      .input('id_sistema', sql.Int, id_sistema)  // Utilizando o ID diretamente
      .query('SELECT id FROM dbo.systems WHERE id = @id_sistema');  // "dbo" no nome da tabela

    if (sistemaResult.recordset.length === 0) {
      return res.status(404).send('Sistema não encontrado');
    }

    // Atualizar permissão
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nome', sql.NVarChar, nome)
      .input('system_id', sql.Int, id_sistema)  // Utilizando o ID do sistema
      .query('UPDATE dbo.permission SET nome = @nome, system_id = @system_id WHERE id = @id');  // Corrigido para 'system_id'

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

// Deletar permissão
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    // Deletar permissão
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.permission WHERE id = @id');  // "dbo" no nome da tabela

    if (result.rowsAffected > 0) {
      res.status(200).send('Permissão excluída');
    } else {
      res.status(404).send('Permissão não encontrada');
    }
  } catch (err) {
    console.error('Erro ao excluir permissão: ', err);
    res.status(500).send('Erro ao excluir permissão');
  }
});

module.exports = router;
