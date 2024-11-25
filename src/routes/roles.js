const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../services/db');  


router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('roles').select('*');
  if (error) return res.status(400).send(error.message);
  res.send(data);
});


router.post('/', async (req, res) => {
  const { name, system_id } = req.body;
  const { data, error } = await supabase.from('roles').insert([{ name, system_id }]);
  if (error) return res.status(400).send(error.message);
  res.status(201).send(data);
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, system_id } = req.body;
  const { data, error } = await supabase.from('roles').update({ name, system_id }).eq('id', id);
  if (error) return res.status(400).send(error.message);
  res.send(data);
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('roles').delete().eq('id', id);
  if (error) return res.status(400).send(error.message);
  res.send({ message: 'Papel deletado com sucesso!' });
});

module.exports = router;
