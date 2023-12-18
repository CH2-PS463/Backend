var express = require('express');
const Multer = require('multer');
var router = express.Router();

const {
  getAllSayurGambar,
  getSayurGambarById,
  getSayurGambarBySayur,
  addSayurGambar,
  deleteSayurGambar
} = require('../controllers/SayurGambar');

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.get('/', getAllSayurGambar);
router.get('/:id', getSayurGambarById);
router.get('/sayur/:id', getSayurGambarBySayur);
router.post('/', multer.single('gambar'), addSayurGambar);
router.delete('/:id', deleteSayurGambar);

module.exports = router;