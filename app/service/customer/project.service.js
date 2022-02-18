const Helpers = require("../../helpers/helper");
const { s3Upload } = require("../../helpers/s3.upload.helper");
const { Projects } = require('../../models');

exports.createProject = async (body, userId, files) => {
    const { description, topic, address, city, projecttypeid } = body;
    let images = '';
    const data = files.map(async(item, index, array) => {
        const image = await s3Upload(item);
        if (index === 0) {
            images += image.Location
        }
        else if(index !== array.length - 1) {
            images += image.Location + Helpers.padTogether()
        } else {
            images += image.Location + Helpers.padTogether()
        }
    });
    await Promise.all(data);
    return Projects.create({
        project: topic,
        description: description,
        address: address,
        city: city,
        projectid: projecttypeid,
        customerid: userId,
        images
    });
};
