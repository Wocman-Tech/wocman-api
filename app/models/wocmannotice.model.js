const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class WocmanNotice extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    WocmanNotice.init({
        userid: {
            type: DataTypes.INTEGER
        },
        notice: {
            type: DataTypes.STRING
        },
        type: {
            type: DataTypes.STRING
        },
        link: {
            type: DataTypes.STRING
        },
        date: {
            type: DataTypes.STRING
        },
        seen: {
            type: DataTypes.INTEGER
        }
    }, {
        sequelize,
        modelName: 'WocmanNotice',
        tableName: 'wnotices',
    });

    return WocmanNotice;
};

/*  
    type: this helps us to know which action to place on the notice.
    link: this is the id of the project or certificate or customer or anything that is being informed of
    eg: type = chooseproject(message to take a project) then action button(s) is(are) accept and decline
    eg: type = chat(chat from someone) then action button is start chat
    eg: type = uploadcertificate(admin message) then action button is upload certificate
    eg: type = warning(admin message) then action button is view profile
    eg: type = reminder(admin message) then action button is view profile
    eg: type = walletincrement(admin message) then action button is view wallet
    eg: type = walletdecrease(admin message) then action button is view wallet
    every time action is taken on wocman account
    insert a notice here
*/