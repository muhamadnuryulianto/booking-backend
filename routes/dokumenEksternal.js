const express = require('express');
const router = express.Router();
const controller = require('../controllers/dokumenEksternalController');
const upload = require('../middlewares/uploadEksternal');

router.post('/upload', upload.single('file'), controller.upload);
router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/filter', controller.filterByTanggal);
router.put('/update/:id', upload.single('file'), controller.update);
router.delete('/delete/:id', controller.remove);
router.put('/status/:id', controller.updateStatus);

module.exports = router;
