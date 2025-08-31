// Type guard for populated products
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connect from '@/dbConfig/dbConfig';
import Buyer from '@/models/userModel';
import Order from '@/models/orderModel';
import Product from '@/models/productModel';
import Seller from '@/models/sellerModel';
import Warehouse from '@/models/warehouseModel';
import { getDataFromToken } from '@/helper/getDataFromToken';

// Interfaces
interface ProductPricing {
  basePrice: number;
  discountedPrice?: number;
  bulkPricing?: Array<{
    minQuantity: number;
    price: number;
  }>;
}

interface CartProduct {
  _id: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  pricing: ProductPricing;
  itemQuantity: number;
}

interface CartItem {
  productId: mongoose.Types.ObjectId | CartProduct;
  quantity: number;
}

interface OrderTotal {
  subtotal: number;
  platformFee: number;
  inventoryFee: number;
  deliveryCharge: number;
  gstOnFees: number;
  grandTotal: number;
}

// Custom error class
class APIError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError';
  }
}

// Constants
const PLATFORM_FEE = 3;
const INVENTORY_FEE = 5;
const GST_RATE = 0.18;

connect();



// ... (keep your existing interfaces and constants)

// Enhanced type guard with more specific checks
function isPopulatedProduct(product: any): product is CartProduct {
  return product && 
         typeof product === 'object' && 
         '_id' in product && 
         'sellerId' in product && 
         'pricing' in product;
}

export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Authentication
    const tokenData = await getDataFromToken(request);
    if( !tokenData || !tokenData.id){
      return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
    }
    const buyerId = tokenData.id;
    if (!buyerId) throw new APIError("Unauthorized", 401);

    // 2. Parse and validate request body
    const { shippingAddress, paymentMethod = 'cod' } = await request.json();
    
    if (!shippingAddress?.addressLine1 || !shippingAddress?.city || 
        !shippingAddress?.state || !shippingAddress?.pincode) {
      throw new APIError("Complete shipping address is required", 400);
    }

    // 3. Fetch buyer with populated cart
    const buyer = await Buyer.findById(buyerId)
      .populate({
        path: 'cart.productId',
        model: 'Product',
        select: '_id sellerId name sku pricing itemQuantity'
      })
      .session(session);

    if (!buyer) throw new APIError("User not found", 404);
    if (!buyer.cart || buyer.cart.length === 0) throw new APIError("Cart is empty", 400);

    // 4. Process each cart item with warehouse assignment
    const productUpdates = [];
    const orderProducts = [];
    
    for (const cartItem of buyer.cart) {
      // Verify product data is properly populated
      if (!isPopulatedProduct(cartItem.productId)) {
        console.error('Invalid product data:', cartItem.productId);
        throw new APIError("Product data is incomplete", 400);
      }

      // Get seller details to find their pincode
      const seller = await Seller.findById(cartItem.productId.sellerId)
        .select('businessAddress')
        .session(session);
      
      if (!seller) throw new APIError("Seller not found", 404);
      
      // Find warehouse that serves seller's pincode
      const warehouse = await Warehouse.findOne({
        serviceablePincodes: seller.businessAddress.pincode,
        isOpen: true
      }).session(session);

      if (!warehouse) {
        throw new APIError(
          `No warehouse available for seller's location (${seller.businessAddress.pincode})`, 
          400
        );
      }
      
      // Validate stock
      if (cartItem.quantity > cartItem.productId.itemQuantity) {
        throw new APIError(
          `Only ${cartItem.productId.itemQuantity} units available for ${cartItem.productId.name}`,
          400
        );
      }
      
      // Prepare product update
      productUpdates.push({
        updateOne: {
          filter: { _id: cartItem.productId._id },
          update: { $inc: { itemQuantity: -cartItem.quantity } }
        }
      });
      
      // Prepare order product data
      orderProducts.push({
        productId: cartItem.productId._id,
        sellerId: cartItem.productId.sellerId,
        warehouseId: warehouse._id,
        name: cartItem.productId.name,
        sku: cartItem.productId.sku,
        quantity: cartItem.quantity,
        priceAtPurchase: cartItem.productId.pricing.discountedPrice ?? 
                       cartItem.productId.pricing.basePrice
      });
    }

    // 5. Calculate order totals
    const orderTotal = {
      subtotal: orderProducts.reduce((sum, p) => sum + (p.priceAtPurchase * p.quantity), 0),
      platformFee: PLATFORM_FEE,
      inventoryFee: INVENTORY_FEE,
      deliveryCharge: calculateDeliveryCharge(orderProducts),
      gstOnFees: (PLATFORM_FEE + INVENTORY_FEE) * GST_RATE,
      grandTotal: 0 // Will be calculated below
    };
    
    orderTotal.grandTotal = orderTotal.subtotal + 
                          orderTotal.platformFee + 
                          orderTotal.inventoryFee + 
                          orderTotal.deliveryCharge + 
                          orderTotal.gstOnFees;

    // 6. Create order document
    const newOrder = new Order({
      buyerId,
      products: orderProducts,
      orderTotal,
      shippingAddress: {
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode
      },
      deliveryPasscode: Math.floor(100000 + Math.random() * 900000).toString(),
      paymentDetails: {
        method: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
        status: 'pending'
      },
      orderStatus: 'pending'
    });

    // 7. Execute all operations in transaction
    await newOrder.save({ session });
    await Product.bulkWrite(productUpdates, { session });
    buyer.cart = [];
    await buyer.save({ session});
    
    await session.commitTransaction();
    
    return NextResponse.json({ 
      success: true, 
      message: "Order placed successfully",
      orderId: newOrder._id.toString(),
      deliveryPasscode: newOrder.deliveryPasscode
    });

  } catch (error: unknown) { // 1. Catch the error as 'unknown'
    await session.abortTransaction();
    console.error('Order creation failed:', error);

    // 2. Check for your custom APIError first
    if (error instanceof APIError) {
        return NextResponse.json(
          { 
            success: false,
            error: error.message,
            code: error.statusCode 
          },
          { status: error.statusCode }
        );
    }
    
    // 3. Handle any other standard JavaScript errors
    if (error instanceof Error) {
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Order processing failed'
            },
            { status: 500 }
        );
    }

    // 4. Fallback for non-Error exceptions
    return NextResponse.json(
        {
            success: false,
            error: 'An unknown error occurred during order processing'
        },
        { status: 500 }
    );

  } finally {
    session.endSession();
  }
}

// Helper function to calculate delivery charge
function calculateDeliveryCharge(products: any[]): number {
  const subtotal = products.reduce((sum, p) => sum + (p.priceAtPurchase * p.quantity), 0);
  
  if (subtotal >= 200) {
    if (subtotal <= 400) return 40;
    if (subtotal <= 800) return 60;
    if (subtotal <= 1000) return 70;
    if (subtotal <= 5000) return 100;
    if (subtotal <= 20000) return 150;
    return 300;
  }
  return 0;
}