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
      .input('id', sql.Int, id)
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
    res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params; 

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
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


router.get('/:id/permissions', async (req, res) => {
  const { id } = req.params; 
  
  try {
    const pool = await poolPromise;
    
  
    const result = await pool.request()
      .input('userId', sql.Int, id)
      .query(`
        SELECT p.name AS permission_name
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = @userId
      `);
    
   
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Erro ao buscar permissões do usuário:', err);
    res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
  }
});


router.post('/:userId/roles', async (req, res) => {
  const { userId } = req.params;
  const { roleId } = req.body;

  try {
    const pool = await poolPromise;
  
    const userCheck = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM users WHERE id = @userId');
    
    const roleCheck = await pool.request()
      .input('roleId', sql.Int, roleId)
      .query('SELECT * FROM roles WHERE id = @roleId');

    if (userCheck.recordset.length === 0 || roleCheck.recordset.length === 0) {
      return res.status(404).send('Usuário ou Papel não encontrado');
    }


    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('roleId', sql.Int, roleId)
      .query('INSERT INTO user_roles (user_id, role_id) VALUES (@userId, @roleId)');

    res.status(201).send('Papel atribuído com sucesso');
  } catch (err) {
    console.error('Erro ao atribuir papel ao usuário:', err);
    res.status(500).send('Erro interno do servidor');
  }
});

module.exports = router;
