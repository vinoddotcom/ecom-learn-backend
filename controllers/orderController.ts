import { Request, Response, NextFunction } from "express";
import Order from "../models/orderModel";
import Product from "../models/productModel";
import ErrorHandler from "../utils/errorhandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";

// Create new Order
export const newOrder = catchAsyncErrors(async (req: Request, res: Response) => {
  const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } =
    req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user!._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// get Single Order
export const getSingleOrder = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }

    res.status(200).json({
      success: true,
      order,
    });
  }
);

// get logged in user Orders
export const myOrders = catchAsyncErrors(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// get all Orders -- Admin
export const getAllOrders = catchAsyncErrors(async (_req: Request, res: Response) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach(order => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update Order Status -- Admin
export const updateOrder = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }

    if (order.orderStatus === "Delivered") {
      return next(new ErrorHandler("You have already delivered this order", 400));
    }

    if (req.body.status === "Shipped") {
      // Update the stock for each item in the order
      for (const item of order.orderItems) {
        await updateStock(item.product.toString(), item.quantity);
      }
    }

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = new Date();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  }
);

// Helper function to update product stock
async function updateStock(id: string, quantity: number) {
  const product = await Product.findById(id);

  if (!product) {
    throw new Error(`Product with id ${id} not found`);
  }

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// delete Order -- Admin
export const deleteOrder = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: "Order Deleted Successfully",
    });
  }
);
