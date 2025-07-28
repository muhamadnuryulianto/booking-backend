// Tambahan route dan middleware untuk peraturan perusahaan
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// ========== BUAT FOLDER uploads/internal, eksternal, sop, peraturan, iso9001 JIKA BELUM ADA ==========
const uploadDirs = [
  path.join(__dirname, 'uploads/internal'),
  path.join(__dirname, 'uploads/eksternal'),
  path.join(__dirname, 'uploads/sop'),
  path.join(__dirname, 'uploads/peraturan'),
  path.join(__dirname, 'uploads/iso9001') // ✅ folder baru untuk ISO 9001
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== STATIC FILES ==========
app.use('/uploads/internal', express.static(path.join(__dirname, 'uploads/internal')));
app.use('/uploads/eksternal', express.static(path.join(__dirname, 'uploads/eksternal')));
app.use('/uploads/sop-perusahaan', express.static(path.join(__dirname, 'uploads/sop')));
app.use('/uploads/peraturan-perusahaan', express.static(path.join(__dirname, 'uploads/peraturan')));
app.use('/uploads/iso9001', express.static(path.join(__dirname, 'uploads/iso9001'))); // ✅ static file ISO 9001

// ========== ROUTES ==========
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const userRoutes = require('./routes/user');
const dokumenInternalRoutes = require('./routes/dokumenInternal');
const dokumenEksternalRoutes = require('./routes/dokumenEksternal');
const sopPerusahaanRoutes = require('./routes/sopPerusahaan');
const peraturanPerusahaanRoutes = require('./routes/peraturanPerusahaan');
const iso9001Routes = require('./routes/iso9001'); // ✅ route ISO 9001

app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dokumen-internal', dokumenInternalRoutes);
app.use('/api/dokumen-eksternal', dokumenEksternalRoutes);
app.use('/api/sop-perusahaan', sopPerusahaanRoutes);
app.use('/api/peraturan-perusahaan', peraturanPerusahaanRoutes);
app.use('/api/iso-9001', iso9001Routes); // ✅ aktifkan API ISO 9001

// ========== ROOT ENDPOINT ==========
app.get('/', (req, res) => {
  res.send('🚀 Backend API is running...');
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
