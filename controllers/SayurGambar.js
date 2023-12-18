const Validator = require('fastest-validator');
const { Storage } = require('@google-cloud/storage');
var path = require('path');
const uuid = require('uuid');

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT,
  credentials: {
    client_email: process.env.GCLOUD_CLIENT_EMAIL,
    private_key: process.env.GCLOUD_PRIVATE_KEY
  }
});

const bucket = storage.bucket(process.env.GCS_BUCKET);

const uuidv1 = uuid.v1;

const { Sayur, Sayur_gambar } = require('../models');

const v = new Validator();

const getAllSayurGambar = async (req, res) => {
  const sayur_gambar = await Sayur_gambar.findAll({
    include: [{
      model: Sayur
    }]
  });
  res.json(sayur_gambar);
}

const getSayurGambarById = async (req, res) => {
  const id = req.params.id;

  const sayur_gambar = await Sayur_gambar.findOne({
    where: {
      id: id
    },
    include: [{
      model: Sayur
    }]
  });

  if (!sayur_gambar) {
    return res
      .status(404)
      .json({
        status: 'fail',
        message: 'Data gambar sayur tidak ditemukan'
      });
  }

  res.json(sayur_gambar);
}

const getSayurGambarBySayur = async (req, res) => {
  const id = req.params.id;

  const sayur = await Sayur.findByPk(id);

  if (!sayur) {
    return res
      .status(404)
      .json({
        status: 'fail',
        message: 'Data sayur tidak ditemukan'
      });
  }

  const sayur_gambar = await Sayur_gambar.findAll({
    where: {
      SayurId: id
    },
    include: [{
      model: Sayur
    }]
  });

  res.json(sayur_gambar);
}

const addSayurGambar = async (req, res) => {
  const schema = {
    SayurId: 'number|integer|optional'
  }

  const sayur_gambar_detail = JSON.parse(req.body.data);

  const validate = v.validate(sayur_gambar_detail, schema);

  if (validate.length) {
    return res
      .status(400)
      .json(validate);
  }

  const {
    SayurId
  } = sayur_gambar_detail;

  if (SayurId === "") {
    return res
      .status(400)
      .json({
        status: 'fail',
        message: 'Mohon mengisi semua kolom yang diperlukan'
      });
  }

  const sayur = await Sayur.findByPk(SayurId);

  if (!sayur) {
    return res
      .status(404)
      .json({
        status: 'fail',
        message: 'Data sayur tidak ditemukan'
      });
  }

  if (req.file) {
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return res
        .status(404)
        .json({
          status: 'fail',
          message: 'Hanya dapat menggunakan file gambar (.png, .jpg atau .jpeg)'
        });
    }

    const newFilename = `${uuidv1()}-${req.file.originalname}`;
    const blob = bucket.file(newFilename);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (error) => {
      console.log(error);
    });

    blobStream.on('finish', async () => {
      console.log('success');
    });

    blobStream.end(req.file.buffer);

    sayur_gambar_detail.gambar = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${blob.name}`;
    const sayur_gambar = await Sayur_gambar.create(sayur_gambar_detail);

    res.json(sayur_gambar);
  } else {
    return res
      .status(400)
      .json({
        status: 'fail',
        message: 'Mohon mengisi semua kolom yang diperlukan'
      });
  }
}

const deleteSayurGambar = async (req, res) => {
  const id = req.params.id;

  const sayur_gambar = await Sayur_gambar.findByPk(id);

  if (!sayur_gambar) {
    return res
      .status(404)
      .json({
        status: 'fail',
        message: 'Data gambar sayur tidak ditemukan'
      });
  }

  if (sayur_gambar.gambar) {
    const gambar_old = sayur_gambar.gambar.replaceAll(`https://storage.googleapis.com/${process.env.GCS_BUCKET}/`, '');

    try {
      await bucket.file(gambar_old).delete();
    } catch (error) {
      console.log(error);
    }
  }

  await sayur_gambar.destroy();

  res
    .status(200)
    .json({
      status: 'success',
      message: 'Data gambar sayur telah terhapus'
    });
}

module.exports = {
  getAllSayurGambar,
  getSayurGambarById,
  getSayurGambarBySayur,
  addSayurGambar,
  deleteSayurGambar
};