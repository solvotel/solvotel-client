'use client';
import { GetCustomDate } from '@/utils/DateFetcher';
import { QRCodeCanvas } from 'qrcode.react';
import React from 'react';

// styles

// forwardRef is required for react-to-print
const PosOutletInvoice = React.forwardRef((props, ref) => {
  const { invoice, profile, size } = props;

  const upiId = profile.upi_id;
  const name = profile.upi_name;
  const amount = invoice?.payable || 0;

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
        <h3 style={{ margin: 0 }}>{profile.name}</h3>
        <p style={{ margin: 0 }}>
          {profile.address_line_1}, {profile.address_line_2}
        </p>
        <p style={{ margin: 0 }}>
          {profile.district}, {profile.state}
        </p>
        {profile.gst_no && (
          <p style={{ margin: 0 }}>GST: {profile.gst_no || 'N/A'}</p>
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
          {invoice?.billing_items?.map((item, index) => (
            <tr key={index}>
              <td>
                {item.item}
                <br />
                <span style={{ fontSize: 9 }}>
                  SGST:{item?.sgst}%, CGST:{item?.cgst}%
                </span>
              </td>
              <td align="right">{item.qty}</td>
              <td align="right">{item.rate}</td>
              <td align="right">{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ margin: '5px 0' }}>-------------------------------</p>

      <div style={{ textAlign: 'right' }}>
        <p>Subtotal: ₹{invoice?.taxable}</p>
        <p>SGST: ₹{invoice?.sgst}</p>
        <p>CGST: ₹{invoice?.cgst}</p>
        <p style={{ fontWeight: 'bold' }}>Total: ₹{invoice?.payable}</p>
      </div>

      <p style={{ margin: '5px 0' }}>-------------------------------</p>
      {isUpiValid && (
        <div style={{ textAlign: 'center' }}>
          <QRCodeCanvas value={upiUrl} size={100} level="H" />
        </div>
      )}
      {profile?.footer && (
        <div style={{ textAlign: 'center' }}>
          <p
            align="center"
            style={{ fontSize: '10px', color: '#555', margin: 0 }}
          >
            {profile?.footer}
          </p>
        </div>
      )}
    </div>
  );
});

PosOutletInvoice.displayName = 'PosOutletInvoice'; // 👈 required

export { PosOutletInvoice };
