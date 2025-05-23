import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import * as orderController from "../../../controllers/orderController";
import * as authMiddleware from "../../../middleware/auth";

// Mock Express router
vi.mock("express", () => ({
  default: {
    Router: vi.fn(() => ({
      route: vi.fn((path) => ({
        post: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        path,
      })),
    })),
  },
}));

// Mock controllers
vi.mock("../../../controllers/orderController", () => ({
  newOrder: vi.fn(),
  getSingleOrder: vi.fn(),
  myOrders: vi.fn(),
  getAllOrders: vi.fn(),
  updateOrder: vi.fn(),
  deleteOrder: vi.fn(),
}));

// Mock middleware
vi.mock("../../../middleware/auth", () => ({
  isAuthenticatedUser: vi.fn(),
  authorizeRoles: vi.fn(() => vi.fn()),
}));

describe("Order Routes", () => {
  let mockRouter: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter = express.Router();

    // Execute the route file to trigger the route definitions
    require("../../../routes/orderRoute");
  });

  it("should define POST /order/new route with authentication middleware and newOrder controller", () => {
    const routeHandler = mockRouter.route("/order/new");
    expect(routeHandler.post).toHaveBeenCalledWith(
      authMiddleware.isAuthenticatedUser, 
      orderController.newOrder
    );
  });

  it("should define GET /order/:id route with authentication middleware and getSingleOrder controller", () => {
    const routeHandler = mockRouter.route("/order/:id");
    expect(routeHandler.get).toHaveBeenCalledWith(
      authMiddleware.isAuthenticatedUser, 
      orderController.getSingleOrder
    );
  });

  it("should define GET /orders/me route with authentication middleware and myOrders controller", () => {
    const routeHandler = mockRouter.route("/orders/me");
    expect(routeHandler.get).toHaveBeenCalledWith(
      authMiddleware.isAuthenticatedUser, 
      orderController.myOrders
    );
  });

  it("should define GET /admin/orders route with authentication, admin role middleware and getAllOrders controller", () => {
    const routeHandler = mockRouter.route("/admin/orders");
    expect(routeHandler.get).toHaveBeenCalledWith(
      authMiddleware.isAuthenticatedUser,
      expect.any(Function), // authorizeRoles("admin") returns a function
      orderController.getAllOrders
    );
  });

  describe("Admin order routes", () => {
    it("should define PUT /admin/order/:id with authentication, admin role middleware and updateOrder controller", () => {
      const routeHandler = mockRouter.route("/admin/order/:id");
      expect(routeHandler.put).toHaveBeenCalledWith(
        authMiddleware.isAuthenticatedUser,
        expect.any(Function), // authorizeRoles("admin") returns a function
        orderController.updateOrder
      );
    });

    it("should define DELETE /admin/order/:id with authentication, admin role middleware and deleteOrder controller", () => {
      const routeHandler = mockRouter.route("/admin/order/:id");
      expect(routeHandler.delete).toHaveBeenCalledWith(
        authMiddleware.isAuthenticatedUser,
        expect.any(Function), // authorizeRoles("admin") returns a function
        orderController.deleteOrder
      );
    });
  });
});
