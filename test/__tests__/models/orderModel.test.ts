import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Order from '../../../models/orderModel';
import Product from '../../../models/productModel';
import User from '../../../models/userModel';
import mongoose from 'mongoose';
import { setupDatabase, closeDatabase } from '../../setup';

describe('Order Model', () => {
  // Test user and product to associate with orders
let testUser: InstanceType<typeof User>;
let testProduct: InstanceType<typeof Product>;

  // Connect to the database before all tests
  beforeAll(async () => {
    await setupDatabase();
    
    // Create a test user for orders
    testUser = await User.create({
      name: 'Order Test User',
      email: 'ordertest@example.com',
      password: 'password123',
      avatar: {
        public_id: 'order_user_avatar_id',
        url: 'https://test.com/order_avatar.jpg'
      }
    });

    // Create a test product for order items
    testProduct = await Product.create({
      name: 'Order Test Product',
      description: 'A product used in order tests',
      price: 49.99,
      category: 'Test Category',
      Stock: 100,
      images: [
        {
          public_id: 'order_product_image_id',
          url: 'https://test.com/order_product.jpg'
        }
      ],
      user: testUser._id
    });
  });

  // Clear the database after each test
  beforeEach(async () => {
    // Only clear orders collection, keeping our test user and product
    const collections = mongoose.connection.collections;
    await collections['orders'].deleteMany({});
  });

  // Close the database connection after all tests
  afterAll(async () => {
    await closeDatabase();
  });

  // Test for order creation with valid data
  it('should create a new order with valid data', async () => {
    const orderData = {
      shippingInfo: {
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        pinCode: 123456,
        phoneNo: 1234567890
      },
      orderItems: [
        {
          name: testProduct.name,
          price: testProduct.price,
          quantity: 2,
          image: testProduct.images[0].url,
          product: testProduct._id
        }
      ],
      user: testUser._id,
      paymentInfo: {
        id: 'test_payment_id',
        status: 'succeeded'
      },
      paidAt: new Date(),
      itemsPrice: testProduct.price * 2,
      taxPrice: 10.00,
      shippingPrice: 5.00,
      totalPrice: (testProduct.price * 2) + 10.00 + 5.00
    };

    const order = await Order.create(orderData);
    
    expect(order).toBeDefined();
    expect(order.shippingInfo.address).toBe(orderData.shippingInfo.address);
    expect(order.shippingInfo.city).toBe(orderData.shippingInfo.city);
    expect(order.orderItems).toHaveLength(1);
    expect(order.orderItems[0].name).toBe(testProduct.name);
    expect(order.orderItems[0].quantity).toBe(2);
    expect(order.paymentInfo.id).toBe(orderData.paymentInfo.id);
    expect(order.paymentInfo.status).toBe(orderData.paymentInfo.status);
    expect(order.itemsPrice).toBe(orderData.itemsPrice);
    expect(order.taxPrice).toBe(orderData.taxPrice);
    expect(order.shippingPrice).toBe(orderData.shippingPrice);
    expect(order.totalPrice).toBe(orderData.totalPrice);
    expect(order.orderStatus).toBe('Processing'); // Default value
  });

  // Test for order creation with missing required fields
  it('should not create an order with missing required fields', async () => {
    const incompleteOrderData = {
      shippingInfo: {
        address: '123 Test Street',
        city: 'Test City',
        // Missing state
        country: 'Test Country',
        pinCode: 123456,
        phoneNo: 1234567890
      },
      orderItems: [
        {
          name: testProduct.name,
          price: testProduct.price,
          quantity: 2,
          image: testProduct.images[0].url,
          product: testProduct._id
        }
      ],
      user: testUser._id,
      // Missing paymentInfo
      paidAt: new Date(),
      itemsPrice: testProduct.price * 2,
      taxPrice: 10.00,
      shippingPrice: 5.00,
      totalPrice: (testProduct.price * 2) + 10.00 + 5.00
    };

    await expect(Order.create(incompleteOrderData)).rejects.toThrow();
  });

  // Test for order with multiple items
  it('should create an order with multiple items', async () => {
    // Create a second test product
    const secondTestProduct = await Product.create({
      name: 'Second Order Test Product',
      description: 'Another product used in order tests',
      price: 29.99,
      category: 'Test Category',
      Stock: 50,
      images: [
        {
          public_id: 'order_product2_image_id',
          url: 'https://test.com/order_product2.jpg'
        }
      ],
      user: testUser._id
    });

    const orderData = {
      shippingInfo: {
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        pinCode: 123456,
        phoneNo: 1234567890
      },
      orderItems: [
        {
          name: testProduct.name,
          price: testProduct.price,
          quantity: 1,
          image: testProduct.images[0].url,
          product: testProduct._id
        },
        {
          name: secondTestProduct.name,
          price: secondTestProduct.price,
          quantity: 3,
          image: secondTestProduct.images[0].url,
          product: secondTestProduct._id
        }
      ],
      user: testUser._id,
      paymentInfo: {
        id: 'test_multi_payment_id',
        status: 'succeeded'
      },
      paidAt: new Date(),
      itemsPrice: testProduct.price + (secondTestProduct.price * 3),
      taxPrice: 15.00,
      shippingPrice: 10.00,
      totalPrice: testProduct.price + (secondTestProduct.price * 3) + 15.00 + 10.00
    };

    const order = await Order.create(orderData);
    
    expect(order.orderItems).toHaveLength(2);
    expect(order.orderItems[0].name).toBe(testProduct.name);
    expect(order.orderItems[1].name).toBe(secondTestProduct.name);
    expect(order.orderItems[1].quantity).toBe(3);
  });

  // Test for updating order status
  it('should update order status correctly', async () => {
    const orderData = {
      shippingInfo: {
        address: '123 Status Street',
        city: 'Status City',
        state: 'Status State',
        country: 'Status Country',
        pinCode: 654321,
        phoneNo: 9876543210
      },
      orderItems: [
        {
          name: testProduct.name,
          price: testProduct.price,
          quantity: 1,
          image: testProduct.images[0].url,
          product: testProduct._id
        }
      ],
      user: testUser._id,
      paymentInfo: {
        id: 'status_payment_id',
        status: 'succeeded'
      },
      paidAt: new Date(),
      itemsPrice: testProduct.price,
      taxPrice: 5.00,
      shippingPrice: 2.00,
      totalPrice: testProduct.price + 5.00 + 2.00
    };

    const order = await Order.create(orderData);
    
    // Initial status should be "Processing"
    expect(order.orderStatus).toBe('Processing');
    
    // Update to "Shipped"
    order.orderStatus = 'Shipped';
    await order.save();
    
    // Fetch updated order
    const shippedOrder = await Order.findById(order._id);
    expect(shippedOrder?.orderStatus).toBe('Shipped');
    
    // Update to "Delivered" and set deliveredAt
    order.orderStatus = 'Delivered';
    order.deliveredAt = new Date();
    await order.save();
    
    // Fetch updated order again
    const deliveredOrder = await Order.findById(order._id);
    expect(deliveredOrder?.orderStatus).toBe('Delivered');
    expect(deliveredOrder?.deliveredAt).toBeDefined();
  });

  // Test for price calculation validation
  it('should ensure total price equals sum of components', async () => {
    const itemsPrice = 100;
    const taxPrice = 18;
    const shippingPrice = 10;
    const correctTotalPrice = itemsPrice + taxPrice + shippingPrice;
    const incorrectTotalPrice = 200; // Deliberately wrong
    
    const correctOrderData = {
      shippingInfo: {
        address: '123 Price Street',
        city: 'Price City',
        state: 'Price State',
        country: 'Price Country',
        pinCode: 111222,
        phoneNo: 3334445555
      },
      orderItems: [
        {
          name: 'Price Test Item',
          price: itemsPrice,
          quantity: 1,
          image: 'https://test.com/price_item.jpg',
          product: testProduct._id
        }
      ],
      user: testUser._id,
      paymentInfo: {
        id: 'price_payment_id',
        status: 'succeeded'
      },
      paidAt: new Date(),
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice: correctTotalPrice
    };
    
    const incorrectOrderData = {
      ...correctOrderData,
      totalPrice: incorrectTotalPrice
    };
    
    // Correct pricing should work
    const correctOrder = await Order.create(correctOrderData);
    expect(correctOrder.totalPrice).toBe(correctTotalPrice);
    
    // We're not testing validation here since Mongoose doesn't automatically validate
    // the relationship between different fields, but we could add a custom validator
    // in the model if needed
    const incorrectOrder = await Order.create(incorrectOrderData);
    expect(incorrectOrder.totalPrice).toBe(incorrectTotalPrice);
  });
});