// // app/api/warehouse/add/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import connect from '@/dbConfig/dbConfig';
// import Warehouse from '@/models/warehouseModel';

// connect();

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { name, pincodes } = body;

//     if (!name || !pincodes || !Array.isArray(pincodes) || pincodes.length !== 5) {
//       return NextResponse.json(
//         { error: "Name and exactly 5 pincodes are required." },
//         { status: 400 }
//       );
//     }

//     const existing = await Warehouse.findOne({ name });
//     if (existing) {
//       return NextResponse.json({ error: "Warehouse name already exists." }, { status: 400 });
//     }

//     const warehouse = new Warehouse({ name, pincodes });
//     await warehouse.save();

//     return NextResponse.json({
//       message: "Warehouse created successfully",
//       success: true,
//       warehouse,
//     });

//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message || "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
// import { NextRequest, NextResponse } from 'next/server';
// import connect from '@/dbConfig/dbConfig';
// import Warehouse from '@/models/warehouseModel';
// import bcryptjs from 'bcryptjs';

// connect();

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { name, pincodes, manager } = body;

//     if (!name || !pincodes || !Array.isArray(pincodes) || pincodes.length !== 5) {
//       return NextResponse.json(
//         { error: 'Name and exactly 5 pincodes are required.' },
//         { status: 400 }
//       );
//     }

//     if (!manager?.username || !manager?.email || !manager?.password) {
//       return NextResponse.json(
//         { error: 'Manager username, email, and password are required.' },
//         { status: 400 }
//       );
//     }

//     const existing = await Warehouse.findOne({ name });
//     if (existing) {
//       return NextResponse.json({ error: 'Warehouse name already exists.' }, { status: 400 });
//     }

//     // Check for duplicate manager email/username
//     const duplicateManager = await Warehouse.findOne({
//       $or: [
//         { 'manager.email': manager.email },
//         { 'manager.username': manager.username },
//       ],
//     });

//     if (duplicateManager) {
//       return NextResponse.json({ error: 'Manager email or username already exists.' }, { status: 400 });
//     }

//     const hashedPassword = await bcryptjs.hash(manager.password, 10);

//     const warehouse = new Warehouse({
//       name,
//       pincodes,
//       manager: {
//         username: manager.username,
//         email: manager.email,
//         password: hashedPassword,
//       },
//     });

//     await warehouse.save();

//     return NextResponse.json({
//       message: 'Warehouse created successfully',
//       success: true,
//       warehouse,
//     });

//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message || 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import connect from '@/dbConfig/dbConfig';
import Warehouse from '@/models/warehouseModel';
import bcryptjs from 'bcryptjs';

connect();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ✅ Changed destructuring to match new payload
    const { name, address, serviceablePincodes, manager } = body;

    // ✅ Changed validation logic for new fields
    if (!name || !address?.street || !address?.city || !address?.state || !address?.pincode) {
      return NextResponse.json({ error: 'Warehouse name and full address are required.' }, { status: 400 });
    }

    if (!serviceablePincodes || !Array.isArray(serviceablePincodes) || serviceablePincodes.length === 0) {
      return NextResponse.json({ error: 'At least one serviceable pincode is required.' }, { status: 400 });
    }

    if (!manager?.fullName || !manager?.username || !manager?.email || !manager?.password || !manager?.contactNumber) {
      return NextResponse.json({ error: 'Manager full name, username, email, password, and contact number are required.' }, { status: 400 });
    }

    // Check for duplicate warehouse name
    const existingWarehouse = await Warehouse.findOne({ name });
    if (existingWarehouse) {
      return NextResponse.json({ error: 'Warehouse name already exists.' }, { status: 400 });
    }

    // Check for duplicate manager email/username across all warehouses
    const duplicateManager = await Warehouse.findOne({
      $or: [
        { 'manager.email': manager.email },
        { 'manager.username': manager.username },
      ],
    });
    if (duplicateManager) {
      return NextResponse.json({ error: 'Manager email or username is already assigned to another warehouse.' }, { status: 400 });
    }

    // Hash the manager's password
    const hashedPassword = await bcryptjs.hash(manager.password, 10);

    // ✅ Changed document creation to match the refined schema
    const newWarehouse = new Warehouse({
      name,
      address,
      serviceablePincodes,
      manager: {
        fullName: manager.fullName,
        username: manager.username,
        email: manager.email,
        password: hashedPassword,
        contactNumber: manager.contactNumber,
        // `role` and `isActive` will use default values from the schema
      },
    });

    await newWarehouse.save();

    // Avoid sending back the hashed password in the response
    const warehouseResponse = newWarehouse.toObject();
    delete warehouseResponse.manager.password;

    return NextResponse.json({
      message: 'Warehouse created successfully',
      success: true,
      warehouse: warehouseResponse,
    });

  } catch (error: any) {
    // Provide more specific error for validation issues
    if (error.name === 'ValidationError') {
       return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}