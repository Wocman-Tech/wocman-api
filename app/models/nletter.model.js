module.exports = (sequelize, Sequelize) => {
    const Nletters = sequelize.define("nletters", {
    	email: {
      		type: Sequelize.STRING
    	},
        name: {
            type: Sequelize.STRING
        }
  	});
  	return Nletters;
};