const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class UserRole extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
			models.User.belongsToMany(models.Role, {
				through: UserRole,
				foreignKey: 'userid',
				as: 'role',
			});
		
			models.Role.belongsToMany(models.User, {
				through: UserRole,
				foreignKey: 'roleid',
				as: 'user',
			});
        }
    }

    UserRole.init({
        userid: {
			type: DataTypes.INTEGER
		},
		roleid: {
			type: DataTypes.INTEGER
		}
    }, {
        sequelize,
        modelName: 'UserRole',
        tableName: 'userroles',
    });

	return UserRole;
};