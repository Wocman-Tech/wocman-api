const Helpers = require("../../../../../helpers/helper");
const db = require("../../../../../models");

const Cart = db.Cart;
const Resources = db.Resources;
const User = db.User;
const Order = db.Order;

exports.addToCart = async (req, res) => {
  const { resourceid } = req.body;

  const customerId = req.userId;

  try {
    const resource = await Resources.findByPk(resourceid);
    if (!resource || resource.status !== "available") {
      return res.status(400).json({ message: "Resource is not available" });
    }

    const existing = await Cart.findOne({
      where: { customerid: customerId, resourceid },
    });
    if (existing) {
      return res.status(409).json({ message: "Item already in cart" });
    }

    await Cart.create({
      customerid: customerId,
      resourceid,
      quantity: 1,
      amount: resource.amount,
      total: resource.amount, // initial total = 1 * amount
    });

    await resource.update({ status: "in-cart", customerid: customerId });

    res.status(200).json({ message: "Added to cart" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  const { resourceid } = req.body;

  try {
    const cartEntry = await Cart.findOne({ where: { resourceid } });
    if (!cartEntry) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    await Cart.destroy({ where: { resourceid } });

    // Update resource status
    await Resources.update(
      { status: "available", customerid: null },
      { where: { id: resourceid } }
    );

    res.status(200).json({ message: "Removed from cart" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.viewCart = async (req, res) => {
  try {
    const items = await Cart.findAll({
      where: { customerid: req.userId },
      include: [
        {
          model: Resources,
          as: "resource",
        },
      ],
    });

    res.status(200).json({ cart: items });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.incrementCartItem = async (req, res) => {
  const { resourceid } = req.body;

  try {
    const cartItem = await Cart.findOne({
      where: { customerid: req.userId, resourceid },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cartItem.quantity += 1;
    cartItem.total = (parseFloat(cartItem.amount) * cartItem.quantity).toFixed(
      2
    );
    await cartItem.save();

    return res.status(200).json({
      message: "Quantity increased",
      cartItem,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to increment quantity", error: error.message });
  }
};

exports.decrementCartItem = async (req, res) => {
  const { resourceid } = req.body;

  try {
    const cartItem = await Cart.findOne({
      where: { customerid: req.userId, resourceid },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      cartItem.total = (
        parseFloat(cartItem.amount) * cartItem.quantity
      ).toFixed(2);
      await cartItem.save();

      return res.status(200).json({
        message: "Quantity decreased",
        cartItem,
      });
    } else {
      // Quantity is 1, remove item and update resource
      await cartItem.destroy();

      await Resources.update(
        { status: "available", customerid: null },
        { where: { id: resourceid } }
      );

      return res.status(200).json({ message: "Item removed from cart" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to decrement quantity", error: error.message });
  }
};

exports.getCartTotal = async (req, res) => {
  try {
    // Step 1: Fetch all items in customer's cart
    const cartItems = await Cart.findAll({
      where: { customerid: req.userId },
      include: [
        {
          model: Resources,
          as: "resource", // Assuming you set the alias
        },
      ],
    });

    // Step 2: Calculate grand total
    const grandTotal = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.total);
    }, 0);

    res.status(200).json({
      cart: cartItems,
      grandTotal: grandTotal.toFixed(2), // Format as currency
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch cart total", error: err.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { customerid: req.userId },
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
        {
          model: User,
          as: "customer",
          attributes: ["id", "username", "email", "phone"],
        },
      ],
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const resourceIds = cartItems.map((item) => item.resourceid);

    // Step 1: Reset resource status as available
    await Resources.update(
      { status: "available" },
      { where: { id: resourceIds } }
    );

    // Step 2: Create Order records
    for (const item of cartItems) {
      await Order.create({
        customerid: item.customerid,
        resourceid: item.resourceid,
        amount: item.resource.amount,
        status: "pending",
      });
    }

    // Step 3: Clear cart
    await Cart.destroy({ where: { customerid: req.userId } });

    // Step 4: Notify customer with vendor's number
    const customer = cartItems[0].customer;
    const vendorPhone = cartItems[0]?.resource?.vendor?.phone;

    if (customer && vendorPhone) {
      const customerBody = `
        Dear ${customer.username},<br />
        Your checkout was successful.<br />
        Thank you for your purchase!<br />
        You can reach the vendor at: <strong>0${vendorPhone}</strong>
      `;
      Helpers.pushNotice(customer.id, customerBody, "service");
    }

    // Step 5: Notify vendors with customer's number
    const notifiedVendors = new Set();
    cartItems.forEach((item) => {
      const vendor = item.resource?.vendor;
      const customerPhone = item.customer?.phone;

      if (vendor && customerPhone && !notifiedVendors.has(vendor.id)) {
        const vendorBody = `
          Dear ${vendor.username},<br />
          Your item has been purchased.<br />
          Please prepare for delivery.<br />
          You can reach the customer at: <strong>0${customerPhone}</strong>
        `;
        Helpers.pushNotice(vendor.id, vendorBody, "service");
        notifiedVendors.add(vendor.id);
      }
    });

    res.status(200).json({ message: "Checkout successful", items: cartItems });
  } catch (err) {
    res.status(500).json({ message: "Checkout error", error: err.message });
  }
};
