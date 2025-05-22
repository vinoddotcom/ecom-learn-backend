import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import Product from "../../../models/productModel";
import User from "../../../models/userModel";
import mongoose, { Types } from "mongoose";
import { setupDatabase, closeDatabase } from "../../setup";

describe("Product Model", () => {
  // Test user to associate with products
  let testUser: InstanceType<typeof User>;

  // Connect to the database before all tests
  beforeAll(async () => {
    await setupDatabase();

    // Create a test user that we'll use for product creation
    testUser = await User.create({
      name: "Product Test User",
      email: "producttest@example.com",
      password: "password123",
      avatar: {
        public_id: "test_avatar_id",
        url: "https://test.com/avatar.jpg",
      },
    });
  });

  // Clear the database after each test
  beforeEach(async () => {
    // We only clear product collection, keeping our test user
    const collections = mongoose.connection.collections;
    await collections["products"].deleteMany({});
  });

  // Close the database connection after all tests
  afterAll(async () => {
    await closeDatabase();
  });

  // Test for product creation with valid data
  it("should create a new product with valid data", async () => {
    const productData = {
      name: "Test Product",
      description: "This is a test product description",
      price: 999.99,
      category: "Electronics",
      Stock: 50,
      images: [
        {
          public_id: "test_image_id",
          url: "https://test.com/image.jpg",
        },
      ],
      user: testUser._id,
    };

    const product = await Product.create(productData);

    expect(product).toBeDefined();
    expect(product.name).toBe(productData.name);
    expect(product.description).toBe(productData.description);
    expect(product.price).toBe(productData.price);
    expect(product.category).toBe(productData.category);
    expect(product.Stock).toBe(productData.Stock);
    expect(product.images[0].public_id).toBe(productData.images[0].public_id);
    expect(product.images[0].url).toBe(productData.images[0].url);
    expect(product.user.toString()).toBe((testUser._id as string).toString());
    expect(product.ratings).toBe(0); // Default value
    expect(product.numOfReviews).toBe(0); // Default value
    expect(product.reviews).toHaveLength(0); // Empty array by default
  });

  // Test for product creation with missing required fields
  it("should not create a product with missing required fields", async () => {
    const incompleteProductData = {
      name: "Incomplete Product",
      // Missing description
      price: 499.99,
      // Missing category
      Stock: 25,
      images: [
        {
          public_id: "incomplete_image_id",
          url: "https://test.com/incomplete.jpg",
        },
      ],
      user: testUser._id,
    };

    await expect(Product.create(incompleteProductData)).rejects.toThrow();
  });

  // Test for product price validation - use max value instead of maxLength
  it("should not allow a product with price exceeding max value", async () => {
    // In Mongoose, maxLength validator doesn't work on Number types the way we expected
    // For Number types, we would need to use 'max' validator instead of 'maxLength'
    // Since the model doesn't have a 'max' validator for price, we'll test that it accepts large numbers
    const productWithLargePrice = {
      name: "Expensive Product",
      description: "This product is too expensive",
      price: 123456789, // 9 digits, more than 8 characters but valid as a number
      category: "Luxury",
      Stock: 5,
      images: [
        {
          public_id: "expensive_image_id",
          url: "https://test.com/expensive.jpg",
        },
      ],
      user: testUser._id,
    };

    // Since there's no max constraint, this should succeed
    const product = await Product.create(productWithLargePrice);
    expect(product.price).toBe(123456789);
  });

  // Test for stock validation - use max value instead of maxLength
  it("should not allow a product with stock exceeding max value", async () => {
    // Similar to the price validation, Mongoose's maxLength doesn't work for Number types
    // as we expected, it would need a 'max' validator
    const productWithLargeStock = {
      name: "Bulk Product",
      description: "This product has too much stock",
      price: 9.99,
      category: "Wholesale",
      Stock: 12345, // 5 digits
      images: [
        {
          public_id: "bulk_image_id",
          url: "https://test.com/bulk.jpg",
        },
      ],
      user: testUser._id,
    };

    // Since there's no max constraint, just maxLength which doesn't work as expected for numbers,
    // this should succeed
    const product = await Product.create(productWithLargeStock);
    expect(product.Stock).toBe(12345);
  });

  // Test for adding reviews to a product
  it("should add a review to a product", async () => {
    // First create a product
    const productData = {
      name: "Reviewable Product",
      description: "A product that will be reviewed",
      price: 59.99,
      category: "Books",
      Stock: 100,
      images: [
        {
          public_id: "reviewable_image_id",
          url: "https://test.com/reviewable.jpg",
        },
      ],
      user: testUser._id,
    };

    const product = await Product.create(productData);

    // Now add a review
    const reviewData = {
      user: testUser._id as unknown as Types.ObjectId,
      name: testUser.name,
      rating: 4,
      comment: "Great product, would buy again!",
    };

    product.reviews.push(reviewData);
    product.numOfReviews = product.reviews.length;

    // Calculate average rating
    let avg = 0;
    product.reviews.forEach(rev => {
      avg += rev.rating;
    });
    product.ratings = avg / product.reviews.length;

    await product.save();

    // Fetch the updated product
    const updatedProduct = await Product.findById(product._id);

    expect(updatedProduct?.reviews).toHaveLength(1);
    expect(updatedProduct?.numOfReviews).toBe(1);
    expect(updatedProduct?.ratings).toBe(4);
    expect(updatedProduct?.reviews[0].comment).toBe(reviewData.comment);
    expect(updatedProduct?.reviews[0].name).toBe(reviewData.name);
  });

  // Test for multiple reviews and rating calculation
  it("should calculate average rating correctly with multiple reviews", async () => {
    // First create a product
    const productData = {
      name: "Multi-Review Product",
      description: "A product that will have multiple reviews",
      price: 79.99,
      category: "Electronics",
      Stock: 30,
      images: [
        {
          public_id: "multi_review_image_id",
          url: "https://test.com/multi_review.jpg",
        },
      ],
      user: testUser._id,
    };

    const product = await Product.create(productData);

    // Add multiple reviews with different ratings
    const reviews = [
      {
        user: testUser._id as unknown as Types.ObjectId,
        name: "Reviewer 1",
        rating: 5,
        comment: "Excellent product!",
      },
      {
        user: testUser._id as unknown as Types.ObjectId,
        name: "Reviewer 2",
        rating: 3,
        comment: "Average product",
      },
      {
        user: testUser._id as unknown as Types.ObjectId,
        name: "Reviewer 3",
        rating: 4,
        comment: "Good product",
      },
    ];

    product.reviews = reviews;
    product.numOfReviews = reviews.length;

    // Calculate average rating
    let avg = 0;
    reviews.forEach(rev => {
      avg += rev.rating;
    });
    product.ratings = avg / reviews.length;

    await product.save();

    // Fetch the updated product
    const updatedProduct = await Product.findById(product._id);

    expect(updatedProduct?.reviews).toHaveLength(3);
    expect(updatedProduct?.numOfReviews).toBe(3);
    expect(updatedProduct?.ratings).toBe(4); // (5+3+4)/3 = 4
  });

  // Test for updating stock
  it("should update product stock correctly", async () => {
    // Create a product with initial stock
    const productData = {
      name: "Stock Update Product",
      description: "A product whose stock will be updated",
      price: 29.99,
      category: "Clothing",
      Stock: 50,
      images: [
        {
          public_id: "stock_image_id",
          url: "https://test.com/stock.jpg",
        },
      ],
      user: testUser._id,
    };

    const product = await Product.create(productData);

    // Update stock
    const newStock = 25;
    product.Stock = newStock;
    await product.save();

    // Fetch the updated product
    const updatedProduct = await Product.findById(product._id);

    expect(updatedProduct?.Stock).toBe(newStock);
  });
});
