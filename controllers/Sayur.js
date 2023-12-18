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

const getAllSayur = async (req, res) => {
  const sayur = await Sayur.findAll({
    include: Sayur_gambar
  });
  res.json(sayur);
}

const getSayurById = async (req, res) => {
  const id = req.params.id;

  const sayur = await Sayur.findOne({
    where: {
      id: id
    },
    include: Sayur_gambar
  });

  if (!sayur) {
    return res
      .status(404)
      .json({
        status: 'fail',
        message: 'Data sayur tidak ditemukan'
      });
  }

  res.json(sayur);
}

const getSayurByIdV2 = async (req, res) => {
  const id = req.params.id;

  const sayur = await sayur.findByPk(id);

  if (!sayur) {
    return res
      .status(404)
      .json({
        status: 'fail',
        message: 'Data sayur tidak ditemukan'
      });
  }

  const gambar = await Sayur_gambar.findOne({
    where: {
      SayurId: id
    }
  })

  const sayurReturn = JSON.parse(JSON.stringify(sayur));

  if (gambar) {
    sayurReturn.gambar = gambar.gambar;
  } else {
    sayurReturn.gambar = null;
  }

  res.json(sayurReturn);
}

const addSayur = async (req, res) => {
  const schema = {
    nama: 'string',
    // nama_saintifik: 'string|optional',
    // lokasi: 'string|optional',
    // populasi: 'string|optional',
    // funfact: 'string|optional',
  }

  const sayur_detail = JSON.parse(req.body.data);

  const validate = v.validate(sayur_detail, schema);

  if (validate.length) {
    return res
      .status(400)
      .json(validate);
  }

  const {
    nama
  } = sayur_detail;

  if (nama === "") {
    return res
      .status(400)
      .json({
        status: 'fail',
        message: 'Mohon mengisi semua kolom yang diperlukan'
      });
  }

  if (req.file) {
    const ext_gambar_lokasi = path.extname(req.file.originalname).toLowerCase();

    if (ext_gambar_lokasi !== '.png' && ext_gambar_lokasi !== '.jpg' && ext_gambar_lokasi !== '.jpeg') {
      return res
        .status(400)
        .json({
          status: 'fail',
          message: 'Hanya dapat menggunakan file gambar (.png, .jpg atau .jpeg)'
        });
    }

    const newFilename_gambar_lokasi = `${uuidv1()}-${req.file.originalname}`;
    const blob_gambar_lokasi = bucket.file(newFilename_gambar_lokasi);
    const blobStream_gambar_lokasi = blob_gambar_lokasi.createWriteStream();

    blobStream_gambar_lokasi.on('error', (error) => {
      console.log(error);
    });

    blobStream_gambar_lokasi.on('finish', async () => {
      console.log('success');
    });

    blobStream_gambar_lokasi.end(req.file.buffer);

    sayur_detail.gambar_lokasi = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${blob_gambar_lokasi.name}`;
  }

  const sayur = await Sayur.create(sayur_detail);

  res.json(sayur);
}

const updateSayur = async (req, res) => {
  const id = req.params.id;

  let sayur = await Sayur.findByPk(id);

  if (!sayur) {
    return res
      .status(404)
      .json({
        status: 'fail',
        message: 'Data sayur tidak ditemukan'
      });
  }

  const sayur_detail = JSON.parse(req.body.data);

  const schema = {
    name: 'string|optional',
  }

  const validate = v.validate(sayur_detail, schema);

  if (validate.length) {
    return res
      .status(400)
      .json(validate);
  }

  const {
    nama
  } = req.body;

  if (nama === "") {
    return res
      .status(400)
      .json({
        status: 'fail',
        message: 'Mohon mengisi semua kolom yang diperlukan'
      });
  }

  if (req.file) {
    const ext_gambar_lokasi = path.extname(req.file.originalname).toLowerCase();

    if (ext_gambar_lokasi !== '.png' && ext_gambar_lokasi !== '.jpg' && ext_gambar_lokasi !== '.jpeg') {
      return res
        .status(400)
        .json({
          status: 'fail',
          message: 'Hanya dapat menggunakan file gambar (.png, .jpg atau .jpeg)'
        });
    }

    const newFilename_gambar_lokasi = `${uuidv1()}-${req.file.originalname}`;
    const blob_gambar_lokasi = bucket.file(newFilename_gambar_lokasi);
    const blobStream_gambar_lokasi = blob_gambar_lokasi.createWriteStream();

    blobStream_gambar_lokasi.on('error', (error) => {
      console.log(error);
    });

    blobStream_gambar_lokasi.on('finish', async () => {
      console.log('success');
    });

    blobStream_gambar_lokasi.end(req.file.buffer);

    if (sayur.gambar_lokasi) {
      const gambar_lokasi_old = sayur.gambar_lokasi.replaceAll(`https://storage.googleapis.com/${process.env.GCS_BUCKET}/`, '');

      try {
        await bucket.file(gambar_lokasi_old).delete();
      } catch (error) {
        console.log(error);
      }
    }

    sayur_detail.gambar_lokasi = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${blob_gambar_lokasi.name}`;
  } else {
    sayur_detail.gambar_lokasi = sayur.gambar_lokasi;
  }

  sayur = await sayur.update(sayur_detail);

  res.json(sayur);
}

const deleteSayur = async (req, res) => {
  const id = req.params.id;

  const sayur = await Sayur.findOne({
    where: {
      id: id
    },
    include: Sayur_gambar
  });

  if (!sayur) {
    return res
      .status(404)
      .json({
        status: 'fail',
        message: 'Data sayur tidak ditemukan'
      });
  }

//   await Satwa_donasi.destroy({
//     where: {
//       SatwaId: satwa.id
//     }
//   });

  if (sayur.gambar_lokasi) {
    const gambar_lokasi_old = sayur.gambar_lokasi.replaceAll(`https://storage.googleapis.com/${process.env.GCS_BUCKET}/`, '');

    try {
      await bucket.file(gambar_lokasi_old).delete();
    } catch (error) {
      console.log(error);
    }
  }

  if (sayur.Sayur_gambars.length !== 0) {
    const sayur_gambars = sayur.Sayur_gambars;

    for (let sayur_gambar of sayur_gambars) {
      const gambar_old = sayur_gambar.gambar.replaceAll(`https://storage.googleapis.com/${process.env.GCS_BUCKET}/`, '');

      try {
        await Sayur_gambar.destroy({
          where: {
            id: sayur_gambar.id
          }
        });

        await bucket.file(gambar_old).delete();
      } catch (error) {
        console.log(error);
      }
    }
  }

  await sayur.destroy();

  res
    .status(200)
    .json({
      status: 'success',
      message: 'Data sayur telah terhapus'
    });
}

module.exports = {
  getAllSayur,
  getSayurById,
  getSayurByIdV2,
  addSayur,
  updateSayur,
  deleteSayur
};