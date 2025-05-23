import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import * as userController from "../../../controllers/userController";
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
vi.mock("../../../controllers/userController", () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  logout: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  getUserDetails: vi.fn(),
  updatePassword: vi.fn(),
  updateProfile: vi.fn(),
  getAllUsers: vi.fn(),
  getSingleUser: vi.fn(),
  updateUserRole: vi.fn(),
  deleteUser: vi.fn(),
}));

// Mock middleware
vi.mock("../../../middleware/auth", () => ({
  isAuthenticatedUser: vi.fn(),
  authorizeRoles: vi.fn(() => vi.fn()),
}));

describe("User Routes", () => {
  let mockRouter: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter = express.Router();

    // Execute the route file to trigger the route definitions
    require("../../../routes/userRoute");
  });

  it("should define POST /register route with registerUser controller", () => {
    const routeHandler = mockRouter.route("/register");
    expect(routeHandler.post).toHaveBeenCalledWith(userController.registerUser);
  });

  it("should define POST /login route with loginUser controller", () => {
    const routeHandler = mockRouter.route("/login");
    expect(routeHandler.post).toHaveBeenCalledWith(userController.loginUser);
  });

  it("should define POST /password/forgot route with forgotPassword controller", () => {
    const routeHandler = mockRouter.route("/password/forgot");
    expect(routeHandler.post).toHaveBeenCalledWith(userController.forgotPassword);
  });

  it("should define PUT /password/reset/:token route with resetPassword controller", () => {
    const routeHandler = mockRouter.route("/password/reset/:token");
    expect(routeHandler.put).toHaveBeenCalledWith(userController.resetPassword);
  });

  it("should define GET /logout route with logout controller", () => {
    const routeHandler = mockRouter.route("/logout");
    expect(routeHandler.get).toHaveBeenCalledWith(userController.logout);
  });

  it("should define GET /me route with authentication middleware and getUserDetails controller", () => {
    const routeHandler = mockRouter.route("/me");
    expect(routeHandler.get).toHaveBeenCalledWith(
      authMiddleware.isAuthenticatedUser,
      userController.getUserDetails
    );
  });

  it("should define PUT /password/update route with authentication middleware and updatePassword controller", () => {
    const routeHandler = mockRouter.route("/password/update");
    expect(routeHandler.put).toHaveBeenCalledWith(
      authMiddleware.isAuthenticatedUser,
      userController.updatePassword
    );
  });

  it("should define PUT /me/update route with authentication middleware and updateProfile controller", () => {
    const routeHandler = mockRouter.route("/me/update");
    expect(routeHandler.put).toHaveBeenCalledWith(
      authMiddleware.isAuthenticatedUser,
      userController.updateProfile
    );
  });

  it("should define GET /admin/users route with authentication, admin role middleware and getAllUsers controller", () => {
    const routeHandler = mockRouter.route("/admin/users");
    expect(routeHandler.get).toHaveBeenCalledWith(
      authMiddleware.isAuthenticatedUser,
      expect.any(Function), // authorizeRoles("admin") returns a function
      userController.getAllUsers
    );
  });

  describe("Admin user routes", () => {
    it("should define GET /admin/user/:id with authentication, admin role middleware and getSingleUser controller", () => {
      const routeHandler = mockRouter.route("/admin/user/:id");
      expect(routeHandler.get).toHaveBeenCalledWith(
        authMiddleware.isAuthenticatedUser,
        expect.any(Function), // authorizeRoles("admin") returns a function
        userController.getSingleUser
      );
    });

    it("should define PUT /admin/user/:id with authentication, admin role middleware and updateUserRole controller", () => {
      const routeHandler = mockRouter.route("/admin/user/:id");
      expect(routeHandler.put).toHaveBeenCalledWith(
        authMiddleware.isAuthenticatedUser,
        expect.any(Function), // authorizeRoles("admin") returns a function
        userController.updateUserRole
      );
    });

    it("should define DELETE /admin/user/:id with authentication, admin role middleware and deleteUser controller", () => {
      const routeHandler = mockRouter.route("/admin/user/:id");
      expect(routeHandler.delete).toHaveBeenCalledWith(
        authMiddleware.isAuthenticatedUser,
        expect.any(Function), // authorizeRoles("admin") returns a function
        userController.deleteUser
      );
    });
  });
});
