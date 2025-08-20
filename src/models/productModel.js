// import mongoose from "mongoose";

// const nutritionSchema = new mongoose.Schema({
//   calories: { type: Number, required: true }, // kcal per 100g
//   protein: { type: Number },
//   carbohydrates: { type: Number },
//   fiber: { type: Number },
//   sugar: { type: Number },
//   fat: { type: Number }
// }, { _id: false });

// const vitaminSchema = new mongoose.Schema({
//   vitamin_C: { type: String }, // e.g., "4.6 mg"
//   vitamin_A: { type: String },
//   vitamin_K: { type: String },
//   folate: { type: String }
// }, { _id: false });

// const mineralSchema = new mongoose.Schema({
//   calcium: { type: String },
//   iron: { type: String },
//   potassium: { type: String },
//   magnesium: { type: String }
// }, { _id: false });

// const pricingSchema = new mongoose.Schema({
//   basePrice: { type: Number, required: true },
//   currency: { type: String, default: "INR" },
//   discountedPrice: { type: Number },
//   bulkPricing: [{
//     minQuantity: { type: Number, required: true },
//     price: { type: Number, required: true }
//   }],
//   gstPercentage: { type: Number, default: 5 }
// }, { _id: false });

// const productSchema = new mongoose.Schema({
//   sellerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Seller",
//     required: true,
//     index: true
//   },
//   sku: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   category: {
//     type: String,
//     required: true,
//     enum: ["Fruit", "Vegetable", "Herb", "Organic", "Exotic"],
//     index: true
//   },
//   variety: {
//     type: String,
//     required: true
//   },

//   nutrition: nutritionSchema,     // Embedded nutrition object
//   vitamins: vitaminSchema,        // Embedded vitamins object
//   minerals: mineralSchema,        // Embedded minerals object
//   pricing: pricingSchema,         // Embedded pricing object

//   imageUrl: { type: String },     // Store Cloudinary image URL

//   itemQuantity: {
//     type: Number,
//     required: true,
//     min: 0,
//     default: 0
//   }

// }, {
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Auto-generate SKU if missing
// productSchema.pre("save", function(next) {
//   if (!this.sku) {
//     const sellerPrefix = this.sellerId.toString().slice(-4).toUpperCase();
//     const categoryPrefix = this.category.substring(0, 3).toUpperCase();
//     const varietyCode = this.variety.substring(0, 3).toUpperCase();
//     this.sku = `${sellerPrefix}-${categoryPrefix}-${varietyCode}-${Date.now().toString().slice(-4)}`;
//   }
//   next();
// });

// // Virtual for seller details
// productSchema.virtual('seller', {
//   ref: 'Seller',
//   localField: 'sellerId',
//   foreignField: '_id',
//   justOne: true
// });

// // Indexes
// productSchema.index({ category: 1, variety: 1 });
// productSchema.index({ "pricing.discountedPrice": 1 });

// const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

// export default Product;

import mongoose from "mongoose";

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, required: true }, // kcal per 100g
  protein: { type: Number },
  carbohydrates: { type: Number },
  fiber: { type: Number },
  sugar: { type: Number },
  fat: { type: Number }
}, { _id: false });

const vitaminSchema = new mongoose.Schema({
  vitamin_C: { type: String }, // e.g., "4.6 mg"
  vitamin_A: { type: String },
  vitamin_K: { type: String },
  folate: { type: String }
}, { _id: false });

const mineralSchema = new mongoose.Schema({
  calcium: { type: String },
  iron: { type: String },
  potassium: { type: String },
  magnesium: { type: String }
}, { _id: false });

const pricingSchema = new mongoose.Schema({
  basePrice: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  discountedPrice: { type: Number },
  bulkPricing: [{
    minQuantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  gstPercentage: { type: Number, default: 5 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
    index: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ["Fruit", "Vegetable", "Herb", "Organic", "Exotic"],
    index: true
  },
  variety: {
    type: String,
    required: true
  },

  nutrition: nutritionSchema,
  vitamins: vitaminSchema,
  minerals: mineralSchema,
  pricing: pricingSchema,

  imageUrl: { type: String },

  itemQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  // ✅ NEW: Fields for expiry and clearance management
  expiryDate: {
    type: Date,
    required: true, // Crucial for tracking shelf life
  },
  
  placement: {
    type: String,
    enum: ["main", "side"], // For a "side window" or main display
    default: "main",
  },

  isClearance: {
    type: Boolean,
    default: false, // Flag to indicate if product is on clearance
  },

  clearanceDiscountPercent: {
    type: Number,
    default: 40, // The 40% discount
    min: 0,
    max: 100,
  },
  
  clearanceThresholdDays: {
    type: Number,
    default: 3, // Days before expiry to trigger clearance
    min: 0,
  },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-generate SKU if missing
productSchema.pre("save", function(next) {
  if (!this.sku) {
    const sellerPrefix = this.sellerId.toString().slice(-4).toUpperCase();
    const categoryPrefix = this.category.substring(0, 3).toUpperCase();
    const varietyCode = this.variety.substring(0, 3).toUpperCase();
    this.sku = `${sellerPrefix}-${categoryPrefix}-${varietyCode}-${Date.now().toString().slice(-4)}`;
  }
  next();
});

// Virtual for seller details
productSchema.virtual('seller', {
  ref: 'Seller',
  localField: 'sellerId',
  foreignField: '_id',
  justOne: true
});

// ✅ NEW: Virtual property to get the current price, applying clearance discount if active
productSchema.virtual("currentPrice").get(function () {
  const base = this.pricing?.discountedPrice ?? this.pricing?.basePrice ?? 0;
  if (this.isClearance) {
    // Apply the clearance discount and round to nearest integer
    return Math.round((base * (100 - this.clearanceDiscountPercent)) / 100);
  }
  return base;
});


// Indexes
productSchema.index({ category: 1, variety: 1 });
productSchema.index({ "pricing.discountedPrice": 1 });
productSchema.index({ expiryDate: 1, isClearance: 1 }); // ✅ NEW: Index for the automation job

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;