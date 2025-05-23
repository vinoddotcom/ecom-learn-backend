import { Request, Response, NextFunction } from "express";
import Product, { IProduct, IReview } from "../models/productModel";
import ErrorHandler from "../utils/errorhandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import ApiFeatures from "../utils/apifeatures";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary";
import { ObjectId, Types } from "mongoose";

// Create Product -- Admin
export const createProduct = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let images = [];

      if (typeof req.body.images === "string") {
        images.push(req.body.images);
      } else {
        images = req.body.images;
      }

      const imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
        const result = await uploadToCloudinary(images[i], "products");
        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      req.body.images = imagesLinks;
      req.body.user = req.user!.id;

      const product = await Product.create(req.body);

      res.status(201).json({
        success: true,
        product,
      });
    } catch (error) {
      return next(new ErrorHandler((error as Error).message, 500));
    }
  }
);

// Get All Products
export const getAllProducts = catchAsyncErrors(async (req: Request, res: Response) => {
  const resultPerPage = Number(req.query.limit) || 8;
  const productsCount = await Product.countDocuments();

  // Convert req.query to the correct type
  const apiFeature = new ApiFeatures<IProduct>(Product.find(), req.query).search().filter();

  // Clone the query to get the count without pagination
  const filteredProductsCount = (await apiFeature.query.clone()).length;

  // Apply pagination to the original query
  apiFeature.pagination(resultPerPage);

  // Execute the paginated query only once
  const products = await apiFeature.query;

  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
    filteredProductsCount,
  });
});

// Get All Products (Admin)
export const getAdminProducts = catchAsyncErrors(async (_req: Request, res: Response) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

// Get Product Details
export const getProductDetails = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      product,
    });
  }
);

// Update Product -- Admin
export const updateProduct = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      // Images Start Here
      let images = [];

      if (typeof req.body.images === "string") {
        images.push(req.body.images);
      } else if (req.body.images) {
        images = req.body.images;
      }

      if (images !== undefined && images.length > 0) {
        // Deleting Images From Cloudinary
        for (let i = 0; i < product.images.length; i++) {
          await deleteFromCloudinary(product.images[i].public_id);
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
          const result = await uploadToCloudinary(images[i], "products");
          imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }

        req.body.images = imagesLinks;
      }

      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });

      res.status(200).json({
        success: true,
        product: updatedProduct,
      });
    } catch (error) {
      return next(new ErrorHandler((error as Error).message, 500));
    }
  }
);

// Delete Product
export const deleteProduct = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      // Deleting Images From Cloudinary
      for (let i = 0; i < product.images.length; i++) {
        await deleteFromCloudinary(product.images[i].public_id);
      }

      await product.deleteOne();

      res.status(200).json({
        success: true,
        message: "Product Deleted Successfully",
      });
    } catch (error) {
      return next(new ErrorHandler((error as Error).message, 500));
    }
  }
);

// Create New Review or Update the review
export const createProductReview = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rating, comment, productId } = req.body;

    const review = {
      user: req.user!._id as Types.ObjectId,
      name: req.user!.name,
      rating: Number(rating),
      comment,
    };

    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const isReviewed = product.reviews.find(
      rev => rev.user.toString() === (req.user!._id as ObjectId).toString()
    );

    if (isReviewed) {
      product.reviews.forEach(rev => {
        if (rev.user.toString() === (req.user!._id as ObjectId).toString()) {
          rev.rating = rating;
          rev.comment = comment;
        }
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach(rev => {
      avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  }
);

// Get All Reviews of a product
export const getProductReviews = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  }
);

// Delete Review
export const deleteReview = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.query.productId?.toString();
    const reviewId = req.query.id?.toString();

    if (!productId || !reviewId) {
      return next(new ErrorHandler("Product ID and Review ID are required", 400));
    }

    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Define interface extending IReview with _id field
    interface ReviewWithId extends IReview {
      _id: Types.ObjectId;
    }

    const reviews = product.reviews.filter(rev => {
      // Use proper typing instead of any
      const review = rev as ReviewWithId;
      return review._id.toString() !== reviewId;
    });

    let avg = 0;

    reviews.forEach(rev => {
      avg += rev.rating;
    });

    let ratings = 0;

    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
      productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
    });
  }
);
