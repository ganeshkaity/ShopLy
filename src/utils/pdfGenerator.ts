import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order, AppSettings } from "@/types";

export async function generateInvoice(order: Order, appName: string = "ShopLy"): Promise<jsPDF> {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text(appName, 14, 20);
    
    doc.setFontSize(14);
    doc.text("INVOICE", 140, 20);
    
    // Order Details
    doc.setFontSize(10);
    doc.text(`Order ID: ${order.id}`, 14, 30);
    doc.text(`Date: ${formatDate(order.createdAt)}`, 14, 35);
    doc.text(`Status: ${order.status}`, 14, 40);

    // Billed To
    doc.setFontSize(11);
    doc.text("Billed To:", 14, 55);
    doc.setFontSize(10);
    doc.text(order.shippingAddress.fullName, 14, 60);
    doc.text(order.shippingAddress.addressLine1, 14, 65);
    if (order.shippingAddress.addressLine2) {
        doc.text(order.shippingAddress.addressLine2, 14, 70);
    }
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}`, 14, 75);
    doc.text(`Phone: ${order.shippingAddress.phone}`, 14, 80);

    // Items Table
    const tableColumn = ["Item", "Qty", "Price", "Total"];
    const tableRows = order.items.map((item: any) => [
        item.name,
        item.quantity.toString(),
        formatCurrency(item.price),
        formatCurrency(item.price * item.quantity)
    ]);

    autoTable(doc, {
        startY: 90,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [244, 114, 182] },
    });

    // Summary
    const finalY = (doc as any).lastAutoTable?.finalY || 90;
    doc.text(`Subtotal: ${formatCurrency(order.totalAmount - (order.shippingCharge || 0))}`, 140, finalY + 10);
    doc.text(`Shipping: ${formatCurrency(order.shippingCharge || 0)}`, 140, finalY + 15);
    doc.setFontSize(12);
    doc.text(`Total: ${formatCurrency(order.totalAmount)}`, 140, finalY + 25);

    return doc;
}

export async function generateShippingSlip(order: Order, appName: string = "ShopLy", settings?: AppSettings | null): Promise<jsPDF> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 12;

    let y = margin;

    // ── Helper: draw bordered section box ──
    const drawBox = (title: string, startY: number, height: number) => {
        doc.setDrawColor(0);
        doc.setLineWidth(0.4);
        doc.rect(margin, startY, pageWidth - margin * 2, height);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin + 2, startY + 4);
        doc.setFont("helvetica", "normal");
    };

    // ── HEADER BOX ──
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(appName, margin + 2, y + 8);
    doc.setFontSize(11);
    doc.text("SHIPPING SLIP", pageWidth - margin - 2, y + 8, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Order ID: ${order.id}`, margin + 2, y + 14);
    doc.text(`Date: ${formatDate(order.createdAt)}`, margin + 2, y + 19);
    doc.text(`Status: ${order.status}`, margin + 2, y + 24);
    // Header border
    doc.setDrawColor(0);
    doc.setLineWidth(0.6);
    doc.rect(margin, y, pageWidth - margin * 2, 30);
    y += 34;

    // ── SHIP TO BOX ──
    drawBox("SHIP TO:", y, 35);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(order.shippingAddress.fullName, margin + 2, y + 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(order.shippingAddress.addressLine1, margin + 2, y + 16);
    if (order.shippingAddress.addressLine2) {
        doc.text(order.shippingAddress.addressLine2, margin + 2, y + 21);
    }
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, margin + 2, y + 26);
    doc.text(`Phone: ${order.shippingAddress.phone}`, margin + 2, y + 31);
    y += 39;

    // ── ITEMS TABLE (No Prices) ──
    const tableColumn = ["#", "Item Description", "Qty"];
    const tableRows = order.items.map((item: any, i: number) => [
        i + 1,
        item.name,
        item.quantity.toString()
    ]);

    autoTable(doc, {
        startY: y,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 9, lineColor: [0, 0, 0], lineWidth: 0.3 },
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold' },
        columnStyles: {
            0: { halign: 'center', cellWidth: 12 },
            1: { halign: 'left' },
            2: { halign: 'center', cellWidth: 16 },
        },
        margin: { left: margin, right: margin },
    });

    const finalY: number = (doc as any).lastAutoTable?.finalY || y + 30;
    y = finalY + 6;

    // ── QR CODE + RETURN ADDRESS row ──
    const rowHeight = 50;
    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    // Left half: QR code
    const halfW = (pageWidth - margin * 2) / 2;
    doc.rect(margin, y, halfW, rowHeight);
    // Right half: Return address
    doc.rect(margin + halfW, y, halfW, rowHeight);

    // QR Code
    try {
        const trackingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/orders/${order.id}`;
        const qrDataUrl = await QRCode.toDataURL(trackingUrl, { margin: 1, width: 80 });
        doc.addImage(qrDataUrl, 'PNG', margin + 2, y + 2, 28, 28);
        doc.setFontSize(7);
        doc.text("Scan to track", margin + 5, y + 34);
    } catch (err) {
        console.error("Failed to generate QR", err);
    }

    // Return address
    const retX = margin + halfW + 2;
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("IF NOT DELIVERED, RETURN TO:", retX, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const shopName = settings?.appName || appName;
    const shopAddress = settings?.address || "";
    const shopPhone = settings?.supportPhone || "";
    doc.text(shopName, retX, y + 12);
    if (shopAddress) {
        const addrLines = doc.splitTextToSize(shopAddress, halfW - 6);
        doc.text(addrLines, retX, y + 18);
    }
    if (shopPhone) {
        doc.text(`Ph: ${shopPhone}`, retX, y + 38);
    }

    // Footer line
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text("This is a computer-generated shipping slip.", pageWidth / 2, y + rowHeight + 8, { align: "center" });

    return doc;
}
