module.exports = (sequelize, Sequelize) => {
  const userRole = sequelize.define("userrole", {
    	userid: {
      		type: Sequelize.INTEGER
    	},
    	roleid: {
      		type: Sequelize.INTEGER
    	}
  	});
  	return userRole;
};