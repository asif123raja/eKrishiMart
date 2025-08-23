// import mongoose from "mongoose";

// // --- Nested Schemas for Product Data ---
// // These match the structure you defined in your route

// const nutritionSchema = new mongoose.Schema({
//   calories: { type: Number, required: true },
//   protein: { type: Number },
//   carbohydrates: { type: Number },
//   fiber: { type: Number },
//   sugar: { type: Number },
//   fat: { type: Number }
// }, { _id: false });

// const vitaminSchema = new mongoose.Schema({
//   vitamin_C: { type: String },
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


// // --- Main Pending Product Schema ---

// const pendingProductSchema = new mongoose.Schema({
//   // --- Workflow & Relational Fields ---
//   sellerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Seller',
//     required: true
//   },
//   warehouseId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Warehouse',
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected'],
//     default: 'pending',
//     index: true // Index for easy querying of pending items
//   },
//   reviewedBy: { // To track which manager reviewed it
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User' // Assuming you have a general User/Manager model
//   },
//   reviewedAt: Date,
//   rejectionReason: {
//     type: String,
//     trim: true
//   },

//   // --- ✅ NEW: Delivery & Payment Tracking ---
//   // deliveryCost: {
//   //   type: Number,
//   //   default: 0
//   // },
//   // deliveryPaymentMethod: {
//   //   type: String,
//   //   enum: ['online', 'cod', 'exempt'], // cod = Cash on Delivery
//   //   required: true
//   // },
//   // deliveryPaymentStatus: {
//   //   type: String,
//   //   enum: ['pending', 'paid', 'failed'],
//   //   default: 'pending'
//   // },
//   // deliveryTransactionId: { // To store the Razorpay payment ID
//   //   type: String
//   // },
//   // // --- END OF NEW FIELDS ---

//   // --- Product Data Fields (from your API route) ---
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
//     enum: ["Fruit", "Vegetable", "Herb", "Organic", "Exotic"]
//   },
//   variety: {
//     type: String,
//     required: true
//   },
//   itemQuantity: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   expiryDate: {
//     type: Date,
//     required: true
//   },
//   imageUrl: {
//     type: String,
//     required: true
//   },
  
//   // Embedded objects for detailed information
//   nutrition: nutritionSchema,
//   vitamins: vitaminSchema,
//   minerals: mineralSchema,
//   pricing: pricingSchema,

// }, { timestamps: true }); // Adds createdAt and updatedAt automatically

// const PendingProduct = mongoose.models.PendingProduct || mongoose.model("PendingProduct", pendingProductSchema);

// export default PendingProduct;
import mongoose from "mongoose";

// --- Nested Schemas for Product Data ---
// (These remain unchanged)
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
        // ✅ ADDED 'awaiting-payment' status
        enum: ['awaiting-payment', 'pending', 'approved', 'rejected','paid'],
        default: 'pending',
        index: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    rejectionReason: {
        type: String,
        trim: true
    },

    // --- ✅ UPDATED: Delivery, Payment & Cleanup Fields ---
    deliveryCost: {
        type: Number,
        default: 0
    },
    deliveryPaymentMethod: {
        type: String,
        enum: ['online', 'cod', 'exempt'], // cod = Cash on Delivery
        required: true
    },
    deliveryPaymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    deliveryTransactionId: { // To store the Razorpay payment ID
        type: String
    },
    paymentOrderId: { // To link the product to the Razorpay order
        type: String,
        index: true // Index for fast lookups by the webhook
    },
    expiresAt: { // For automatic deletion of abandoned online payment attempts
        type: Date,
        // This tells MongoDB to automatically delete the document 1 hour after the time specified
        index: { expires: '1h' }
    },
    // --- END OF UPDATED FIELDS ---

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

}, { timestamps: true });

const PendingProduct = mongoose.models.PendingProduct || mongoose.model("PendingProduct", pendingProductSchema);

export default PendingProduct;