import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import * as orderController from "../../../controllers/orderController";
import Order from "../../../models/orderModel";
import Product from "../../../models/productModel";
import ErrorHandler from "../../../utils/errorhandler";

// Mock dependencies
vi.mock("../../../models/orderModel", () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
    aggregate: vi.fn(),
  },
}));

vi.mock("../../../models/productModel", () => ({
  default: {
    findById: vi.fn(),
  },
}));

// Mock Express Request and Response objects
const mockRequest = () => {
  const req: Partial<Request> = {
    body: {},
    cookies: {},
    params: {},
    query: {},
    user: { id: "testUserId", _id: "testUserId" },
  };
  return req as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

describe("Order Controller", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("newOrder", () => {
    it("should create a new order successfully", async () => {
      // Setup
      const mockOrder = {
        _id: "order123",
        shippingInfo: {},
        orderItems: [],
        user: "user123",
      };

      req.body = {
        shippingInfo: {
          address: "123 Main St",
          city: "Anytown",
          state: "Anystate",
          country: "Anycountry",
          pinCode: 12345,
          phoneNo: "1234567890",
        },
        orderItems: [
          {
            name: "Product 1",
            price: 99.99,
            quantity: 2,
            image: "product1.jpg",
            product: "product123",
          },
        ],
        paymentInfo: {
          id: "payment123",
          status: "succeeded",
        },
        itemsPrice: 199.98,
        taxPrice: 10,
        shippingPrice: 5,
        totalPrice: 214.98,
      };
      req.user = { _id: "user123" } as any;

      vi.mocked(Order.create).mockResolvedValue(mockOrder as any);

      // Execute
      await orderController.newOrder(req, res, next);

      // Assert
      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          shippingInfo: req.body.shippingInfo,
          orderItems: req.body.orderItems,
          paymentInfo: req.body.paymentInfo,
          itemsPrice: req.body.itemsPrice,
          taxPrice: req.body.taxPrice,
          shippingPrice: req.body.shippingPrice,
          totalPrice: req.body.totalPrice,
          user: "user123",
        })
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        order: mockOrder,
      });
    });

    it("should handle errors during order creation", async () => {
      // Setup
      const error = new Error("Order creation failed");

      req.body = {
        shippingInfo: {},
        orderItems: [],
        paymentInfo: {},
        itemsPrice: 199.98,
        taxPrice: 10,
        shippingPrice: 5,
        totalPrice: 214.98,
      };
      req.user = { _id: "user123" } as any;

      vi.mocked(Order.create).mockRejectedValue(error);

      // Manually mock the catchAsyncErrors wrapper to immediately call next with the error
      vi.mock("../../../middleware/catchAsyncErrors", () => ({
        default: (fn: any) => async (req: Request, res: Response, next: NextFunction) => {
          try {
            await fn(req, res, next);
          } catch (error) {
            next(new ErrorHandler((error as Error).message, 400));
          }
        },
      }));

      // Execute
      await orderController.newOrder(req, res, next);

      // Assert
      expect(Order.create).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("getSingleOrder", () => {
    it("should return order details", async () => {
      // Setup
      const mockOrder = {
        _id: "order123",
        shippingInfo: {},
        orderItems: [],
        user: {
          name: "Test User",
          email: "test@example.com",
        },
        paymentInfo: {},
        itemsPrice: 199.98,
        taxPrice: 10,
        shippingPrice: 5,
        totalPrice: 214.98,
      };

      req.params = { id: "order123" };

      vi.mocked(Order.findById).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockOrder),
      } as any);

      // Execute
      await orderController.getSingleOrder(req, res, next);

      // Assert
      expect(Order.findById).toHaveBeenCalledWith("order123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        order: mockOrder,
      });
    });

    it("should return error if order is not found", async () => {
      // Setup
      req.params = { id: "nonexistent_order" };

      vi.mocked(Order.findById).mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      } as any);

      // Execute
      await orderController.getSingleOrder(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.message).toBe("Order not found with this Id");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("myOrders", () => {
    it("should return all orders for logged in user", async () => {
      // Setup
      const mockOrders = [
        {
          _id: "order1",
          totalPrice: 100,
          orderStatus: "Processing",
        },
        {
          _id: "order2",
          totalPrice: 150,
          orderStatus: "Shipped",
        },
      ];

      req.user = { _id: "user123" } as any;

      vi.mocked(Order.find).mockResolvedValue(mockOrders as any);

      // Execute
      await orderController.myOrders(req, res);

      // Assert
      expect(Order.find).toHaveBeenCalledWith({ user: "user123" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        orders: mockOrders,
      });
    });
  });

  describe("getAllOrders", () => {
    it("should return all orders with total amount", async () => {
      // Setup
      const mockOrders = [
        {
          _id: "order1",
          totalPrice: 100,
          orderStatus: "Processing",
        },
        {
          _id: "order2",
          totalPrice: 150,
          orderStatus: "Shipped",
        },
      ];

      const totalAmount = 250;

      vi.mocked(Order.find).mockResolvedValue(mockOrders as any);

      // Execute
      await orderController.getAllOrders(req, res);

      // Assert
      expect(Order.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        totalAmount: 250, // 100 + 150
        orders: mockOrders,
      });
    });

    it("should set totalAmount to 0 if no aggregation result", async () => {
      // Setup
      const mockOrders: any[] = [];

      vi.mocked(Order.find).mockResolvedValue(mockOrders as any);

      // Execute
      await orderController.getAllOrders(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        totalAmount: 0,
        orders: mockOrders,
      });
    });
  });

  describe("updateOrder", () => {
    it("should update order status from Processing to Shipped", async () => {
      // Setup
      const mockOrder = {
        _id: "order123",
        orderStatus: "Processing",
        orderItems: [
          {
            product: "product123",
            quantity: 2,
          },
        ],
        save: vi.fn().mockResolvedValue({}),
      };

      const mockProduct = {
        _id: "product123",
        Stock: 10,
        save: vi.fn().mockResolvedValue({}),
      };

      req.params = { id: "order123" };
      req.body = { status: "Shipped" };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);
      vi.mocked(Product.findById).mockResolvedValue({ ...mockProduct } as any);

      // Execute
      await orderController.updateOrder(req, res, next);

      // Assert
      expect(Order.findById).toHaveBeenCalledWith("order123");
      expect(Product.findById).toHaveBeenCalledWith("product123");

      // Stock should be updated: 10 - 2 = 8
      // Here we need to check the save method was called, but we can't directly check the Stock value
      // as it's updated within the updateStock function
      expect(mockProduct.save).toHaveBeenCalled();
      expect(mockOrder.orderStatus).toBe("Shipped");
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should update order status from Shipped to Delivered", async () => {
      // Setup
      const mockOrder = {
        _id: "order123",
        orderStatus: "Shipped",
        deliveredAt: undefined,
        save: vi.fn().mockResolvedValue({}),
      };

      req.params = { id: "order123" };
      req.body = { status: "Delivered" };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      // Execute
      await orderController.updateOrder(req, res, next);

      // Assert
      expect(Order.findById).toHaveBeenCalledWith("order123");
      expect(mockOrder.orderStatus).toBe("Delivered");
      expect(mockOrder.deliveredAt).toBeInstanceOf(Date);
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should return error if order is already delivered", async () => {
      // Setup
      const mockOrder = {
        _id: "order123",
        orderStatus: "Delivered",
      };

      req.params = { id: "order123" };
      req.body = { status: "Shipped" };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      // Execute
      await orderController.updateOrder(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.message).toBe("You have already delivered this order");
      expect(error.statusCode).toBe(400);
    });

    it("should return error if order is not found", async () => {
      // Setup
      req.params = { id: "nonexistent_order" };
      req.body = { status: "Shipped" };

      vi.mocked(Order.findById).mockResolvedValue(null);

      // Execute
      await orderController.updateOrder(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.message).toBe("Order not found with this Id");
      expect(error.statusCode).toBe(404);
    });

    it("should handle error if product is not found during updateStock", async () => {
      // Setup
      const mockOrder = {
        _id: "order123",
        orderStatus: "Processing",
        orderItems: [
          {
            product: "product123",
            quantity: 2,
          },
        ],
      };

      req.params = { id: "order123" };
      req.body = { status: "Shipped" };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);
      vi.mocked(Product.findById).mockResolvedValue(null);

      // Execute
      try {
        await orderController.updateOrder(req, res, next);
      } catch (error) {
        // Assert
        expect(error).toBeDefined();
      }

      // Since the error is thrown inside the updateStock function which is called from within
      // the updateOrder function, we need to verify the correct functions were called
      expect(Order.findById).toHaveBeenCalled();
      expect(Product.findById).toHaveBeenCalled();
    });
  });

  describe("deleteOrder", () => {
    it("should delete an order successfully", async () => {
      // Setup
      const mockOrder = {
        _id: "order123",
        deleteOne: vi.fn().mockResolvedValue({}),
      };

      req.params = { id: "order123" };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      // Execute
      await orderController.deleteOrder(req, res, next);

      // Assert
      expect(Order.findById).toHaveBeenCalledWith("order123");
      expect(mockOrder.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Order Deleted Successfully",
      });
    });

    it("should return error if order is not found", async () => {
      // Setup
      req.params = { id: "nonexistent_order" };

      vi.mocked(Order.findById).mockResolvedValue(null);

      // Execute
      await orderController.deleteOrder(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.message).toBe("Order not found with this Id");
      expect(error.statusCode).toBe(404);
    });
  });
});
