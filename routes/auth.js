const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
  db.query(query, [username, password], (err, rows) => {
    if (err) return res.status(500).send('Server error');
    if (rows.length === 0) return res.status(401).send('User not found');

    const user = rows[0];
    // ✅ Kirim ID dengan key `id` agar React bisa pakai
    res.json({
      id: user.id,
      username: user.username,
      role: user.role
    });
  });
});
module.exports = router;