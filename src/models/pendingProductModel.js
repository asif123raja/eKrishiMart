import mongoose from "mongoose";

// --- Nested Schemas for Product Data ---
// These match the structure you defined in your route

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  protein: { type: Number },
  carbohydrates: { type: Number },
  fiber: { type: Number },
  sugar: { type: Number },
  fat: { type: Number }
}, { _id: false });

const vitaminSchema = new mongoose.Schema({
  vitamin_C: { type: String },
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


// --- Main Pending Product Schema ---

const pendingProductSchema = new mongoose.Schema({
  // --- Workflow & Relational Fields ---
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true // Index for easy querying of pending items
  },
  reviewedBy: { // To track which manager reviewed it
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming you have a general User/Manager model
  },
  reviewedAt: Date,
  rejectionReason: {
    type: String,
    trim: true
  },

  // --- Product Data Fields (from your API route) ---
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
    enum: ["Fruit", "Vegetable", "Herb", "Organic", "Exotic"]
  },
  variety: {
    type: String,
    required: true
  },
  itemQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  
  // Embedded objects for detailed information
  nutrition: nutritionSchema,
  vitamins: vitaminSchema,
  minerals: mineralSchema,
  pricing: pricingSchema,

}, { timestamps: true }); // Adds createdAt and updatedAt automatically

const PendingProduct = mongoose.models.PendingProduct || mongoose.model("PendingProduct", pendingProductSchema);

export default PendingProduct;