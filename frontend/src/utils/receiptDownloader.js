/**
 * =============================================================================
 * NovaMart Official Invoice & Payment Receipt Downloader
 * Generates and downloads a self-contained, print-ready digital tax invoice.
 * =============================================================================
 */

export const downloadReceiptHtml = (order) => {
  if (!order) return;

  const formattedDate = order.orderDate
    ? new Date(order.orderDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString();

  const subtotal = order.items
    ? order.items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0)
    : Number(order.totalAmount) || 0;

  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number(order.totalAmount) || (subtotal + tax);

  const itemsRows = order.items && order.items.length > 0
    ? order.items.map((item, idx) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 8px; font-family: monospace; color: #94a3b8;">${idx + 1}</td>
          <td style="padding: 12px 8px;">
            <div style="font-weight: 600; color: #0f172a;">${item.productName || 'Product'}</div>
            <div style="font-size: 11px; color: #64748b;">SKU: NM-PROD-${item.productId || '0' + (idx + 1)}</div>
          </td>
          <td style="padding: 12px 8px; text-align: center; color: #334155; font-weight: 600;">${item.quantity}</td>
          <td style="padding: 12px 8px; text-align: right; color: #475569;">$${Number(item.unitPrice).toFixed(2)}</td>
          <td style="padding: 12px 8px; text-align: right; color: #0f172a; font-weight: 700;">$${Number(item.subtotal).toFixed(2)}</td>
        </tr>
      `).join('')
    : `<tr><td colspan="5" style="padding: 16px; text-align: center; color: #64748b;">Standard Order Fulfillment</td></tr>`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NovaMart Receipt - ${order.orderNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      padding: 30px;
    }
    .receipt-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      padding: 40px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .brand {
      font-size: 26px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .brand span { color: #2563eb; }
    .badge-paid {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      background-color: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
    }
    .info-grid h4 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 13px;
    }
    th {
      border-bottom: 2px solid #cbd5e1;
      padding: 10px 8px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    .totals-box {
      width: 280px;
      font-size: 13px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      color: #64748b;
    }
    .totals-row.grand {
      border-top: 2px solid #0f172a;
      margin-top: 8px;
      padding-top: 10px;
      font-size: 17px;
      font-weight: 900;
      color: #0f172a;
    }
    .barcode {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
    }
    .barcode-lines {
      height: 32px;
      width: 180px;
      background: repeating-linear-gradient(90deg, #0f172a, #0f172a 2px, transparent 2px, transparent 4px, #0f172a 4px, #0f172a 7px, transparent 7px, transparent 9px);
    }
    .actions {
      margin-top: 24px;
      text-align: center;
    }
    .btn-print {
      background: #2563eb;
      color: #ffffff;
      padding: 10px 24px;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .receipt-card { border: none; box-shadow: none; padding: 20px; }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="header">
      <div>
        <div class="brand">Nova<span>Mart</span></div>
        <p style="font-size: 12px; color: #64748b; margin-top: 4px;">NovaMart Global Technologies Inc.</p>
        <p style="font-size: 11px; color: #94a3b8;">100 Innovation Boulevard, Tech District</p>
        <p style="font-size: 11px; color: #94a3b8;">GSTIN / Tax ID: NV992817462B1Z8</p>
      </div>
      <div style="text-align: right;">
        <div class="badge-paid">✓ PAYMENT CONFIRMED</div>
        <div style="font-size: 16px; font-weight: 800; color: #0f172a;">OFFICIAL TAX RECEIPT</div>
        <div style="font-size: 12px; font-family: monospace; color: #2563eb; font-weight: 700; margin-top: 4px;">
          ${order.orderNumber}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${formattedDate}</div>
        <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">Txn: ${order.transactionId || 'TXN-SETTLED'}</div>
      </div>
    </div>

    <div class="info-grid">
      <div>
        <h4>Billed & Shipped To:</h4>
        <div style="font-weight: 700; color: #0f172a;">${order.recipientName || 'Valued Customer'}</div>
        <div style="color: #475569;">${order.addressLine1 || 'Delivery Address'}</div>
        ${order.addressLine2 ? `<div style="color: #475569;">${order.addressLine2}</div>` : ''}
        <div style="color: #475569;">${order.city || ''}, ${order.state || ''} ${order.postalCode || ''}</div>
        <div style="color: #64748b; margin-top: 4px;">Phone: ${order.phone || 'N/A'}</div>
      </div>
      <div style="text-align: right;">
        <h4>Payment & Delivery</h4>
        <div style="color: #334155;">Method: <strong>${order.paymentMethod || 'Credit / Debit Card'}</strong></div>
        <div style="color: #059669; font-weight: 700;">Status: PAID (Settled)</div>
        <div style="color: #2563eb; font-weight: 600;">Delivery: ${order.status || 'CONFIRMED'}</div>
        <div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">Standard Express Shipping</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-box">
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span>Estimated GST / Tax (5%):</span>
          <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span>Express Delivery:</span>
          <span style="color: #059669; font-weight: 700;">FREE</span>
        </div>
        <div class="totals-row grand">
          <span>Total Paid:</span>
          <span>$${total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="barcode">
      <div>
        <div class="barcode-lines"></div>
        <span style="letter-spacing: 2px; font-family: monospace;">${order.orderNumber}</span>
      </div>
      <div style="text-align: right; max-width: 320px;">
        <p style="font-weight: 600; color: #475569;">Official Warranty Certificate</p>
        <p>Valid for 30 days from delivery. Keep this document for warranty verification and returns.</p>
      </div>
    </div>

    <div class="actions">
      <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
    </div>
  </div>
</body>
</html>
  `;

  // Trigger file download
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `NovaMart_Receipt_${order.orderNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
