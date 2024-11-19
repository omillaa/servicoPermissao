const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../services/db');


router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM permissions');
        res.send(result.recordset);
    } catch (error) {
        res.status(500).send('Erro ao buscar permissões: ' + error.message);
    }
});


router.post('/', async (req, res) => {
    const { name, description } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.VarChar, name)
            .input('description', sql.VarChar, description)
            .query('INSERT INTO permissions (name, description) VALUES (@name, @description)');
        res.status(201).send('Permissão criada com sucesso');
    } catch (error) {
        res.status(500).send('Erro ao criar permissão: ' + error.message);
    }
});


module.exports = router;
