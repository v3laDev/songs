const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.static('public'));

// Configuración de Multer para subir solo MP3
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const randomName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, randomName);
  }
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp3/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb('Error: Solo se permiten archivos MP3');
  }
};
const upload = multer({ storage, fileFilter });

// Endpoint para subir canción
app.post('/upload', upload.single('song'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo o el formato no es válido' });
  }
  res.status(200).json({ url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` });
});

// Endpoint para listar todas las canciones
app.get('/songs', (req, res) => {
  const directoryPath = path.join(__dirname, 'public/uploads');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer las canciones' });
    }
    const songs = files.map(file => ({
      name: file,
      url: `${req.protocol}://${req.get('host')}/uploads/${file}`
    }));
    res.status(200).json(songs);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
