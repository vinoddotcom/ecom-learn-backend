import { Request, Response, NextFunction } from "express";
import Product, { IProduct, IReview } from "../models/productModel";
import ErrorHandler from "../utils/errorhandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import ApiFeatures from "../utils/apifeatures";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary";
import { ObjectId, Types } from "mongoose";
import { UploadedFile } from "express-fileupload";

// Create Product -- Admin
export const createProduct = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Process uploaded images if any
      const imagesLinks = [];
      
      if (req.files) {
        // Check if images field exists and process uploaded files
        if (req.files.images) {
          const imageFiles = Array.isArray(req.files.images) 
            ? req.files.images as UploadedFile[]
            : [req.files.images as UploadedFile];
          
          for (const file of imageFiles) {
            // Use file buffer directly instead of converting to base64
            const result = await uploadToCloudinary(file.data, "products");
            imagesLinks.push({
              public_id: result.public_id,
              url: result.secure_url,
            });
          }
        }
      }

      // Create product with form data and image links
      const productData = {
        name: req.body.name,
        price: Number(req.body.price),
        description: req.body.description,
        category: req.body.category,
        Stock: Number(req.body.stock),
        user: req.user!.id,
        images: imagesLinks.length > 0 ? imagesLinks : undefined
      };

      const product = await Product.create(productData);

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

      // Process uploaded images
      let imagesLinks = [];
      
      // Keep existing images if no new ones are provided
      if (!req.files || (req.files && !req.files.images)) {
        // No new images, keep existing ones
        imagesLinks = product.images;
      } else {
        // New images are being uploaded, delete old ones
        for (let i = 0; i < product.images.length; i++) {
          await deleteFromCloudinary(product.images[i].public_id);
        }
        
        // Process new images
        if (req.files && req.files.images) {
          const imageFiles = Array.isArray(req.files.images) 
            ? req.files.images as UploadedFile[]
            : [req.files.images as UploadedFile];
            
          for (const file of imageFiles) {
            // Use file buffer directly instead of converting to base64
            const result = await uploadToCloudinary(file.data, "products");
            imagesLinks.push({
              public_id: result.public_id,
              url: result.secure_url,
            });
          }
        }
      }

      // Prepare update data from form fields
      const updateData = {
        name: req.body.name,
        price: req.body.price ? Number(req.body.price) : undefined,
        description: req.body.description,
        category: req.body.category,
        Stock: req.body.stock ? Number(req.body.stock) : undefined,
        images: imagesLinks
      };

      // Update only fields that are present in the request
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([, v]) => v !== undefined)
      );

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        filteredUpdateData,
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      );

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
