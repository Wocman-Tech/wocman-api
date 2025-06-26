const Joi = require("joi");
const db = require("../../../../../models");
const Helpers = require("../../../../../helpers/helper");

const Resources = db.Resources;
const Order = db.Order;
const User = db.User;

exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.userId;

    const orders = await Order.findAll({
      include: [
        {
          model: Resources,
          as: "resource",
          where: { vendorid: vendorId },
        },
        {
          model: User,
          as: "customer",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Vendor orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal server error",
    });
  }
};

exports.markOrderAsDelivered = async (req, res) => {
  try {
    const vendorId = req.userId;
    const { orderId } = req.params;

    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: Resources,
          as: "resource",
          where: { vendorid: vendorId },
        },
        {
          model: User,
          as: "customer",
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Order not found or unauthorized",
      });
    }

    order.status = "successful";
    await order.save();

    // Send notice to customer
    const customer = order.customer;

    const pushBody = `
      Dear ${customer.username},<br />
      Your order has been marked as <strong>delivered</strong> by the vendor.<br />
      Please log in to your account to confirm the delivery.<br/>
      If you did not receive the order, kindly contact support immediately.<br/>
      <br/>
      Thank you for using our platform.
    `;

    await Helpers.pushNotice(customer.id, pushBody, "service");

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Order marked as delivered and notice sent to customer",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal server error",
    });
  }
};

exports.confirmOrderDelivery = async (req, res) => {
  try {
    const customerId = req.userId;
    const { id: orderId } = req.params;

    const order = await Order.findOne({
      where: {
        id: orderId,
        customerid: customerId,
        status: "successful",
      },
    });

    if (!order) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Order not found or not eligible for confirmation",
      });
    }

    if (order.confirmed) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: "Order already confirmed",
      });
    }

    order.confirmed = true;
    await order.save();

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Order confirmed as delivered",
      data: order,
    });
  } catch (error) {
    console.error("Error confirming order delivery:", error);
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal server error",
    });
  }
};

exports.getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.userId;

    const orders = await Order.findAll({
      where: { customerid: customerId },
      include: [
        {
          model: Resources,
          as: "resource",
          include: [
            {
              model: User,
              as: "vendor",
              attributes: ["id", "username", "email", "phone"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal server error",
    });
  }
};
