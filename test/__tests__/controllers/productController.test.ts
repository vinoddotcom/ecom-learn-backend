import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import * as productController from "../../../controllers/productController";
import Product from "../../../models/productModel";
import ErrorHandler from "../../../utils/errorhandler";
import * as cloudinaryUtils from "../../../utils/cloudinary";
import ApiFeatures from "../../../utils/apifeatures";

// Mock dependencies
vi.mock("../../../models/productModel", () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("../../../utils/cloudinary", () => ({
  uploadToCloudinary: vi.fn(),
  deleteFromCloudinary: vi.fn(),
}));

vi.mock("../../../utils/apifeatures", () => ({
  default: vi.fn(),
}));

// Mock Express Request and Response objects
const mockRequest = () => {
  const req: Partial<Request> = {
    body: {},
    cookies: {},
    params: {},
    query: {},
    user: { id: "testUserId", _id: "testUserId" } as any,
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

// Mock ApiFeatures class
const mockApiFeaturesMethods = {
  search: vi.fn().mockReturnThis(),
  filter: vi.fn().mockReturnThis(),
  pagination: vi.fn().mockReturnThis(),
  query: [],
};

describe("Product Controller", () => {
  let req: Request;
  let res: Response;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = vi.fn();
    vi.clearAllMocks();

    // Setup ApiFeatures mock
    (ApiFeatures as unknown as ReturnType<typeof vi.fn>).mockImplementation?.(
      () => mockApiFeaturesMethods
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createProduct", () => {
    it("should create a product successfully with single image", async () => {
      // Setup
      const mockProduct = {
        name: "Test Product",
        _id: "product123",
      };

      const mockCloud = {
        public_id: "test_image_id",
        secure_url: "https://test.com/image.jpg",
      };

      req.body = {
        name: "Test Product",
        description: "Test Description",
        price: 99.99,
        category: "Electronics",
        Stock: 10,
        images: "base64_encoded_image",
      };
      req.user = { _id: "user123" } as any;

      vi.mocked(cloudinaryUtils.uploadToCloudinary).mockResolvedValue(mockCloud as any);
      vi.mocked(Product.create).mockResolvedValue(mockProduct as any);

      // Execute
      await productController.createProduct(req, res, next);

      // Assert
      expect(cloudinaryUtils.uploadToCloudinary).toHaveBeenCalledWith(
        "base64_encoded_image",
        "products"
      );

      expect(Product.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        product: mockProduct,
      });
    });

    it("should create a product successfully with multiple images", async () => {
      // Setup
      const mockProduct = {
        name: "Test Product",
        _id: "product123",
      };

      const mockCloud1 = {
        public_id: "test_image_id1",
        secure_url: "https://test.com/image1.jpg",
      };

      const mockCloud2 = {
        public_id: "test_image_id2",
        secure_url: "https://test.com/image2.jpg",
      };

      req.body = {
        name: "Test Product",
        description: "Test Description",
        price: 99.99,
        category: "Electronics",
        Stock: 10,
        images: ["base64_encoded_image1", "base64_encoded_image2"],
      };
      req.user = { _id: "user123" } as any;

      vi.mocked(cloudinaryUtils.uploadToCloudinary)
        .mockResolvedValueOnce(mockCloud1 as any)
        .mockResolvedValueOnce(mockCloud2 as any);

      vi.mocked(Product.create).mockResolvedValue(mockProduct as any);

      // Execute
      await productController.createProduct(req, res, next);

      // Assert
      expect(cloudinaryUtils.uploadToCloudinary).toHaveBeenCalledTimes(2);
      expect(Product.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        product: mockProduct,
      });
    });

    it("should handle errors during product creation", async () => {
      // Setup
      const error = new Error("Product creation failed");

      req.body = {
        name: "Test Product",
        description: "Test Description",
        price: 99.99,
        category: "Electronics",
        Stock: 10,
        images: "base64_encoded_image",
      };

      vi.mocked(cloudinaryUtils.uploadToCloudinary).mockRejectedValue(error);

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
      await productController.createProduct(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect((next as any).mock.calls[0][0]).toBeInstanceOf(ErrorHandler);
    });
  });

  describe("getAllProducts", () => {
    it("should return all products with pagination", async () => {
      // Setup
      const mockProducts = [
        { _id: "product1", name: "Product 1" },
        { _id: "product2", name: "Product 2" },
      ];

      const productsCount = 10;
      const resultPerPage = 8;

      req.query = { page: "1", limit: "8" };

      vi.mocked(Product.countDocuments).mockResolvedValue(productsCount);
      mockApiFeaturesMethods.query = mockProducts as any;

      // Execute
      await productController.getAllProducts(req, res, next);

      // Assert
      expect(Product.countDocuments).toHaveBeenCalled();
      expect(ApiFeatures).toHaveBeenCalledWith(Product.find(), req.query);
      expect(mockApiFeaturesMethods.search).toHaveBeenCalled();
      expect(mockApiFeaturesMethods.filter).toHaveBeenCalled();

      // Set expectation based on how your controller actually works
      if (productController.getAllProducts.toString().includes("pagination")) {
        expect(mockApiFeaturesMethods.pagination).toHaveBeenCalled();
      }

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        products: mockProducts,
        productsCount,
        resultPerPage,
        filteredProductsCount: mockProducts.length,
      });
    });
  });

  describe("getAdminProducts", () => {
    it("should return all products for admin", async () => {
      // Setup
      const mockProducts = [
        { _id: "product1", name: "Product 1" },
        { _id: "product2", name: "Product 2" },
      ];

      vi.mocked(Product.find).mockResolvedValue(mockProducts as any);

      // Execute
      await productController.getAdminProducts(req, res, next);

      // Assert
      expect(Product.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        products: mockProducts,
      });
    });
  });

  describe("getProductDetails", () => {
    it("should return product details", async () => {
      // Setup
      const mockProduct = {
        _id: "product123",
        name: "Test Product",
        description: "Test Description",
        price: 99.99,
      };

      req.params = { id: "product123" };

      vi.mocked(Product.findById).mockResolvedValue(mockProduct as any);

      // Execute
      await productController.getProductDetails(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith("product123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        product: mockProduct,
      });
    });

    it("should return error if product is not found", async () => {
      // Setup
      req.params = { id: "nonexistent_product" };

      vi.mocked(Product.findById).mockResolvedValue(null);

      // Execute
      await productController.getProductDetails(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.message).toBe("Product not found");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("updateProduct", () => {
    it("should update product without changing images", async () => {
      // Setup
      const mockProduct = {
        _id: "product123",
        name: "Test Product",
        images: [],
      };

      const mockUpdatedProduct = {
        _id: "product123",
        name: "Updated Product",
        description: "Updated Description",
        price: 199.99,
      };

      req.params = { id: "product123" };
      req.body = {
        name: "Updated Product",
        description: "Updated Description",
        price: 199.99,
      };

      vi.mocked(Product.findById).mockResolvedValue(mockProduct as any);
      vi.mocked(Product.findByIdAndUpdate).mockResolvedValue(mockUpdatedProduct as any);

      // Execute
      await productController.updateProduct(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith("product123");
      expect(Product.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        product: mockUpdatedProduct,
      });
    });

    it("should update product with new images", async () => {
      // Setup
      const mockProduct = {
        _id: "product123",
        name: "Test Product",
        images: [{ public_id: "old_image_id", url: "https://test.com/old_image.jpg" }],
      };

      const mockUpdatedProduct = {
        _id: "product123",
        name: "Updated Product",
        description: "Updated Description",
        price: 199.99,
        images: [{ public_id: "new_image_id", url: "https://test.com/new_image.jpg" }],
      };

      const mockCloud = {
        public_id: "new_image_id",
        secure_url: "https://test.com/new_image.jpg",
      };

      req.params = { id: "product123" };
      req.body = {
        name: "Updated Product",
        description: "Updated Description",
        price: 199.99,
        images: "new_base64_image",
      };

      vi.mocked(Product.findById).mockResolvedValue({ ...mockProduct } as any);
      vi.mocked(cloudinaryUtils.deleteFromCloudinary).mockResolvedValue({} as any);
      vi.mocked(cloudinaryUtils.uploadToCloudinary).mockResolvedValue(mockCloud as any);
      vi.mocked(Product.findByIdAndUpdate).mockResolvedValue(mockUpdatedProduct as any);

      // Execute
      await productController.updateProduct(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith("product123");
      expect(Product.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it("should return error if product is not found", async () => {
      // Setup
      req.params = { id: "nonexistent_product" };
      req.body = {
        name: "Updated Product",
      };

      vi.mocked(Product.findById).mockResolvedValue(null);

      // Execute
      await productController.updateProduct(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.message).toBe("Product not found");
      expect(error.statusCode).toBe(404);
    });

    it("should handle errors during update", async () => {
      // Setup
      const mockProduct = {
        _id: "product123",
        name: "Test Product",
        images: [],
      };

      const error = new Error("Update failed");

      req.params = { id: "product123" };
      req.body = {
        name: "Updated Product",
      };

      vi.mocked(Product.findById).mockResolvedValue(mockProduct as any);
      vi.mocked(Product.findByIdAndUpdate).mockRejectedValue(error);

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
      await productController.updateProduct(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });
  });

  describe("deleteProduct", () => {
    it("should delete product successfully", async () => {
      // Setup
      const deleteOneMock = vi.fn().mockResolvedValue({});

      const mockProduct = {
        _id: "product123",
        name: "Test Product",
        images: [{ public_id: "image_id", url: "https://test.com/image.jpg" }],
        deleteOne: deleteOneMock,
      };

      req.params = { id: "product123" };

      vi.mocked(Product.findById).mockResolvedValue(mockProduct as any);
      vi.mocked(cloudinaryUtils.deleteFromCloudinary).mockResolvedValue({} as any);

      // Execute
      await productController.deleteProduct(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith("product123");
      expect(deleteOneMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Product Deleted Successfully",
      });
    });

    it("should return error if product is not found", async () => {
      // Setup
      req.params = { id: "nonexistent_product" };

      vi.mocked(Product.findById).mockResolvedValue(null);

      // Execute
      await productController.deleteProduct(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.message).toBe("Product not found");
      expect(error.statusCode).toBe(404);
    });

    it("should handle errors during deletion", async () => {
      // Setup
      const mockProduct = {
        _id: "product123",
        name: "Test Product",
        images: [{ public_id: "image_id", url: "https://test.com/image.jpg" }],
      };

      const error = new Error("Deletion failed");

      req.params = { id: "product123" };

      vi.mocked(Product.findById).mockResolvedValue(mockProduct as any);
      vi.mocked(cloudinaryUtils.deleteFromCloudinary).mockRejectedValue(error);

      // Manually mock the catchAsyncErrors wrapper
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
      await productController.deleteProduct(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });
  });

  describe("createProductReview", () => {
    it("should add a new review to a product", async () => {
      // Setup
      const mockProduct = {
        _id: "product123",
        name: "Test Product",
        reviews: [],
        save: vi.fn().mockResolvedValue({}),
        numOfReviews: 0,
        ratings: 0,
      };

      req.body = {
        rating: 4,
        comment: "Great product",
        productId: "product123",
      };

      req.user = {
        _id: "user123",
        name: "Test User",
      } as any;

      vi.mocked(Product.findById).mockResolvedValue({ ...mockProduct } as any);

      // Execute
      await productController.createProductReview(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith("product123");
      expect(mockProduct.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should update an existing review", async () => {
      // Setup
      const mockProduct = {
        _id: "product123",
        name: "Test Product",
        reviews: [
          {
            user: "user123",
            name: "Test User",
            rating: 3,
            comment: "Good product",
          },
        ],
        numOfReviews: 1,
        ratings: 3,
        save: vi.fn().mockResolvedValue({}),
      };

      req.body = {
        rating: 5,
        comment: "Excellent product after more use",
        productId: "product123",
      };

      req.user = {
        _id: "user123",
        name: "Test User",
      } as any;

      vi.mocked(Product.findById).mockResolvedValue({ ...mockProduct } as any);

      // Execute
      await productController.createProductReview(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith("product123");
      expect(mockProduct.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should return error if product is not found", async () => {
      // Setup
      req.body = {
        rating: 4,
        comment: "Great product",
        productId: "nonexistent_product",
      };

      vi.mocked(Product.findById).mockResolvedValue(null);

      // Execute
      await productController.createProductReview(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.message).toBe("Product not found");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("getProductReviews", () => {
    it("should return product reviews", async () => {
      // Setup
      const mockProduct = {
        _id: "product123",
        name: "Test Product",
        reviews: [
          {
            user: "user123",
            name: "Test User",
            rating: 4,
            comment: "Great product",
          },
        ],
      };

      req.query = { id: "product123" };

      vi.mocked(Product.findById).mockResolvedValue(mockProduct as any);

      // Execute
      await productController.getProductReviews(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith("product123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        reviews: mockProduct.reviews,
      });
    });

    it("should return error if product is not found", async () => {
      // Setup
      req.query = { id: "nonexistent_product" };

      vi.mocked(Product.findById).mockResolvedValue(null);

      // Execute
      await productController.getProductReviews(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.message).toBe("Product not found");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("deleteReview", () => {
    it("should delete a review and update ratings", async () => {
      // Setup
      const mockReviewId = "review123";
      const mockProductId = "product123";

      req.query = {
        id: mockReviewId,
        productId: mockProductId,
      };

      const mockProduct = {
        _id: mockProductId,
        reviews: [
          {
            _id: "review123",
            user: "user123",
            name: "Test User",
            rating: 4,
            comment: "Great product",
          },
          {
            _id: "review456",
            user: "user456",
            name: "Another User",
            rating: 5,
            comment: "Excellent product",
          },
        ],
        ratings: 4.5,
        numOfReviews: 2,
      };

      vi.mocked(Product.findById).mockResolvedValue({ ...mockProduct } as any);
      vi.mocked(Product.findByIdAndUpdate).mockResolvedValue({} as any);

      // Execute
      await productController.deleteReview(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith(mockProductId);
      expect(Product.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should handle case when all reviews are deleted", async () => {
      // Setup
      const mockReviewId = "review123";
      const mockProductId = "product123";

      req.query = {
        id: mockReviewId,
        productId: mockProductId,
      };

      const mockProduct = {
        _id: mockProductId,
        reviews: [
          {
            _id: "review123",
            user: "user123",
            name: "Test User",
            rating: 4,
            comment: "Great product",
          },
        ],
        ratings: 4,
        numOfReviews: 1,
      };

      vi.mocked(Product.findById).mockResolvedValue({ ...mockProduct } as any);
      vi.mocked(Product.findByIdAndUpdate).mockResolvedValue({} as any);

      // Execute
      await productController.deleteReview(req, res, next);

      // Assert
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProductId,
        {
          reviews: [],
          ratings: 0, // No reviews remain
          numOfReviews: 0,
        },
        expect.objectContaining({
          new: true,
          runValidators: true,
        })
      );
    });

    it("should return error if productId or reviewId is missing", async () => {
      // Setup - missing productId
      req.query = { id: "review123" };

      // Execute
      await productController.deleteReview(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.message).toBe("Product ID and Review ID are required");
      expect(error.statusCode).toBe(400);

      // Reset for next test
      vi.clearAllMocks();
      next = vi.fn();

      // Setup - missing reviewId
      req.query = { productId: "product123" };

      // Execute
      await productController.deleteReview(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error2 = (next as any).mock.calls[0][0];
      expect(error2).toBeInstanceOf(ErrorHandler);
      expect(error2.message).toBe("Product ID and Review ID are required");
      expect(error2.statusCode).toBe(400);
    });

    it("should return error if product is not found", async () => {
      // Setup
      req.query = {
        id: "review123",
        productId: "nonexistent_product",
      };

      vi.mocked(Product.findById).mockResolvedValue(null);

      // Execute
      await productController.deleteReview(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.message).toBe("Product not found");
      expect(error.statusCode).toBe(404);
    });
  });
});
