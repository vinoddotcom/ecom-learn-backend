import mongoose from "mongoose";
import { IUser } from "./userModel";
import { IProduct } from "./productModel";

// Define interfaces for better type safety
interface IOrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
  product: mongoose.Types.ObjectId | IProduct;
}

interface IShippingInfo {
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: number;
  phoneNo: number;
}

interface IPaymentInfo {
  id: string;
  status: string;
}

export interface IOrder extends mongoose.Document {
  shippingInfo: IShippingInfo;
  orderItems: IOrderItem[];
  user: mongoose.Types.ObjectId | IUser;
  paymentInfo: IPaymentInfo;
  paidAt: Date;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: string;
  deliveredAt?: Date;
  createdAt: Date;
}

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },
    pinCode: {
      type: Number,
      required: true,
    },
    phoneNo: {
      type: Number,
      required: true,
    },
  },
  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  paymentInfo: {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  paidAt: {
    type: Date,
    required: true,
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "Processing",
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
