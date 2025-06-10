const { QueryTypes, fn, Op } = require("sequelize");
const { Projects, sequelize } = require("../../models");

const getApprovedJobs = async (query, userId) => {
  const { limit, page } = query;

  const fetch = parseInt(limit, 10) * parseInt(page, 10) - parseInt(limit, 10);

  const countSql = `
              SELECT
              count(*) as total
              FROM projects p
              LEFT JOIN projecttypes ON projecttypes.id = p.projectid
              INNER JOIN wskills ON wskills.skillid = projecttypes.id
              WHERE
              wskills.userid = ${userId}
              AND (
                (p.status = 'approved' AND p.wocmanid IS NULL)
                OR p.status = 'in-progress'
              )

       `;

  const sql = `
           SELECT
            p.*,
            projecttypes.name AS project_subcategory
          FROM projects p
          LEFT JOIN projecttypes ON projecttypes.id = p.projectid
          INNER JOIN wskills ON wskills.skillid = projecttypes.id
          WHERE
            wskills.userid = ${userId}
            AND (
              (p.status = 'approved' AND p.wocmanid IS NULL)
              OR p.status = 'in-progress'
            )
          GROUP BY p.id
          ORDER BY p.createdAt DESC
          LIMIT ${parseInt(limit, 10)} OFFSET ${fetch}


      `;

  const [count] = await sequelize.query(countSql, {
    type: QueryTypes.SELECT,
  });

  const result = await sequelize.query(sql, {
    replacements: [parseInt(limit, 10), fetch],
    type: QueryTypes.SELECT,
  });

  const rows = result.map((el) => {
    const imagesArray = {
      images:
        el.images && el.images.length > 0 ? el.images.split("/XX98XX") : [],
    };
    return {
      ...el,
      ...imagesArray,
    };
  });

  const hasNextPage = page * limit < count.total;

  return {
    total: count.total,
    hasNextPage,
    rows,
  };
};

const acceptJob = async (params, query, userId) => {
  const { status } = query;
  const project = await Projects.findOne({
    where: {
      id: params.id,
      status: "approved",
      wocmanid: {
        [Op.is]: null,
      },
    },
  });
  if (!project) {
    const error = new Error("Sorry you can not accept this job");
    error.statusCode = 400;
    error.status = false;
    error.data = [];
    throw error;
  }
  await Projects.update(
    {
      status,
      wocmanid: userId,
      wocmanstartdatetime: fn("now"),
      updatedAt: fn("now"),
    },
    {
      where: {
        id: params.id,
      },
    }
  );
};

const completeJob = async (params, query, userId) => {
  const { status } = query;
  const project = await Projects.findOne({
    where: {
      id: params.id,
      status: "in-progress",
      wocmanid: userId,
    },
  });
  if (!project) {
    const error = new Error(
      "You cannot complete job right now, contact support"
    );
    error.statusCode = 400;
    error.status = false;
    error.data = [];
    throw error;
  }
  await Projects.update(
    {
      status,
      wocmanid: userId,
      wocmanstopdatetime: fn("now"),
      updatedAt: fn("now"),
    },
    {
      where: {
        id: params.id,
      },
    }
  );
};

const jobServices = {
  getApprovedJobs,
  acceptJob,
  completeJob,
};

module.exports = jobServices;
