module.exports = (sequelize, Sequelize) => {
  	const Mtoken = sequelize.define("mtokens", {
    	token: {
      		type: Sequelize.STRING,
    	}
  	});
  	return Mtoken;
};