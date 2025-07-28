const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/add', (req, res) => {
  const { username, password, role } = req.body;
  db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role], err => {
    if (err) return res.status(500).send(err);
    res.send('User added');
  });
});

// GET all users
router.get('/', (req, res) => {
  db.query('SELECT id, username, role FROM users ORDER BY id ASC', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// PUT reset password
router.put('/reset-password/:id', (req, res) => {
  const { password } = req.body;
  const userId = req.params.id;
  db.query(
    'UPDATE users SET password = ? WHERE id = ?',
    [password, userId],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send('Password berhasil direset');
    }
  );
});

// DELETE user by ID
router.delete('/delete/:id', (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM users WHERE id = ?', [userId], (err) => {
    if (err) return res.status(500).send(err);
    res.send('User berhasil dihapus');
  });
});



module.exports = router;