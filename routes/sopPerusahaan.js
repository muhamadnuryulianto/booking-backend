const express = require('express');
const router = express.Router();
const controller = require('../controllers/sopPerusahaanController');
const upload = require('../middlewares/uploadSOP');

// Upload file SOP Perusahaan
router.post('/upload', upload.single('file'), controller.upload);

// Get semua data SOP Perusahaan
router.get('/', controller.getAll);

// Search berdasarkan judul atau keterangan
router.get('/search', controller.search);

// Filter berdasarkan tanggal
router.get('/filter', controller.filterByTanggal);

// Update dokumen (dengan file)
router.put('/update/:id', upload.single('file'), controller.update);

// Hapus dokumen
router.delete('/delete/:id', controller.remove);

// Update status dokumen (approved / rejected)
router.put('/status/:id', controller.updateStatus);

module.exports = router;
