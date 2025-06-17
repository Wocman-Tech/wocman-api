const Helpers = require("../../../../../helpers/helper");
const db = require("../../../../../models");

const Cart = db.Cart;
const Resources = db.Resources;

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
      include: [{ model: Resources, as: "resource" }],
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Step 1: Mark each resource as purchased
    const resourceIds = cartItems.map((item) => item.resourceid);

    await Resources.update(
      { status: "purchased" },
      { where: { id: resourceIds } }
    );

    // Step 2: Optionally create Order records here

    // Step 3: Clear cart
    await Cart.destroy({ where: { customerid: req.userId } });

    res.status(200).json({ message: "Checkout successful", items: cartItems });
  } catch (err) {
    res.status(500).json({ message: "Checkout error", error: err.message });
  }
};
