const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Projecttype extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Projecttype.belongsTo(models.Category, {
        foreignKey: "category_id",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });

      Projecttype.hasMany(models.Projects, {
        foreignKey: "projectid",
        as: "projects",
      });
    }
  }

  Projecttype.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "categories",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Projecttype",
      tableName: "projecttypes",
    }
  );

  return Projecttype;
};
