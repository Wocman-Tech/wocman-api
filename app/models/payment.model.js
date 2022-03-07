const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Payment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Payment.belongsTo(models.Projects, {
                foreignKey: 'project_id',
            });

        }
    }

    Payment.init({
        reference: {
            type: DataTypes.STRING,
            allowNull: false
          },
          amount: {
            type: DataTypes.INTEGER,
          },
          project_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'projects',
              key: 'id',
            },
          },
          transaction_id: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
          },
          status: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
          },
    }, {
        sequelize,
        modelName: 'Payment',
        tableName: 'payments',
    });

    return Payment;
};