'use client';
import { GetCustomDate } from '@/utils/DateFetcher';
import React from 'react';

// styles

// forwardRef is required for react-to-print
const KOTPrint = React.forwardRef((props, ref) => {
  const { kotData, tableNo, size } = props;

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
      <p>KOT No: {kotData?.kot_number || 'N/A'}</p>

      <p>Table No: {tableNo || 'N/A'}</p>

      <p style={{ margin: '5px 0' }}>-------------------------------</p>

      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th align="left">Item</th>
            <th align="right">Qty</th>
          </tr>
        </thead>
        <tbody>
          {kotData?.items?.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td align="right">{item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

KOTPrint.displayName = 'KOTPrint'; // 👈 required

export { KOTPrint };
