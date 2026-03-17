'use client';
import { GetCustomDate } from '@/utils/DateFetcher';
import React from 'react';

// styles

// forwardRef is required for react-to-print
const KOTPrint = React.forwardRef((props, ref) => {
  const { kotData, tableNo, size, typeLabel } = props;

  const updatedAt = kotData?.updatedAt
    ? new Date(kotData.updatedAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : 'N/A';

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
      <p>Type: {typeLabel || 'N/A'}</p>
      <p>Table No: {tableNo || 'N/A'}</p>
      <p>Date & Time: {updatedAt}</p>

      <p style={{ margin: '2px 0' }}>-------------------------------</p>

      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th align="left">Item</th>
            <th align="right">Qty</th>
          </tr>
        </thead>
        <tbody>
          {kotData?.items?.map((item, index) => {
            const itemName =
              item.name ||
              item.item ||
              item.itemName ||
              (item.menu_item && item.menu_item.item) ||
              String(item);
            const qtyRaw = item.qty ?? item.quantity ?? item.qtyString ?? '';
            const qtyDisplay =
              qtyRaw === 0 || qtyRaw === '0'
                ? 'Cancel'
                : typeof qtyRaw === 'string'
                  ? qtyRaw
                  : `+${qtyRaw}`;

            return (
              <tr key={index}>
                <td>{itemName}</td>
                <td align="right">{qtyDisplay}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

KOTPrint.displayName = 'KOTPrint'; // 👈 required

export { KOTPrint };
