import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helper/getDataFromToken";
import Seller from "@/models/sellerModel";
import connect from "@/dbConfig/dbConfig"; // Make sure to import connect

const calculateDeliveryCost = (totalWeight: number) => {
    if (totalWeight > 500) return { cost: 2500, vehicle: "Truck" };
    if (totalWeight > 100) return { cost: 1200, vehicle: "Tempo" };
    return { cost: 500, vehicle: "Mini Truck" };
};

export async function POST(request: NextRequest) {
    try {
        await connect();
            console.log("✅ DB Connected"); // ✅ ADD THIS LINE to ensure a stable connection

        const tokenData = await getDataFromToken(request);
        if( !tokenData || !tokenData.id){
          return NextResponse.json({ error: "Unauthorized: Invalid token"}, { status: 401});
        }
        const buyerId = tokenData.id;
        const seller = await Seller.findById(buyerId);

        if (!seller) {
            return NextResponse.json({ error: "Seller not found" }, { status: 404 });
        }

        if (seller.subscriptionPlan === 'enterprise') {
            return NextResponse.json({ needsPayment: false });
        }

        const { totalWeightInKg } = await request.json();
        
        if (totalWeightInKg == null || totalWeightInKg <= 0) {
            return NextResponse.json({ error: "Valid item quantity (weight) is required" }, { status: 400 });
        }

        const { cost, vehicle } = calculateDeliveryCost(totalWeightInKg);

        return NextResponse.json({
            needsPayment: true,
            deliveryCost: cost,
            vehicleType: vehicle,
        });

    } catch (error: unknown) {
    // Check if the caught item is a standard Error object
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Fallback for cases where a non-Error was thrown
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
}
}