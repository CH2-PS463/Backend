var express = require('express');
const Multer = require('multer');
var router = express.Router();

const {
  getAllSayur,
  getSayurById,
  getSayurByIdV2,
  addSayur,
  updateSayur,
  deleteSayur
} = require('../controllers/Sayur');

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.get('/', getAllSayur);
router.get('/:id', getSayurById);
router.get('/v2/:id', getSayurByIdV2);
router.post('/', multer.single('gambar_lokasi'), addSayur);
router.put('/:id', multer.single('gambar_lokasi'), updateSayur);
router.delete('/:id', deleteSayur);

module.exports = router;