// src/routes/systems.js
const express = require('express');
const router = express.Router();
//const { supabase } = require('../supa/supabase');  // Importa a instância do supabase

// Listar todos os sistemas
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('systems').select('*');
  if (error) return res.status(400).send(error.message);
  res.send(data);
});

module.exports = router;