import mongoose from "mongoose";

const orderProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: false
  },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true,
    index: true,
  },
  products: [orderProductSchema],
  orderTotal: {
    subtotal: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    inventoryFee: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    gstOnFees: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
  },
  shippingAddress: {
    type: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
    },
    required: true
  },
  deliveryPasscode: {
    type: String,
    required: true,
    select: false // Hidden from normal queries
  },
  paymentDetails: {
    paymentId: { type: String },
    method: { 
      type: String, 
      enum: ['Cash on Delivery', 'Online Payment', 'Online'], 
      default: 'Cash on Delivery' 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded'], 
      default: 'pending' 
    },
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'rejected'],
    default: 'pending',
    index: true,
  },
  managerNotes: {
    type: String,
    default: ''
  },
  deliveryAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryAgent'
  },
  trackingNumber: {
    type: String
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
orderSchema.index({ buyerId: 1, orderStatus: 1 });
orderSchema.index({ 'products.sellerId': 1, orderStatus: 1 });
orderSchema.index({ 'products.warehouseId': 1, orderStatus: 1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;