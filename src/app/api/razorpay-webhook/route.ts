import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getOrderByRazorpayId, updateOrderPaymentInfo } from "@/services/order.service";
import { OrderStatus } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-razorpay-signature");
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error("RAZORPAY_WEBHOOK_SECRET is not defined");
            return NextResponse.json({ error: "Configuration error" }, { status: 500 });
        }

        if (!signature) {
            return NextResponse.json({ error: "No signature" }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(rawBody)
            .digest("hex");

        if (signature !== expectedSignature) {
            console.warn("Invalid Razorpay webhook signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(rawBody);
        const { event: eventName, payload } = event;

        console.log(`Razorpay Webhook: Received ${eventName}`);

        // Handle events
        switch (eventName) {
            case "payment.captured":
            case "order.paid": {
                const razorpayOrderId = payload.order ? payload.order.entity.id : payload.payment.entity.order_id;
                const order = await getOrderByRazorpayId(razorpayOrderId);

                if (order && order.status !== "CONFIRMED" && order.status !== "Shipped" && order.status !== "Delivered") {
                    await updateOrderPaymentInfo(order.id!, {
                        status: "CONFIRMED",
                        paymentId: payload.payment ? payload.payment.entity.id : order.paymentId,
                    });
                    console.log(`Order ${order.id} marked as CONFIRMED via webhook`);
                }
                break;
            }

            case "payment.failed": {
                const razorpayOrderId = payload.payment.entity.order_id;
                const order = await getOrderByRazorpayId(razorpayOrderId);

                if (order && order.status === "Order Placed") {
                    // Only mark as failed if it was just placed
                    // Note: If you have a 'PAYMENT_FAILED' status, use that.
                    // For now, let's keep it or just log it if status is not available.
                    console.log(`Payment failed for order ${order.id}`);
                }
                break;
            }

            case "refund.processed": {
                const razorpayOrderId = payload.payment.entity.order_id;
                const order = await getOrderByRazorpayId(razorpayOrderId);
                if (order) {
                    // Update status if you have a REFUNDED status
                    console.log(`Refund processed for order ${order.id}`);
                }
                break;
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error: any) {
        console.error("Webhook processing failed:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
