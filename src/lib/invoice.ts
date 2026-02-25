import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { Order, AppSettings } from '@/types';
import { formatDate } from './utils';

// Helper to load an image from a URL and convert it to a Data URL
const loadImageAsDataURL = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('image')) {
            throw new Error(`URL did not return an image. Content-Type: ${contentType}`);
        }

        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    if (reader.result.startsWith('data:image/png')) {
                        resolve(reader.result);
                    } else {
                        reject(new Error('Loaded asset is not a valid PNG image.'));
                    }
                } else {
                    reject(new Error('FileReader result is not a string'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Failed to load image:', url, error);
        return '';
    }
};

/**
 * Format a number as INR currency, using "Rs." instead of "₹" 
 * because standard jsPDF fonts do not support the Unicode Rupee symbol.
 */
function formatCurrencyForPdf(amount: number): string {
    return `Rs. ${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}

// Basic function to convert number to words (Simplified for this use case)
function numberToWords(num: number): string {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    let numStr = num.toString().replace(/[\, ]/g, '');
    if (numStr != parseFloat(numStr).toString()) return 'not a number';
    let x = numStr.indexOf('.');
    if (x == -1) x = numStr.length;
    if (x > 15) return 'too big';
    let n = numStr.split('');
    let str = '';
    let sk = 0;
    for (let i = 0; i < x; i++) {
        if ((x - i) % 3 == 2) {
            if (n[i] == '1') {
                str += a[Number(n[i]) * 10 + Number(n[i + 1])] + ' ';
                i++;
                sk = 1;
            } else if (n[i] != '0') {
                str += b[Number(n[i])] + ' ';
                sk = 1;
            }
        } else if (n[i] != '0') {
            str += a[Number(n[i])] + ' ';
            if ((x - i) % 3 == 0) str += 'Hundred ';
            sk = 1;
        }
        if ((x - i) % 3 == 1) {
            if (sk) str += (x - i - 1) == 9 ? 'Billion ' : (x - i - 1) == 6 ? 'Million ' : (x - i - 1) == 3 ? 'Thousand ' : '';
            sk = 0;
        }
    }
    if (x != numStr.length) {
        let y = numStr.length;
        str += 'Point ';
        for (let i = x + 1; i < y; i++) str += a[Number(n[i])] + ' ';
    }
    return str.replace(/\s+/g, ' ').trim() + ' Only';
}

export const generateInvoice = async (order: Order, settings: AppSettings) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // --- Header ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Tax Invoice", pageWidth / 2, margin + 5, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("(ORIGINAL FOR RECIPIENT)", pageWidth / 2, margin + 11, { align: 'center' });
    doc.text("e-invoice", pageWidth - margin - 20, margin + 5);

    // --- QR Code ---
    // Generate QR Code with order basic info
    const qrData = JSON.stringify({
        id: order.id,
        date: order.createdAt,
        total: order.totalAmount,
    });

    try {
        const qrBase64 = await QRCode.toDataURL(qrData, { margin: 1, width: 100 });
        doc.addImage(qrBase64, 'PNG', pageWidth - margin - 25, margin + 10, 25, 25);
    } catch (err) {
        console.error("Failed to generate QR Code", err);
    }

    // --- Order Info (Top Left) ---
    doc.setFontSize(9);
    doc.text(`Order No. : ${order.id}`, margin, margin + 10);
    doc.text(`Date : ${formatDate(order.createdAt)}`, margin, margin + 15);
    doc.text(`Status : ${order.status}`, margin, margin + 20);

    // --- Separator Line ---
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 40, pageWidth - margin, margin + 40);

    // --- Seller and Buyer Details ---
    let startY = margin + 45;

    // Seller (Left)
    doc.setFont("helvetica", "bold");
    doc.text("Sold By:", margin, startY);
    doc.setFont("helvetica", "normal");
    doc.text(settings.appName, margin, startY + 5);
    const sellerAddressLines = doc.splitTextToSize(settings.address || "Address not provided", (pageWidth - margin * 2) / 2 - 10);
    doc.text(sellerAddressLines, margin, startY + 10);
    doc.text(`Phone: ${settings.supportPhone || ""}`, margin, startY + 10 + sellerAddressLines.length * 5);
    doc.text(`Email: ${settings.supportEmail || ""}`, margin, startY + 15 + sellerAddressLines.length * 5);

    // Buyer (Right)
    const rightColX = pageWidth / 2 + 5;
    doc.setFont("helvetica", "bold");
    doc.text("Billed To / Shipped To:", rightColX, startY);
    doc.setFont("helvetica", "normal");
    doc.text(order.shippingAddress.fullName, rightColX, startY + 5);
    const buyerAddressText = `${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? ', ' + order.shippingAddress.addressLine2 : ''}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`;
    const buyerAddressLines = doc.splitTextToSize(buyerAddressText, (pageWidth - margin * 2) / 2 - 10);
    doc.text(buyerAddressLines, rightColX, startY + 10);
    doc.text(`Phone: ${order.shippingAddress.phone}`, rightColX, startY + 10 + buyerAddressLines.length * 5);

    const maxDetailsHeight = Math.max(
        15 + sellerAddressLines.length * 5,
        10 + buyerAddressLines.length * 5
    );

    // --- Items Table ---
    startY += maxDetailsHeight + 10;

    const tableColumn = ["SI NO", "Description", "Quantity", "Rate", "Amount"];
    const tableRows = order.items.map((item, index) => [
        index + 1,
        item.name,
        item.quantity,
        formatCurrencyForPdf(item.price),
        formatCurrencyForPdf(item.price * item.quantity)
    ]);

    autoTable(doc, {
        startY: startY,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 9,
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            valign: 'middle',
        },
        headStyles: {
            fillColor: [240, 240, 240], // Light gray header
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 15 },
            1: { halign: 'left', cellWidth: 'auto' },
            2: { halign: 'center', cellWidth: 20 },
            3: { halign: 'right', cellWidth: 25 },
            4: { halign: 'right', cellWidth: 30 },
        },
        margin: { left: margin, right: margin }
    });

    // --- Totals ---
    // @ts-ignore - autoTable plugin adds this to the document
    let finalY = doc.lastAutoTable.finalY || startY + 20;

    // Subtotal and Shipping
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", pageWidth - margin - 55, finalY + 10);
    doc.text(formatCurrencyForPdf(order.subtotal || order.totalAmount - (order.shippingCharge || 0)), pageWidth - margin, finalY + 10, { align: 'right' });

    doc.text("Shipping:", pageWidth - margin - 55, finalY + 15);
    doc.text(order.shippingCharge ? formatCurrencyForPdf(order.shippingCharge) : "Free", pageWidth - margin, finalY + 15, { align: 'right' });

    // Grand Total Box
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240);
    doc.rect(pageWidth - margin - 60, finalY + 20, 60, 10, 'FD'); // Fill and Draw

    doc.setFont("helvetica", "bold");
    doc.text("Total:", pageWidth - margin - 55, finalY + 27);
    doc.text(formatCurrencyForPdf(order.totalAmount), pageWidth - margin - 5, finalY + 27, { align: 'right' });

    // Amount in words
    finalY += 40;
    doc.setFont("helvetica", "bold");
    doc.text("Amount Chargeable (in words):", margin, finalY);
    doc.setFont("helvetica", "normal");
    const amountInWords = `${settings.currency} ${numberToWords(order.totalAmount)}`;
    doc.text(amountInWords, margin, finalY + 6);

    // --- Footer & Signature ---
    // Draw a box at the bottom for declaration and signature
    const footerY = pageHeight - 60;
    doc.rect(margin, footerY, pageWidth - margin * 2, 40);

    // Left side: Declaration
    doc.setFont("helvetica", "bold");
    doc.text("Declaration", margin + 2, footerY + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const declarationText = "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.";
    const declLines = doc.splitTextToSize(declarationText, (pageWidth - margin * 2) / 2);
    doc.text(declLines, margin + 2, footerY + 10);

    // Right side: Signature
    doc.setFont("helvetica", "bold");
    doc.text(`For ${settings.appName}`, pageWidth - margin - 2, footerY + 5, { align: 'right' });

    // Load and add signature image
    try {
        const signBase64 = await loadImageAsDataURL('/sign.png');
        if (signBase64) {
            // Keep proportion, assuming roughly 4:1 width:height for a signature
            doc.addImage(signBase64, 'PNG', pageWidth - margin - 40, footerY + 10, 35, 15);
        }
    } catch (err) {
        console.error("Failed to load signature image", err);
    }

    doc.setFontSize(9);
    doc.text("Authorized Signatory", pageWidth - margin - 2, footerY + 35, { align: 'right' });

    // Center bottom text
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("This is a Computer Generated Invoice", pageWidth / 2, pageHeight - 10, { align: 'center' });

    // --- Save the PDF ---
    doc.save(`invoice-${order.id}.pdf`);
};
