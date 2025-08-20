import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const orderHistorySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    sku: String,
    quantity: Number,
    price: Number
  }],
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled", "returned"],
    default: "pending"
  },
  totalAmount: Number
});

const buyerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8
  },
  pincode: {
    type: String,
    required: [true, "Please provide a pincode"],
    validate: {
      validator: function(v) {
        return /^\d{6}$/.test(v); // Basic 6-digit pincode validation
      },
      message: props => `${props.value} is not a valid pincode!`
    }
  },
  cart: {
    type: [cartItemSchema],
    default: []
  },
  wishlist: {
    type: [wishlistItemSchema],
    default: []
  },
  orderHistory: {
    type: [orderHistorySchema],
    default: []
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  businessDetails: {
    name: String,
    gstNumber: String,
    businessType: String
  },
  shippingAddresses: [{
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: Boolean
  }],
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
  verifyToken: String,
  verifyTokenExpiry: Date,
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better performance
buyerSchema.index({ email: 1 });
buyerSchema.index({ pincode: 1 });
buyerSchema.index({ "orderHistory.orderId": 1 });

const Buyer = mongoose.models.Buyer || mongoose.model('Buyer', buyerSchema);

export default Buyer;