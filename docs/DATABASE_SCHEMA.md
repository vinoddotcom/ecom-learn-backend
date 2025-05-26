# Database Schema Documentation

This document details the MongoDB database schema used in the E-Commerce Backend application, including collections, fields, relationships, and indexing strategies.

## Database Overview

The application uses MongoDB with Mongoose as the ODM (Object Document Mapper). The database consists of three primary collections:

1. **Users**: Stores user account and authentication information
2. **Products**: Contains product details including reviews
3. **Orders**: Records customer orders with order items and shipping details

## Schema Diagrams

### Relationships Overview

```
+------------+      +--------------+
|            |      |              |
|   Users    |<-----+    Orders    |
|            |      |              |
+------------+      +--------------+
      ^                    |
      |                    |
      |                    v
+------------+      +--------------+
|            |      |              |
|  Reviews   |----->|   Products   |
|            |      |              |
+-----+------+      +--------------+
      ^                    ^
      |                    |
      |                    |
+------------+      +--------------+
|            |      |              |
|   Users    +----->| Order Items  |
|            |      |              |
+------------+      +--------------+
```

## User Schema

### Fields

| Field              | Type     | Properties                             | Description                                |
|--------------------|----------|----------------------------------------|--------------------------------------------|
| _id                | ObjectId | Auto-generated                         | Unique identifier                          |
| name               | String   | Required, Trimmed                      | User's full name                           |
| email              | String   | Required, Trimmed, Unique, Lowercase   | User's email address (used for login)      |
| password           | String   | Required, Select: false                | Hashed password (never returned to client) |
| avatar             | Object   | -                                      | User profile image                         |
| avatar.public_id   | String   | -                                      | Cloudinary public ID                       |
| avatar.url         | String   | -                                      | Cloudinary image URL                       |
| role               | String   | Default: "user", Enum: ["user", "admin"] | User's role for authorization            |
| resetPasswordToken | String   | -                                      | Token for password reset                   |
| resetPasswordExpire| Date     | -                                      | Expiration date for reset token            |
| createdAt          | Date     | Default: Date.now                      | Account creation timestamp                 |

### Indexes

```javascript
// Unique index on email field for fast lookups during login
userSchema.index({ email: 1 }, { unique: true });
```

### Methods

```javascript
// Compare entered password with stored (hashed) password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token for authentication
userSchema.methods.getJWTToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
    
  // Set token expire time
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  
  return resetToken;
};
```

### Pre-save Hooks

```javascript
// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    next();
  }
  
  this.password = await bcrypt.hash(this.password, 10);
});
```

## Product Schema

### Fields

| Field              | Type     | Properties                  | Description                                    |
|--------------------|----------|-----------------------------|-------------------------------------------------|
| _id                | ObjectId | Auto-generated              | Unique identifier                              |
| name               | String   | Required, Trimmed           | Product name                                   |
| description        | String   | Required                    | Product description                            |
| price              | Number   | Required, Min: 0            | Product price                                  |
| ratings            | Number   | Default: 0                  | Average product rating                         |
| images             | Array    | -                           | Product images                                 |
| images[].public_id | String   | -                           | Cloudinary public ID                           |
| images[].url       | String   | -                           | Cloudinary image URL                           |
| category           | String   | Required                    | Product category                               |
| Stock              | Number   | Required, Default: 1        | Available inventory                            |
| numOfReviews       | Number   | Default: 0                  | Total number of reviews                        |
| reviews            | Array    | -                           | Array of review objects                        |
| reviews[].user     | ObjectId | Ref: "User"                 | User who submitted the review (foreign key)    |
| reviews[].name     | String   | -                           | Name of the reviewer                           |
| reviews[].rating   | Number   | Required                    | Rating value (1-5)                             |
| reviews[].comment  | String   | -                           | Review comment text                            |
| user               | ObjectId | Required, Ref: "User"       | User who created the product (usually admin)   |
| createdAt          | Date     | Default: Date.now           | Product creation timestamp                     |

### Indexes

```javascript
// Index for faster category-based searches
productSchema.index({ category: 1 });

// Index for price-based filtering and sorting
productSchema.index({ price: 1 });

// Text index for search functionality
productSchema.index({ name: 'text', description: 'text' });
```

## Order Schema

### Fields

