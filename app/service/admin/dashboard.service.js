const { QueryTypes, fn } = require("sequelize");
const {
  User,
  Projecttype,
  Projects,
  Payment,
  sequelize,
} = require("../../models");

const getProjectStatusCount = async () => {
  const sql = `
        SELECT
        count(*) as total,
            count(case when status = 'pending' then status end) as pending_job,
            count(case when status = 'approved' then status end) as approved_job,
            count(case when status = 'in-progress' then status end) as progess_job,
            count(case when status = 'completed' then status end) as completed_job,
            count(case when createdAt BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 WEEK) AND CURDATE() then createdAt end) as recent_job
        FROM projects     
    `;
  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
  });
};

const getProjects = async (query) => {
  const fetch =
    parseInt(query.limit, 10) * parseInt(query.page, 10) -
    parseInt(query.limit, 10);
  const { limit, page, status, ...restFilters } = query;

  let where = { ...restFilters };

  if (!status || status === "all") {
    // No filtering (include all statuses)
  } else {
    const statusArray = status.split(",");
    where.status = { [Op.in]: statusArray };
  }

  // If status is 'all', don't include it in the filter
  // This means all statuses will be included
  // If you want to filter by specific multiple statuses, you could use:
  // where.status = { [Op.in]: ['approved', 'in-progress', 'completed'] }

  const projects = await Projects.findAndCountAll({
    where,
    include: [
      {
        model: Projecttype,
        as: "project_subcategory",
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
      {
        model: User,
        as: "customer",
        attributes: ["id", "firstname", "lastname", "email", "username"],
      },
      {
        model: User,
        as: "wocman",
        attributes: ["id", "firstname", "lastname", "email", "username"],
      },
    ],
    order: [["createdAt", "DESC"]],
    offset: fetch,
    limit: Number(limit),
  });

  const result = JSON.parse(JSON.stringify(projects));

  const rows = result.rows.map((el) => {
    const imagesArray = {
      images: el.images.length === 0 ? [] : el.images.split("/XX98XX"),
    };
    return {
      ...el,
      ...imagesArray,
    };
  });

  const hasNextPage = page * limit < result.count;
  return {
    total: result.count,
    hasNextPage,
    rows,
  };
};

const getSingleProject = async (params) => {
  const projects = await Projects.findOne({
    where: {
      id: params.id,
    },
    include: [
      {
        model: Projecttype,
        as: "project_subcategory",
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
      {
        model: User,
        as: "customer",
        attributes: ["id", "firstname", "lastname", "email", "username"],
      },
      {
        model: User,
        as: "wocman",
        attributes: ["id", "firstname", "lastname", "email", "username"],
      },
    ],
  });

  const result = JSON.parse(JSON.stringify(projects));

  const imagesArray = {
    images: result.images.length === 0 ? [] : result.images.split("/XX98XX"),
  };
  return {
    ...result,
    ...imagesArray,
  };
};

const approveJob = async (params, query) => {
  const { status } = query;
  const payment = await Payment.findOne({
    where: {
      project_id: params.id,
      status: "success",
    },
  });
  if (!payment) {
    throw {
      statusCode: 400,
      status: false,
      message: "Project has not been paid for",
      data: [],
    };
  }
  await Projects.update(
    {
      status,
      updatedAt: fn("now"),
    },
    {
      where: {
        id: params.id,
      },
    }
  );
};

const addPayment = async (body) => {
  const { reference, transaction_id, status, amount, project_id } = body;
  const project = await Projects.findByPk(project_id);
  if (!project) {
    const error = new Error("Project was not found");
    error.statusCode = 400;
    error.status = false;
    error.data = [];
    throw error;
  }
  await Payment.create({
    reference,
    transaction_id,
    status,
    amount,
    project_id,
  });
};

const addProjectAmount = async (params, body) => {
  const { amount } = body;

  await Projects.update(
    {
      quoteamount: amount,
      updatedAt: fn("now"),
    },
    {
      where: {
        id: params.id,
      },
    }
  );
};

const dashboardServices = {
  getProjects,
  approveJob,
  getProjectStatusCount,
  getSingleProject,
  addPayment,
  addProjectAmount,
};

module.exports = dashboardServices;
