import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: false,
    unique: true,
    trim: true
  },
  businessAddress: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: "2dsphere"
    }
  },
  gstNumber: {
    type: String,
    required: true,
    uppercase: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Please enter a valid GST number"]
  },
  fssaiLicense: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalSales: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  // ✅ ADD THESE TWO FIELDS FOR PASSWORD RESET
  resetPasswordToken: String,
  resetPasswordTokenExpiry: Date,

  // --- ADD THESE TWO FIELDS --- added later
  verifyToken: String,
  verifyTokenExpiry: Date,
  // --- ADD THESE TWO FIELDS --- added later if not working then remove  these 2 fields
  paymentDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String
  },
  subscriptionPlan: {
    type: String,
    enum: ["basic", "pro", "enterprise"],
    default: "basic"
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

sellerSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'sellerId'
});

const Seller = mongoose.models.Seller || mongoose.model("Seller", sellerSchema);
export default Seller;
