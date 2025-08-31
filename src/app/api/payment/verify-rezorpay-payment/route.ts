import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import connect from '@/dbConfig/dbConfig';
import { getDataFromToken } from '@/helper/getDataFromToken';
import Buyer from '@/models/userModel';
import Order from '@/models/orderModel';
import Product from '@/models/productModel';
import Seller from '@/models/sellerModel';
import Warehouse from '@/models/warehouseModel';


const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET_ID!,
});

// Constants
const PLATFORM_FEE = 3;
const INVENTORY_FEE = 5;
const GST_RATE = 0.18;
const MINIMUM_ORDER_VALUE = 200;

// Helper to find warehouse by pincode
async function findWarehouseForPincode(pincode: string, session: mongoose.ClientSession) {
  return await Warehouse.findOne({
    serviceablePincodes: pincode,
    isOpen: true
  }).session(session);
}

// Calculate applicable price
const getPriceForQuantityOnServer = (item: any): number => {
  const { quantity, productId } = item;
  if (!productId || !productId.pricing) return 0;
  
  const { pricing } = productId;
  let applicablePrice = pricing.discountedPrice ?? pricing.basePrice;

  if (pricing.bulkPricing && Array.isArray(pricing.bulkPricing)) {
    const sortedTiers = [...pricing.bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
    for (const bulk of sortedTiers) {
      if (quantity >= bulk.minQuantity) {
        applicablePrice = bulk.price;
        break;
      }
    }
  }
  return applicablePrice;
};

// Calculate delivery charge
const calculateDeliveryCharge = (subtotal: number): number => {
  if (subtotal >= MINIMUM_ORDER_VALUE) {
    if (subtotal <= 400) return 40;
    if (subtotal <= 800) return 60;
    if (subtotal <= 1000) return 70;
    if (subtotal <= 5000) return 100;
    if (subtotal <= 20000) return 150;
    return 300;
  }
  return 0;
};

// export async function POST(request: NextRequest) {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // 1. Verify payment signature
//     const { razorpay_payment_id, razorpay_order_id, razorpay_signature, shippingAddress } = await request.json();
    
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_SECRET_ID!)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest('hex');

//     if (expectedSignature !== razorpay_signature) {
//       throw new Error('Invalid payment signature');
//     }

//     // 2. Get authenticated user
//     const tokenData = await getDataFromToken(request);
//     const buyerId = tokenData.id;
//     if (!buyerId) throw new Error('Unauthorized');

//     // 3. Fetch buyer with populated cart
//     const buyer = await Buyer.findById(buyerId)
//       .populate({
//         path: 'cart.productId',
//         model: Product,
//         select: '_id sellerId name sku pricing itemQuantity'
//       })
//       .session(session);

//     if (!buyer || !buyer.cart || buyer.cart.length === 0) {
//       throw new Error("Cart is empty");
//     }

//     // 4. Process each item with warehouse assignment
//     const productUpdates = [];
//     const orderProducts = [];
//     let subtotal = 0;

//     for (const cartItem of buyer.cart) {
//       if (!cartItem.productId) {
//         throw new Error("Product data incomplete");
//       }

//       // Get seller to find warehouse
//       const seller = await Seller.findById(cartItem.productId.sellerId)
//         .select('businessAddress')
//         .session(session);
      
//       if (!seller) throw new Error("Seller not found");
      
//       // Find warehouse for seller's pincode
//       const warehouse = await findWarehouseForPincode(seller.businessAddress.pincode, session);
//       if (!warehouse) {
//         throw new Error(`No warehouse available for seller location (${seller.businessAddress.pincode})`);
//       }

//       // Validate stock
//       if (cartItem.quantity > cartItem.productId.itemQuantity) {
//         throw new Error(
//           `Only ${cartItem.productId.itemQuantity} units available for ${cartItem.productId.name}`
//         );
//       }

//       // Calculate price
//       const price = getPriceForQuantityOnServer(cartItem);
//       subtotal += price * cartItem.quantity;

//       // Prepare updates
//       productUpdates.push({
//         updateOne: {
//           filter: { _id: cartItem.productId._id },
//           update: { $inc: { itemQuantity: -cartItem.quantity } }
//         }
//       });

//       // Prepare order product
//       orderProducts.push({
//         productId: cartItem.productId._id,
//         sellerId: cartItem.productId.sellerId,
//         warehouseId: warehouse._id,
//         name: cartItem.productId.name,
//         sku: cartItem.productId.sku,
//         quantity: cartItem.quantity,
//         priceAtPurchase: price,
//         itemTotal: price * cartItem.quantity
//       });
//     }

//     // 5. Calculate totals
//     const deliveryCharge = calculateDeliveryCharge(subtotal);
//     const totalFees = PLATFORM_FEE + INVENTORY_FEE + deliveryCharge;
//     const gstOnFees = totalFees * GST_RATE;
//     const grandTotal = subtotal + totalFees + gstOnFees;

//     // 6. Verify payment amount matches
//     const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
//     if (Math.round(grandTotal * 100) !== razorpayOrder.amount) {
//       throw new Error("Payment amount doesn't match order total");
//     }

//     // 7. Create order
//     const newOrder = new Order({
//       buyerId,
//       products: orderProducts,
//       orderTotal: {
//         subtotal,
//         platformFee: PLATFORM_FEE,
//         inventoryFee: INVENTORY_FEE,
//         deliveryCharge,
//         gstOnFees,
//         grandTotal
//       },
//       shippingAddress,
//       paymentDetails: {
//         method: 'online',
//         status: 'completed',
//         paymentId: razorpay_payment_id,
//         razorpayOrderId: razorpay_order_id,
//         razorpaySignature: razorpay_signature
//       },
//       orderStatus: 'processing'
//     });

