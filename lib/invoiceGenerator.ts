import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  orderId: number;
  customerName: string;
  mobile: string;
  date: string;
  items: InvoiceItem[];
  total: number;
  advance: number;
}

export const generateInvoice = (data: InvoiceData) => {
  const doc = new jsPDF();

  // 1. Header
  doc.setFontSize(22);
  doc.setTextColor(41, 128, 185); // Blue Color
  doc.text("TAILOR MASTER AI", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Premium Custom Tailoring | Hussainy Colony, Mumbai", 14, 26);
  doc.text("Phone: +91 9763878266", 14, 31);

  // 2. Bill To Section
  doc.setDrawColor(200);
  doc.line(14, 35, 196, 35);
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Bill To:", 14, 45);
  doc.setFont("helvetica", "bold");
  doc.text(data.customerName, 14, 52);
  doc.setFont("helvetica", "normal");
  doc.text(`Mobile: ${data.mobile}`, 14, 58);

  // 3. Invoice Details (Right Side)
  doc.text("INVOICE / BILL", 140, 45);
  doc.text(`Order No: #${data.orderId}`, 140, 52);
  doc.text(`Date: ${new Date(data.date).toLocaleDateString()}`, 140, 58);

  // 4. Table with Auto-Wrap for Long Descriptions
  const tableColumn = ["Description", "Qty", "Price (INR)", "Total"];
  const tableRows: any[] = [];

  data.items.forEach(item => {
    const itemData = [
      item.description, // <--- This will now contain "Kurta - Blue Silk..."
      item.quantity.toString(),
      item.price.toFixed(2),
      item.price.toFixed(2),
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    startY: 65,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 90 }, // Wider column for Description
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' }
    }
  });

  // 5. Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.text(`Subtotal:`, 140, finalY);
  doc.text(`${data.total.toFixed(2)}`, 185, finalY, { align: 'right' });

  doc.text(`Advance Paid:`, 140, finalY + 6);
  doc.setTextColor(46, 204, 113); // Green
  doc.text(`- ${data.advance.toFixed(2)}`, 185, finalY + 6, { align: 'right' });

  doc.setTextColor(0); // Black
  doc.setFont("helvetica", "bold");
  doc.text(`Balance Due:`, 140, finalY + 14);
  doc.text(`${(data.total - data.advance).toFixed(2)}`, 185, finalY + 14, { align: 'right' });

  // 6. Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Terms & Conditions:", 14, finalY + 30);
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("1. No refund after cloth cutting.", 14, finalY + 35);
  doc.text("2. Please collect delivery within 30 days.", 14, finalY + 39);
  
  doc.save(`Invoice_TM-${data.orderId}.pdf`);
};

// ... (Your existing generateInvoice code is above) ...

export const generateMeasurementSheet = (data: any) => {
  const doc = new jsPDF();

  // 1. Header: "MASTER CUTTING SHEET"
  doc.setFontSize(22);
  doc.setTextColor(220, 53, 69); // Red Color for Attention
  doc.setFont("helvetica", "bold");
  doc.text("MASTER CUTTING SHEET", 105, 20, { align: "center" });
  
  // 2. Order Details
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Order #: ${data.orderId}`, 14, 35);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 35);
  
  doc.setFontSize(16);
  doc.text(`Customer: ${data.customerName}`, 14, 45);
  
  // 3. Garment & Fabric (The most important part for cutting)
  doc.setDrawColor(0);
  doc.setFillColor(240, 240, 240);
  doc.rect(14, 52, 182, 25, "F"); // Gray background box
  
  doc.setFontSize(14);
  doc.text("Garment:", 20, 62);
  doc.setFontSize(18);
  doc.text(data.garmentType || "Not Specified", 60, 62);
  
  doc.setFontSize(14);
  doc.text("Fabric:", 20, 72);
  doc.setFontSize(16);
  doc.text(data.fabricDetails || "Standard", 60, 72);

  // 4. Measurements Grid (Big Numbers)
  let yPos = 90;
  let xPos = 14;
  const boxWidth = 40;
  const boxHeight = 25;
  
  doc.setFontSize(14);
  doc.text("Measurements (in inches):", 14, 85);

  const measurements = data.measurements || {};
  // Filter out empty measurements to save ink/space
  const validKeys = Object.keys(measurements).filter(k => measurements[k] && measurements[k] !== '0' && k !== 'notes');

  validKeys.forEach((key, index) => {
    // Label (Small)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(key.toUpperCase().replace('_', ' '), xPos + 2, yPos + 6);
    
    // Value (Big & Bold)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(measurements[key].toString(), xPos + 20, yPos + 18, { align: "center" });
    
    // Draw Box
    doc.rect(xPos, yPos, boxWidth, boxHeight);

    // Grid Logic (4 items per row)
    xPos += boxWidth + 5;
    if ((index + 1) % 4 === 0) {
      xPos = 14;
      yPos += boxHeight + 10;
    }
  });

  // 5. Notes Section (Very Important for "Low Waist" or "Tight Fit" instructions)
  if (measurements.notes) {
      yPos += boxHeight + 20;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Master Notes / Instructions:", 14, yPos);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(measurements.notes, 14, yPos + 10, { maxWidth: 180 });
  }

  // Save
  doc.save(`Cutting_Sheet_${data.customerName}.pdf`);
};