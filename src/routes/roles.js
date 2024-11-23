const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../services/db');

router.post('/', async (req, res) => {
    const { nome, sistema_nome } = req.body; 
    try {
        const pool = await poolPromise; 
        const sistemaResult = await pool.request()
            .input('sistema_nome', sql.NVarChar, sistema_nome)
            .query('SELECT id FROM systems WHERE name = @sistema_nome');

        if (sistemaResult.recordset.length === 0) {
            return res.status(404).send('Sistema não encontrado'); 
        }

        const id_sistema = sistemaResult.recordset[0].id; 
        const { recordset } = await pool.request()
            .input('nome', sql.NVarChar, nome)
            .input('id_sistema', sql.Int, id_sistema)
            .query('INSERT INTO grupo (nome, id_sistema) OUTPUT INSERTED.id VALUES (@nome, @id_sistema)');

        res.status(201).json({ id: recordset[0].id, message: 'Grupo criado com sucesso' }); 
    } catch (err) {
        console.error('Erro ao criar grupo:', err); 
        res.status(500).send('Erro');
    }
});

router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise; 
        const result = await pool.request().query(`
            SELECT g.id, g.nome, g.id_sistema, s.name AS sistema_nome 
            FROM grupo g
            LEFT JOIN systems s ON g.id_sistema = s.id
        `);

        res.status(200).json(result.recordset); 
    } catch (err) {
        console.error('Erro ao listar grupos:', err); 
        res.status(500).send('Erro');
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params; 
    const { nome, id_sistema } = req.body; 

    try {
        const pool = await poolPromise; 
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('nome', sql.NVarChar, nome)
            .input('id_sistema', sql.Int, id_sistema)
            .query('UPDATE grupo SET nome = @nome, id_sistema = @id_sistema WHERE id = @id');

        if (result.rowsAffected > 0) {
            res.status(200).send('Grupo atualizado!');
        } else {
            res.status(404).send('Grupo não encontrado!'); 
        }
    } catch (err) {
        console.error('Erro ao atualizar grupo:', err); 
        res.status(500).send('Erro');
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params; 

    try {
        const pool = await poolPromise; 

        // Exclui o grupo pelo ID
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM grupo WHERE id = @id');

        if (result.rowsAffected > 0) {
            res.status(200).send('Grupo excluído com sucesso');
        } else {
            res.status(404).send('Grupo não encontrado'); 
        }
    } catch (err) {
        console.error('Erro ao excluir grupo:', err); 
        res.status(500).send('Erro ao excluir grupo');
    }
});

module.exports = router;