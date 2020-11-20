module.exports = (sequelize, Sequelize) => {
  	const Wshear = sequelize.define("wshears", {
    	wocmanshare: {
      		type: Sequelize.STRING
    	},
    	companyshare: {
      		type: Sequelize.STRING
    	}
  	});
  	return Wshear;
};