'use client';
import { GetCustomDate } from '@/utils/DateFetcher';
import React from 'react';

// styles

// forwardRef is required for react-to-print
const RestaurantPosInvoice = React.forwardRef((props, ref) => {
  const { invoice, profile, size } = props;

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
        <p style={{ margin: 0 }}>GST: {profile.res_gst_no || 'N/A'}</p>
        <p style={{ margin: '5px 0' }}>-------------------------------</p>
      </div>

      <p>Invoice No: {invoice.invoice_no}</p>
      <p>
        Date: {GetCustomDate(invoice.date)} | Time: {invoice.time}
      </p>
      <p>Customer: {invoice.customer_name}</p>
      <p>Phone: {invoice.customer_phone}</p>
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
                <span style={{ fontSize: 10 }}>GST:{item?.gst_percent}%</span>
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
        <p>GST: ₹{invoice?.tax}</p>
        <p style={{ fontWeight: 'bold' }}>Total: ₹{invoice?.payable_amount}</p>
      </div>

      <p style={{ margin: '5px 0' }}>-------------------------------</p>

      <div style={{ textAlign: 'center' }}>
        <p>Thank you! Visit again.</p>
      </div>
    </div>
  );
});

RestaurantPosInvoice.displayName = 'RestaurantPosInvoice'; // 👈 required

export { RestaurantPosInvoice };
