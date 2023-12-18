'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sayur_gambar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Sayur_gambar.init({
    idSayur: {
      type: DataTypes.INTEGER,
      references: {
        model: 'sayur',
        key: 'id'
      },
    },
    gambar: DataTypes.STRING,allowNull: false,
  }, {
    sequelize,
    modelName: 'Sayur_gambar',
  });
  return Sayur_gambar;
};