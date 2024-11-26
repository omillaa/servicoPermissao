const express = require('express');
const { poolPromise, sql } = require('../services/db');  
const router = express.Router();


router.post('/', async (req, res) => {
  const { name, system_id } = req.body; 
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('system_id', sql.Int, system_id)
      .query('INSERT INTO roles (name, system_id) VALUES (@name, @system_id)');
    res.status(201).send('Papel cadastrado com sucesso!');
  } catch (err) {
    console.error('Erro ao cadastrar papel:', err);
    res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM roles');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Erro ao listar papéis:', err);
    res.status(500).send('Erro ao listar papéis');
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, system_id } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('system_id', sql.Int, system_id)
      .query('UPDATE roles SET name = @name, system_id = @system_id WHERE id = @id');

    if (result.rowsAffected > 0) {
      res.status(200).send('Papel atualizado com sucesso!');
    } else {
      res.status(404).send('Papel não encontrado');
    }
  } catch (err) {
    console.error('Erro ao atualizar papel:', err);
    res.status(500).send('Erro ao atualizar papel');
  }
});



router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM roles WHERE id = @id');

    if (result.rowsAffected > 0) {
      res.status(200).send('Papel deletado com sucesso!');
    } else {
      res.status(404).send('Papel não encontrado');
    }
  } catch (err) {
    console.error('Erro ao excluir papel:', err);
    res.status(500).send('Erro ao excluir papel');
  }
});


router.post('/:roleId/permissions', async (req, res) => {
    const { roleId } = req.params; 
    const { permissionId } = req.body; 
  
    try {
      const pool = await poolPromise;
      
     
      const roleCheck = await pool.request()
        .input('roleId', sql.Int, roleId)
        .query('SELECT * FROM roles WHERE id = @roleId');
      
      const permissionCheck = await pool.request()
        .input('permissionId', sql.Int, permissionId)
        .query('SELECT * FROM permissions WHERE id = @permissionId');
  
      
      if (roleCheck.recordset.length === 0 || permissionCheck.recordset.length === 0) {
        return res.status(404).send('Papel ou Permissão não encontrado');
      }
  
      
      const result = await pool.request()
        .input('roleId', sql.Int, roleId)
        .input('permissionId', sql.Int, permissionId)
        .query('INSERT INTO role_permissions (role_id, permission_id) VALUES (@roleId, @permissionId)');
  
      res.status(201).send('Permissão atribuída ao papel com sucesso');
    } catch (err) {
      console.error('Erro ao atribuir permissão ao papel:', err);
      res.status(500).send('Erro interno do servidor');
    }
  });
  

module.exports = router;
