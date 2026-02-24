import { formatCurrency } from "@/lib/utils";

interface OrderEmailData {
    orderId: string;
    customerName: string;
    items: { name: string; quantity: number; price: number }[];
    totalAmount: number;
    shippingAddress: {
        addressLine1: string;
        city: string;
        state: string;
        pincode: string;
    };
}

export function generateOrderConfirmationHTML(data: OrderEmailData): string {
    const itemRows = data.items
        .map(
            (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `
        )
        .join("");

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 0; background-color: #f9fafb; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
      .header { background: linear-gradient(135deg, #f472b6, #fb7185); padding: 40px 30px; text-align: center; }
      .header h1 { color: #fff; margin: 0; font-size: 28px; }
      .header p { color: rgba(255,255,255,0.9); margin-top: 8px; }
      .content { padding: 30px; }
      .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #888; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Paper Petals</h1>
        <p>Order Confirmation</p>
      </div>
      <div class="content">
        <p>Hi <strong>${data.customerName}</strong>,</p>
        <p>Thank you for your order! We're preparing it with love. 🌸</p>

        <div style="background: #fff1f2; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">Order #${data.orderId.slice(-8).toUpperCase()}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #888;">Item</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase; color: #888;">Qty</th>
              <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; color: #888;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px; font-weight: bold;">Total</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; color: #f472b6;">${formatCurrency(data.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-weight: bold; font-size: 14px;">Shipping Address</p>
          <p style="margin: 0; font-size: 14px; color: #666;">
            ${data.shippingAddress.addressLine1}<br>
            ${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.pincode}
          </p>
        </div>

        <p style="margin-top: 20px;">We'll keep you updated on the status of your order. 💕</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Paper Petals. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

export function generateStatusUpdateHTML(orderId: string, customerName: string, newStatus: string): string {
    return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 0; background-color: #f9fafb;">
    <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #f472b6, #fb7185); padding: 40px 30px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">Paper Petals</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Order Update</p>
      </div>
      <div style="padding: 30px;">
        <p>Hi <strong>${customerName}</strong>,</p>
        <p>Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> has been updated to:</p>
        <div style="background: #fff1f2; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #f472b6;">${newStatus}</p>
        </div>
        <p>Thank you for shopping with us! 🌸</p>
      </div>
      <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #888;">
        <p>© ${new Date().getFullYear()} Paper Petals. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}
