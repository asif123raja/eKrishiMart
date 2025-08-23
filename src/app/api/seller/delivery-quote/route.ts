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
        await connect(); // ✅ ADD THIS LINE to ensure a stable connection

        const { id } = getDataFromToken(request);
        const seller = await Seller.findById(id);

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

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}