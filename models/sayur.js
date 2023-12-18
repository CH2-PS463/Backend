'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sayur extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Sayur.init({
    name: DataTypes.STRING,
    gambar_lokasi: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Sayur',
  });
  return Sayur;
};