| Field                       | Type     | Properties                  | Description                                |
|----------------------------|----------|-----------------------------|--------------------------------------------|
| _id                        | ObjectId | Auto-generated              | Unique identifier                          |
| shippingInfo               | Object   | Required                    | Shipping details                           |
| shippingInfo.address       | String   | Required                    | Delivery address                           |
| shippingInfo.city          | String   | Required                    | City                                       |
| shippingInfo.state         | String   | Required                    | State/Province                             |
| shippingInfo.country       | String   | Required                    | Country                                    |
| shippingInfo.pinCode       | Number   | Required                    | ZIP/PIN code                               |
| shippingInfo.phoneNo       | Number   | Required                    | Contact phone number                       |
| orderItems                 | Array    | Required                    | Items in the order                         |
| orderItems[].name          | String   | Required                    | Product name                               |
| orderItems[].price         | Number   | Required                    | Product price at time of purchase          |
| orderItems[].quantity      | Number   | Required                    | Order quantity                             |
| orderItems[].image         | String   | Required                    | Product image URL                          |
| orderItems[].product       | ObjectId | Required, Ref: "Product"    | Reference to product                       |
| user                       | ObjectId | Required, Ref: "User"       | User who placed the order                  |
| paymentInfo                | Object   | Required                    | Payment details                            |
| paymentInfo.id             | String   | Required                    | Payment transaction ID                     |
| paymentInfo.status         | String   | Required                    | Payment status                             |
| paidAt                     | Date     | Required                    | Payment timestamp                          |
| itemsPrice                 | Number   | Required, Default: 0        | Subtotal (before tax and shipping)         |
| taxPrice                   | Number   | Required, Default: 0        | Tax amount                                 |
| shippingPrice              | Number   | Required, Default: 0        | Shipping cost                              |
| totalPrice                 | Number   | Required, Default: 0        | Order total                                |
| orderStatus                | String   | Required, Default: "Processing" | Current order status                    |
| deliveredAt                | Date     | -                           | Delivery timestamp                         |
| createdAt                  | Date     | Default: Date.now           | Order creation timestamp                   |

### Indexes

```javascript
// Index for user-based order lookups
orderSchema.index({ user: 1 });

// Index for order status queries
orderSchema.index({ orderStatus: 1 });

// Index for date range queries
orderSchema.index({ createdAt: 1 });
```

## Data Relationships

### Users to Orders

- One-to-many relationship
- User `_id` is referenced in Order's `user` field
- Allows for querying all orders placed by a specific user

### Users to Reviews

- One-to-many relationship
- User `_id` is referenced in each review object in the Product's `reviews` array
- Ensures each review is associated with a valid user

### Products to Orders

- One-to-many relationship
- Product `_id` is referenced in each orderItem's `product` field
- Maintains product reference even if product details change later

### Products to Reviews

- One-to-many relationship (embedded)
- Reviews are embedded directly in the Product document
- Optimized for reading product data with reviews in a single query

## Validation Rules

### User Validation

```javascript
{
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    minLength: [8, "Password should be greater than 8 characters"],
    select: false,
  }
}
```

### Product Validation

```javascript
{
  name: {
    type: String,
    required: [true, "Please Enter product Name"],
    trim: true,
    maxLength: [100, "Product name cannot exceed 100 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please Enter product Price"],
    maxLength: [8, "Price cannot exceed 8 digits"],
    min: 0,
  },
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  }
}
```

### Order Validation

```javascript
{
  orderStatus: {
    type: String,
    required: true,
    enum: {
      values: ["Processing", "Shipped", "Delivered"],
      message: "Please select correct order status",
    },
    default: "Processing",
  },
  paymentInfo: {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    }
  }
}
```

## Database Performance Optimization

### Indexing Strategy

Critical fields that are frequently queried are indexed:
- User email (unique index)
- Product category
- Product price
- Product name and description (text index)
- Order user reference
- Order status

### Query Optimization

1. **Pagination Implementation**:
   - API endpoints return paginated results
   - Controlled via `resultPerPage` parameter

2. **Projection to Reduce Data Transfer**:
   - Select only needed fields in queries
   - Example: `User.findById(id).select('name email')`

3. **Lean Queries**:
   - Use `.lean()` for read-only operations
   - Example: `Product.find().lean()`

### Data Aggregation

Product statistics aggregation example:
```javascript
// Calculate average rating and count of reviews
await Product.aggregate([
  { $match: { _id: productId } },
  { 
    $project: {
      averageRating: { $avg: "$reviews.rating" },
      reviewCount: { $size: "$reviews" }
    }
  }
]);
```

## Backup and Recovery

### MongoDB Atlas Backup Strategy

If using MongoDB Atlas:
1. **Continuous Backups**: Point-in-time recovery
2. **Scheduled Snapshots**: Daily backups with configurable retention
3. **On-Demand Backups**: Manual backup before critical changes

### Self-Hosted Backup Strategy

If self-hosting MongoDB:
1. **Automated Backups**:
   ```bash
   mongodump --uri="mongodb://username:password@host:port/ecommerceDB" --out=/backup/$(date +"%Y-%m-%d")
   ```

2. **Backup Rotation**:
   - Daily backups retained for 7 days
   - Weekly backups retained for 1 month
   - Monthly backups retained for 1 year