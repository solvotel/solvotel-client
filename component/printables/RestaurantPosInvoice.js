'use client';
import { GetCustomDate } from '@/utils/DateFetcher';
import { Box } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import React from 'react';

// forwardRef is required for react-to-print
const RestaurantPosInvoice = React.forwardRef((props, ref) => {
  const { invoice, profile, size } = props;

  const upiId = profile.res_upi_id;
  const name = profile.res_upi_name;
  const amount = invoice?.payable_amount || 0;

  const isUpiValid = upiId && name && amount > 0;

  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    name,
  )}&am=${amount}&cu=INR`;

  return (
    <div
      ref={ref}
      style={{
        width: size, // "58mm" or "80mm"
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: '5px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: 0 }}>{profile.res_name}</h3>
        <p style={{ margin: 0 }}>
          {profile.res_address_line1}, {profile.res_address_line2}
        </p>
        <p style={{ margin: 0 }}>
          {profile.res_district}, {profile.res_state}
        </p>
        {profile.res_gst_no && (
          <p style={{ margin: 0 }}>GST: {profile.res_gst_no}</p>
        )}
      </div>
      <p style={{ margin: '5px 0' }}>-------------------------------</p>
      <p>Invoice No: {invoice.invoice_no}</p>
      <p>
        Date: {GetCustomDate(invoice.date)} | Time: {invoice.time}
      </p>
      {invoice.customer_name && <p>Customer: {invoice.customer_name}</p>}
      {invoice.customer_phone && <p>Phone: {invoice.customer_phone}</p>}

      <p style={{ margin: '5px 0' }}>-------------------------------</p>

      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th align="left">Item</th>
            <th align="right">Qty</th>
            <th align="right">Rate</th>
            <th align="right">Amt</th>
          </tr>
        </thead>
        <tbody>
          {invoice?.menu_items?.map((item, index) => (
            <tr key={index}>
              <td>
                {item.item}
                <br />
                <span style={{ fontSize: 9 }}>
                  SGST:{item?.gst / 2}%, CGST:{item?.gst / 2}%
                </span>
              </td>
              <td align="right">{item.qty}</td>
              <td align="right">{item.rate}</td>
              <td align="right">{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ margin: '5px 0' }}>-------------------------------</p>

      <div style={{ textAlign: 'right' }}>
        <p>Subtotal: ₹{invoice?.total_amount}</p>
        <p>SGST: ₹{invoice?.tax / 2}</p>
        <p>CGST: ₹{invoice?.tax / 2}</p>
        <p style={{ fontWeight: 'bold' }}>Total: ₹{invoice?.payable_amount}</p>
      </div>

      <p style={{ margin: '5px 0' }}>-------------------------------</p>
      {isUpiValid && (
        <div style={{ textAlign: 'center' }}>
          <QRCodeCanvas value={upiUrl} size={100} level="H" />
        </div>
      )}
      {profile?.res_footer && (
        <div style={{ textAlign: 'center' }}>
          <p
            align="center"
            style={{ fontSize: '10px', color: '#555', margin: 0 }}
          >
            {profile?.res_footer}
          </p>
        </div>
      )}
    </div>
  );
});

RestaurantPosInvoice.displayName = 'RestaurantPosInvoice'; // 👈 required

export { RestaurantPosInvoice };
