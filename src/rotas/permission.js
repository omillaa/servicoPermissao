const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../services/db');


router.post('/', async (req, res) => {
    const { name, permissions } = req.body;
    
    try {
      const pool = await poolPromise;

      const { recordset } = await pool.request()
        .input('name', sql.NVarChar, name)
        .query('INSERT INTO systems (name) OUTPUT INSERTED.id VALUES (@name)');

      if (permissions?.length) {
        await Promise.all(permissions.map(permissionId => 
          pool.request()
            .input('system_id', sql.Int, recordset[0].id)
            .input('permission_id', sql.Int, permissionId)
            .query('INSERT INTO system_permissions (system_id, permission_id) VALUES (@system_id, @permission_id)')
        ));
      }
  
      res.status(201).send('Sistema e permissões criados');
    } catch (err) {
      console.error(err);
      res.status(500).send('Erro');
    }
  });
  


router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM systems');
    res.status(200).json(result.recordset);  
  } catch (err) {
    console.error('Erro', err);
    res.status(500).send('Erro');
  }
});


router.get('/:systemId/permissions', async (req, res) => {
  const { systemId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('systemId', sql.Int, systemId)
      .query(`
        SELECT p.id, p.nome 
        FROM permissions p
        JOIN system_permissions sp ON p.id = sp.permission_id
        WHERE sp.system_id = @systemId
      `);
    res.status(200).json(result.recordset);  
  } catch (err) {
    console.error('Erro', err);
    res.status(500).send('Erro');
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, permissions } = req.body; 
  
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .query('UPDATE systems SET name = @name WHERE id = @id');

    if (result.rowsAffected > 0) {
      
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM system_permissions WHERE system_id = @id'); 

      if (permissions && permissions.length > 0) {
        const permissionQueries = permissions.map(permissionId => 
          pool.request()
            .input('system_id', sql.Int, id)
            .input('permission_id', sql.Int, permissionId)
            .query('INSERT INTO system_permissions (system_id, permission_id) VALUES (@system_id, @permission_id)')
        );
        await Promise.all(permissionQueries);
      }
      
      res.status(200).send('Sistema atualizado com sucesso');
    } else {
      res.status(404).send('Sistema não encontrado');
    }
  } catch (err) {
    console.error('Erro', err);
    res.status(500).send('Erro');
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM system_permissions WHERE system_id = @id');

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM systems WHERE id = @id');

    if (result.rowsAffected > 0) {
      res.status(200).send('Sistema e permissões excluídos');
    } else {
      res.status(404).send('Sistema não encontrado');
    }
  } catch (err) {
    console.error('Erro', err);
    res.status(500).send('Erro');
  }
});

module.exports = router;
