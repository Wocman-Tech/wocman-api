module.exports = (sequelize, Sequelize) => {
    const images = sequelize.define("imagestore", {
    	image: {
      		type: Sequelize.STRING
    	},
        tracker: {
            type: Sequelize.STRING
        }
  	});
  	return images;
};