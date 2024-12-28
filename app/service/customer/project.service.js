const Helpers = require("../../helpers/helper");
const { s3Upload } = require("../../helpers/s3.upload.helper");
const { Projects } = require('../../models');

exports.createProject = async (body, userId, files) => {
    const { description, topic, address, city, projecttypeid, startDate } = body;
    let images = '';

    // Check if 'files' is defined and is an array
    if (!Array.isArray(files) || files.length === 0) {
        throw new Error('No files were provided or files is not an array.');
    }

    // Map through the files and upload them to S3
    const data = files.map(async (item, index, array) => {
        const image = await s3Upload(item);
        if (index === 0) {
            images += image.Location;
        } else if (index !== array.length - 1) {
            images += image.Location + Helpers.padTogether();
        } else {
            images += image.Location + Helpers.padTogether();
        }
    });

    // Wait for all file uploads to complete
    await Promise.all(data);

    // Create the project in the database
    return Projects.create({
        project: topic,
        description: description,
        address: address,
        city: city,
        projectid: projecttypeid,
        customerid: userId,
        images,
        startDate,
    });
};

