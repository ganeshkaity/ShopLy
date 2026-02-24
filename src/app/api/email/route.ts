import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to, subject, html } = body;

        if (!to || !subject || !html) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await transporter.sendMail({
            from: `"Paper Petals" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            html,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Email send error:", error);
        return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
    }
}
