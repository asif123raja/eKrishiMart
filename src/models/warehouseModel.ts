

// import mongoose from "mongoose";

// const managerSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
// });

// const warehouseSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     pincodes: [
//       {
//         type: String,
//         required: true,
//       },
//     ],
//     manager: {
//       type: managerSchema,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Warehouse = mongoose.models.Warehouse || mongoose.model("Warehouse", warehouseSchema);
// export default Warehouse;

import mongoose from "mongoose";

// A more detailed schema for the embedded Manager object
const managerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    // Note: This password should be hashed before being saved.
  },
  contactNumber: {
    type: String,
    required: true,
  },
  profilePictureUrl: {
    type: String, // URL to an image, e.g., from Cloudinary
  },
  role: {
    type: String,
    enum: ['manager', 'admin'],
    default: 'manager',
  },
  isActive: {
    type: Boolean,
    default: true, // Admin can deactivate a manager's account
  },
  lastLogin: {
    type: Date,
  },
}, { 
  _id: false // It's an embedded subdocument, so it doesn't need its own _id
});


const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  // Full address for the warehouse location
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true, index: true }, // The primary pincode
  },
  // The service area this warehouse covers
  serviceablePincodes: {
    type: [String],
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: true, // To mark if the warehouse is operational
  },
  // The embedded manager object with all the details
  manager: {
    type: managerSchema,
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

const Warehouse = mongoose.models.Warehouse || mongoose.model("Warehouse", warehouseSchema);

export default Warehouse;