//     // 8. Execute all operations
//     await newOrder.save({ session });
//     await Product.bulkWrite(productUpdates, { session });
//     buyer.cart = [];
//     await buyer.save({ session });
//     await session.commitTransaction();

//     return NextResponse.json({
//       success: true,
//       orderId: newOrder._id.toString(),
//       grandTotal
//     });

//   } catch (error: any) {
//     await session.abortTransaction();
//     console.error('Payment verification failed:', error.message);
//     return NextResponse.json(
//       { error: error.message || 'Payment processing failed' },
//       { status: error.statusCode || 500 }
//     );
//   } finally {
//     session.endSession();
//   }
// }

// ... (previous imports remain the same)

export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connect();
    // 1. Verify payment signature
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, shippingAddress } = await request.json();
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_ID!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature');
    }

    // 2. Get authenticated user
    const tokenData = await getDataFromToken(request);
    if( !tokenData || !tokenData.id){
                  return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
                }
    const buyerId = tokenData.id;
    if (!buyerId) throw new Error('Unauthorized');

    // 3. Fetch buyer with populated cart
    const buyer = await Buyer.findById(buyerId)
      .populate({
        path: 'cart.productId',
        model: Product,
        select: '_id sellerId name sku pricing itemQuantity'
      })
      .session(session);

    if (!buyer || !buyer.cart || buyer.cart.length === 0) {
      throw new Error("Cart is empty");
    }

    // 4. Process each item with warehouse assignment
    const productUpdates = [];
    const orderProducts = [];
    let subtotal = 0;

    for (const cartItem of buyer.cart) {
      if (!cartItem.productId) {
        throw new Error("Product data incomplete");
      }

      // Get seller to find warehouse
      const seller = await Seller.findById(cartItem.productId.sellerId)
        .select('businessAddress')
        .session(session);
      
      if (!seller) throw new Error("Seller not found");
      
      // Find warehouse for seller's pincode
      const warehouse = await findWarehouseForPincode(seller.businessAddress.pincode, session);
      if (!warehouse) {
        throw new Error(`No warehouse available for seller location (${seller.businessAddress.pincode})`);
      }

      // Validate stock
      if (cartItem.quantity > cartItem.productId.itemQuantity) {
        throw new Error(
          `Only ${cartItem.productId.itemQuantity} units available for ${cartItem.productId.name}`
        );
      }

      // Calculate price
      const price = getPriceForQuantityOnServer(cartItem);
      subtotal += price * cartItem.quantity;

      // Prepare updates
      productUpdates.push({
        updateOne: {
          filter: { _id: cartItem.productId._id },
          update: { $inc: { itemQuantity: -cartItem.quantity } }
        }
      });

      // Prepare order product
      orderProducts.push({
        productId: cartItem.productId._id,
        sellerId: cartItem.productId.sellerId,
        warehouseId: warehouse._id,
        name: cartItem.productId.name,
        sku: cartItem.productId.sku,
        quantity: cartItem.quantity,
        priceAtPurchase: price,
        itemTotal: price * cartItem.quantity
      });
    }

    // 5. Calculate totals
    const deliveryCharge = calculateDeliveryCharge(subtotal);
    const totalFees = PLATFORM_FEE + INVENTORY_FEE + deliveryCharge;
    const gstOnFees = totalFees * GST_RATE;
    const grandTotal = subtotal + totalFees + gstOnFees;

    // 6. Verify payment amount matches
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    if (Math.round(grandTotal * 100) !== razorpayOrder.amount) {
      throw new Error("Payment amount doesn't match order total");
    }

    // 7. Generate delivery passcode (6-digit number)
    const deliveryPasscode = Math.floor(100000 + Math.random() * 900000).toString();

    // 8. Create order
    const newOrder = new Order({
      buyerId,
      products: orderProducts,
      orderTotal: {
        subtotal,
        platformFee: PLATFORM_FEE,
        inventoryFee: INVENTORY_FEE,
        deliveryCharge,
        gstOnFees,
        grandTotal
      },
      shippingAddress,
      deliveryPasscode, // Now included for online payments too
      paymentDetails: {
        method: 'Online Payment', // Using the exact enum value
        status: 'completed',
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature
      },
      orderStatus: 'processing'
    });

    // 9. Execute all operations
    await newOrder.save({ session });
    await Product.bulkWrite(productUpdates, { session });
    buyer.cart = [];
    await buyer.save({ session });
    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      orderId: newOrder._id.toString(),
      deliveryPasscode, // Return passcode to frontend
      grandTotal
    });

  } catch (error: unknown) {
    await session.abortTransaction();
    console.error('Payment verification failed:', error);

    // Check if the caught item is a standard Error object
    if (error instanceof Error) {
        // Check if it's a custom error with a status code
        const statusCode = (error as any).statusCode || 500;
        return NextResponse.json(
          { error: error.message || 'Payment processing failed' },
          { status: statusCode }
        );
    }

    // Fallback for cases where a non-Error was thrown
    return NextResponse.json(
        { error: 'An unknown payment processing error occurred' }, 
        { status: 500 }
    );
  } finally {
    session.endSession();
  }
}