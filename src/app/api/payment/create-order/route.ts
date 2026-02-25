import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

function getRazorpay() {
    if (!razorpayInstance) {
        const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            throw new Error("Razorpay API keys are missing in environment variables. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
        }

        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    }
    return razorpayInstance;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log("Create Order Body:", body);
        const { amount, currency = "INR", receipt, notes } = body;

        if (!amount || amount <= 0) {
            console.error("Invalid amount received:", amount);
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects paise
            currency,
            receipt: receipt || `rcpt_${Date.now()}`,
            notes: notes || {},
        };

        const order = await getRazorpay().orders.create(options);

        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error: any) {
        console.error("Razorpay order creation failed:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create order" },
            { status: 500 }
        );
    }
}
