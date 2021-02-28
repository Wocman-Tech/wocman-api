module.exports = (sequelize, Sequelize) => {
    const WocmanRate = sequelize.define("wrate", {
      	userid: {
            type: Sequelize.INTEGER
        },
        jobid: {
            type: Sequelize.INTEGER
        },
        rateUser: {
            type: Sequelize.INTEGER
        }
    });
    return WocmanRate;
};

/*  jobid : gotten projects table
    rateUser : values from 1 to 5
*/