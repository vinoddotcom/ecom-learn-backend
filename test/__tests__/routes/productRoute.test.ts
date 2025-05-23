import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import * as productController from "../../../controllers/productController";
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
vi.mock("../../../controllers/productController", () => ({
  getAllProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  getProductDetails: vi.fn(),
  createProductReview: vi.fn(),
  getProductReviews: vi.fn(),
  deleteReview: vi.fn(),
  getAdminProducts: vi.fn(),
}));

// Mock middleware
vi.mock("../../../middleware/auth", () => ({
  isAuthenticatedUser: vi.fn(),
  authorizeRoles: vi.fn(() => vi.fn()),
}));

describe("Product Routes", () => {
  let mockRouter: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter = express.Router();

    // Execute the route file to trigger the route definitions
    require("../../../routes/productRoute");
  });

  it("should define GET /products route with getAllProducts controller", () => {
    const routeHandler = mockRouter.route("/products");
    expect(routeHandler.get).toHaveBeenCalledWith(productController.getAllProducts);
  });

  it("should define GET /admin/products route with authentication, admin role middleware and getAdminProducts controller", () => {
    const routeHandler = mockRouter.route("/admin/products");
    expect(routeHandler.get).toHaveBeenCalledWith(
      authMiddleware.isAuthenticatedUser,
      expect.any(Function), // authorizeRoles("admin") returns a function
      productController.getAdminProducts
    );
  });

  it("should define POST /admin/product/new route with authentication, admin role middleware and createProduct controller", () => {
    const routeHandler = mockRouter.route("/admin/product/new");
    expect(routeHandler.post).toHaveBeenCalledWith(
      authMiddleware.isAuthenticatedUser,
      expect.any(Function), // authorizeRoles("admin") returns a function
      productController.createProduct
    );
  });

  describe("Admin product routes", () => {
    it("should define PUT /admin/product/:id with authentication, admin role middleware and updateProduct controller", () => {
      const routeHandler = mockRouter.route("/admin/product/:id");
      expect(routeHandler.put).toHaveBeenCalledWith(
        authMiddleware.isAuthenticatedUser,
        expect.any(Function), // authorizeRoles("admin") returns a function
        productController.updateProduct
      );
    });

    it("should define DELETE /admin/product/:id with authentication, admin role middleware and deleteProduct controller", () => {
      const routeHandler = mockRouter.route("/admin/product/:id");
      expect(routeHandler.delete).toHaveBeenCalledWith(
        authMiddleware.isAuthenticatedUser,
        expect.any(Function), // authorizeRoles("admin") returns a function
        productController.deleteProduct
      );
    });
  });

  it("should define GET /product/:id route with getProductDetails controller", () => {
    const routeHandler = mockRouter.route("/product/:id");
    expect(routeHandler.get).toHaveBeenCalledWith(productController.getProductDetails);
  });

  it("should define PUT /review route with authentication middleware and createProductReview controller", () => {
    const routeHandler = mockRouter.route("/review");
    expect(routeHandler.put).toHaveBeenCalledWith(
      authMiddleware.isAuthenticatedUser,
      productController.createProductReview
    );
  });

  describe("Review routes", () => {
    it("should define GET /reviews route with getProductReviews controller", () => {
      const routeHandler = mockRouter.route("/reviews");
      expect(routeHandler.get).toHaveBeenCalledWith(productController.getProductReviews);
    });

    it("should define DELETE /reviews route with authentication middleware and deleteReview controller", () => {
      const routeHandler = mockRouter.route("/reviews");
      expect(routeHandler.delete).toHaveBeenCalledWith(
        authMiddleware.isAuthenticatedUser,
        productController.deleteReview
      );
    });
  });
});
