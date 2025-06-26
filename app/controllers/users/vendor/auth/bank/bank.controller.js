const db = require("../../../../../models");
const Helpers = require("../../../../../helpers/helper");

const User = db.User;

exports.getBankDetails = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: ["bankName", "accountNumber", "accountName"],
    });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Bank details retrieved",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching bank details:", error);
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal server error",
    });
  }
};

exports.updateBankDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { bankName, accountNumber, accountName } = req.body;

    // Basic validation
    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message:
          "All fields (bankName, accountNumber, accountName) are required",
      });
    }

    // ✅ Ensure account number is eaxtly 10 digits
    if (!/^\d{10}$/.test(accountNumber)) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: "Account number must be exactly 10 digits",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "User not found",
      });
    }

    user.bankName = bankName;
    user.accountNumber = accountNumber;
    user.accountName = accountName;
    await user.save();

    // 🔔 Send email/notice to user
    const pushBody = `
      Dear ${user.username},<br />
      Your bank details were successfully updated.<br />
      If this wasn't you, please report to the admin immediately.<br/>
      <br/>Thanks.
    `;
    await Helpers.pushNotice(user.id, pushBody, "service");

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Bank details updated successfully",
      data: {
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        accountName: user.accountName,
      },
    });
  } catch (error) {
    console.error("Error updating bank details:", error);
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal server error",
    });
  }
};
