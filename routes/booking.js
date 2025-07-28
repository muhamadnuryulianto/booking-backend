const express = require('express');
const router = express.Router();
const db = require('../db');

// === GET Semua Booking (Admin)
router.get('/', (req, res) => {
  const query = `
    SELECT 
      b.id,
      b.subject,
      b.room,
      b.date,
      b.start_time,
      b.end_time,
      b.description,
      b.status,
      b.reject_reason,
      b.user_id,
      u.username 
    FROM bookings b 
    LEFT JOIN users u ON b.user_id = u.id 
    ORDER BY b.date DESC, b.start_time ASC
  `;
  db.query(query, (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// === GET Booking berdasarkan User
router.get('/by-user/:userId', (req, res) => {
  const query = `
    SELECT 
      b.id,
      b.subject,
      b.room,
      b.date,
      b.start_time,
      b.end_time,
      b.description,
      b.status,
      b.reject_reason,
      b.user_id,
      u.username 
    FROM bookings b 
    LEFT JOIN users u ON b.user_id = u.id 
    WHERE b.user_id = ? 
    ORDER BY b.date DESC, b.start_time ASC
  `;
  db.query(query, [req.params.userId], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// === GET Booking berdasarkan Tanggal
router.get('/by-date/:date', (req, res) => {
  const query = `
    SELECT 
      b.id,
      b.subject,
      b.room,
      b.date,
      b.start_time,
      b.end_time,
      b.description,
      b.status,
      b.reject_reason,
      b.user_id,
      u.username 
    FROM bookings b 
    LEFT JOIN users u ON b.user_id = u.id 
    WHERE b.date = ? 
    ORDER BY b.start_time ASC
  `;
  db.query(query, [req.params.date], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// === CREATE Booking
router.post('/create', (req, res) => {
  const { subject, room, date, start_time, end_time, description, user_id } = req.body;

  if (!user_id) return res.status(400).send('User ID tidak boleh kosong');
  if (start_time >= end_time) return res.status(400).send('Jam selesai harus lebih besar dari jam mulai');

  const checkQuery = `
    SELECT * FROM bookings 
    WHERE room = ? AND date = ? 
    AND (start_time < ? AND end_time > ?)
  `;

  db.query(checkQuery, [room, date, end_time, start_time], (err, existing) => {
    if (err) return res.status(500).send(err);
    if (existing.length > 0) return res.status(409).send('Jadwal bentrok dengan booking lain');

    const insertQuery = `
      INSERT INTO bookings (subject, room, date, start_time, end_time, description, user_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    db.query(insertQuery, [subject, room, date, start_time, end_time, description, user_id], err2 => {
      if (err2) return res.status(500).send(err2);
      res.send('Booking created');
    });
  });
});

// === UPDATE STATUS BOOKING (Admin bebas, User hanya saat pending)
router.put('/status-secure/:id', (req, res) => {
  const { status, reason, role, user_id } = req.body;
  const bookingId = req.params.id;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).send('Status tidak valid');
  }

  const getStatusQuery = `SELECT status, user_id FROM bookings WHERE id = ?`;

  db.query(getStatusQuery, [bookingId], (err, results) => {
    if (err) return res.status(500).send('Gagal mengambil data booking');
    if (results.length === 0) return res.status(404).send('Booking tidak ditemukan');

    const currentStatus = results[0].status;
    const ownerId = results[0].user_id;

    // Validasi jika role bukan admin
    if (role !== 'admin') {
      if (currentStatus !== 'pending') {
        return res.status(403).send('User hanya boleh update saat status pending');
      }
      if (parseInt(user_id) !== parseInt(ownerId)) {
        return res.status(403).send('User tidak memiliki izin pada booking ini');
      }
    }

    // Update status
    let updateQuery, params;
    if (status === 'rejected') {
      updateQuery = `UPDATE bookings SET status='rejected', reject_reason=? WHERE id=?`;
      params = [reason || '-', bookingId];
    } else {
      updateQuery = `UPDATE bookings SET status='approved', reject_reason=NULL WHERE id=?`;
      params = [bookingId];
    }

    db.query(updateQuery, params, (err, result) => {
      if (err) return res.status(500).send('Gagal memperbarui status');
      if (result.affectedRows === 0) return res.status(404).send('Gagal update - booking tidak ditemukan');
      res.send('Status berhasil diperbarui');
    });
  });
});

// === UPDATE Status Booking (Admin)
router.put('/status/:id', (req, res) => {
  const { status, reason } = req.body;

  console.log('Update Status:', req.body, 'ID:', req.params.id);

  let query, params;

  if (status === 'rejected') {
    query = `
      UPDATE bookings 
      SET status = 'rejected', reject_reason = ?
      WHERE id = ?
    `;
    params = [reason || '-', req.params.id];
  } else if (status === 'approved') {
    query = `
      UPDATE bookings 
      SET status = 'approved', reject_reason = NULL
      WHERE id = ?
    `;
    params = [req.params.id];
  } else {
    return res.status(400).send('Status tidak valid');
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating status:', err);
      return res.status(500).send('Gagal memperbarui status');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Booking tidak ditemukan');
    }
    res.send('Status updated');
  });
});

// === DELETE Booking (Admin / User)
router.delete('/delete/:id', (req, res) => {
  console.log('BODY:', req.body); // Debug log untuk cek apakah role & userId masuk
  const { role, userId } = req.body;

  if (!role) return res.status(400).send('Role diperlukan');
  if (role !== 'admin' && !userId) return res.status(400).send('User ID diperlukan untuk non-admin');

  const query = role === 'admin'
    ? `DELETE FROM bookings WHERE id = ?`
    : `DELETE FROM bookings WHERE id = ? AND user_id = ? AND status = 'pending'`;

  const params = role === 'admin' ? [req.params.id] : [req.params.id, userId];

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(403).send('Tidak diizinkan atau booking tidak ditemukan');
    res.send('Booking deleted');
  });
});

// === UPDATE Booking (semua field oleh user yang membuat dan masih pending)
router.put('/:id', (req, res) => {
  const bookingId = req.params.id;
  const {
    subject,
    room,
    date,
    start_time,
    end_time,
    description,
    user_id,
  } = req.body;

  if (!subject || !room || !date || !start_time || !end_time || !user_id) {
    return res.status(400).send('Semua field wajib diisi');
  }

  const checkQuery = 'SELECT * FROM bookings WHERE id = ? AND user_id = ? AND status = "pending"';
  db.query(checkQuery, [bookingId, user_id], (err, results) => {
    if (err) return res.status(500).send('Gagal mengambil data booking');
    if (results.length === 0) return res.status(403).send('Tidak diizinkan atau booking tidak dalam status pending');

    const updateQuery = `
      UPDATE bookings 
      SET subject = ?, room = ?, date = ?, start_time = ?, end_time = ?, description = ?
      WHERE id = ?
    `;
    const params = [subject, room, date, start_time, end_time, description, bookingId];

    db.query(updateQuery, params, (err2, result) => {
      if (err2) return res.status(500).send('Gagal memperbarui booking');
      res.send('Booking berhasil diperbarui');
    });
  });
});

module.exports = router;
