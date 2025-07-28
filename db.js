const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'phpmyadmin',
  database: 'booking_class',
  port: 3306   // ? Ini port lama
});
db.connect((err) => {
  if (err) throw err;
  console.log('? Database connected (port 3306)');
});

module.exports = db;