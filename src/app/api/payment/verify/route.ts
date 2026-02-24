import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const isValid = generatedSignature === razorpay_signature;

        if (isValid) {
            return NextResponse.json({ verified: true });
        } else {
            return NextResponse.json({ verified: false, error: "Signature mismatch" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Payment verification failed:", error);
        return NextResponse.json(
            { verified: false, error: error.message || "Verification failed" },
            { status: 500 }
        );
    }
}
