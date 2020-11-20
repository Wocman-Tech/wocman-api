module.exports = (sequelize, Sequelize) => {
    const Nletters = sequelize.define("nletters", {
    	email: {
      		type: Sequelize.STRING
    	}
  	});
  	return Nletters;
};