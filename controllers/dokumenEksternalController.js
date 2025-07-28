const db = require('../db');
const path = require('path');
const fs = require('fs');

// === Upload Dokumen Eksternal ===
exports.upload = (req, res) => {
  const { title, tanggal, keterangan, user_id, revisi } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'File wajib diunggah.' });
  }

  const sql = `
    INSERT INTO dokumen_eksternal 
    (title, tanggal, keterangan, revisi, file, status, alasan_reject, user_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  const values = [title, tanggal, keterangan, revisi, file.filename, 'pending', '', user_id];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal menyimpan dokumen.', error: err });
    }
    res.status(200).json({ message: 'Dokumen berhasil diunggah.' });
  });
};

// === Ambil Semua Dokumen Eksternal ===
exports.getAll = (req, res) => {
  const sql = 'SELECT * FROM dokumen_eksternal ORDER BY tanggal DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data.', error: err });
    res.status(200).json(results);
  });
};

// === Cari Dokumen ===
exports.search = (req, res) => {
  const keyword = req.query.q;
  const sql = `SELECT * FROM dokumen_eksternal WHERE title LIKE ? OR keterangan LIKE ?`;
  db.query(sql, [`%${keyword}%`, `%${keyword}%`], (err, results) => {
    if (err) return res.status(500).json({ message: 'Pencarian gagal.', error: err });
    res.status(200).json(results);
  });
};

// === Filter Berdasarkan Tanggal ===
exports.filterByTanggal = (req, res) => {
  const { start, end } = req.query;
  const sql = `SELECT * FROM dokumen_eksternal WHERE tanggal BETWEEN ? AND ?`;
  db.query(sql, [start, end], (err, results) => {
    if (err) return res.status(500).json({ message: 'Filter gagal.', error: err });
    res.status(200).json(results);
  });
};

// === Update Dokumen ===
exports.update = (req, res) => {
  const id = req.params.id;
  const { title, tanggal, keterangan, revisi } = req.body;
  const file = req.file;

  if (file) {
    db.query('SELECT file FROM dokumen_eksternal WHERE id = ?', [id], (err, results) => {
      if (err || results.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan.' });

      const oldFile = results[0].file;
      const filePath = path.join(__dirname, '../uploads/eksternal/', oldFile);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      const sqlUpdate = `
        UPDATE dokumen_eksternal SET title=?, tanggal=?, keterangan=?, revisi=?, file=? WHERE id=?
      `;
      db.query(sqlUpdate, [title, tanggal, keterangan, revisi, file.filename, id], (err) => {
        if (err) return res.status(500).json({ message: 'Gagal update dokumen.', error: err });
        res.status(200).json({ message: 'Dokumen berhasil diupdate.' });
      });
    });
  } else {
    const sql = `UPDATE dokumen_eksternal SET title=?, tanggal=?, keterangan=?, revisi=? WHERE id=?`;
    db.query(sql, [title, tanggal, keterangan, revisi, id], (err) => {
      if (err) return res.status(500).json({ message: 'Gagal update dokumen.', error: err });
      res.status(200).json({ message: 'Dokumen berhasil diupdate.' });
    });
  }
};

// === Hapus Dokumen ===
exports.remove = (req, res) => {
  const id = req.params.id;
  db.query('SELECT file FROM dokumen_eksternal WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan.' });

    const filePath = path.join(__dirname, '../uploads/eksternal/', results[0].file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    db.query('DELETE FROM dokumen_eksternal WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ message: 'Gagal menghapus dokumen.', error: err });
      res.status(200).json({ message: 'Dokumen berhasil dihapus.' });
    });
  });
};

// === Update Status Dokumen ===
exports.updateStatus = (req, res) => {
  const id = req.params.id;
  const { status, alasan } = req.body;

  const sql = `UPDATE dokumen_eksternal SET status=?, alasan_reject=? WHERE id=?`;
  db.query(sql, [status, status === 'reject' ? alasan : '', id], (err) => {
    if (err) return res.status(500).json({ message: 'Gagal mengubah status.', error: err });
    res.status(200).json({ message: 'Status berhasil diperbarui.' });
  });
};
