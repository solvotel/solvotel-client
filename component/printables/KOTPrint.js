'use client';
import { GetCustomDate } from '@/utils/DateFetcher';
import {
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';

// styles
const CustomTableCell = styled(TableCell)`
  border: 0px solid white;
  padding: 1px;
  font-size: 12px;
`;

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
        width: '58mm', // "58mm" or "80mm"
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: '5px',
      }}
    >
      <p>KOT No: {kotData?.kot_number || 'N/A'}</p>
      <p>Type: {typeLabel || 'N/A'}</p>
      <p>Table No: {tableNo || 'N/A'}</p>
      <p>Date & Time: {updatedAt}</p>

      <p style={{ margin: '3px 0' }}>---------------------------------</p>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <CustomTableCell
                sx={{ fontWeight: 600, textAlign: 'left !important' }}
              >
                Item
              </CustomTableCell>
              <CustomTableCell align="right" sx={{ fontWeight: 600 }}>
                Qty
              </CustomTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
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
                <TableRow key={index}>
                  <CustomTableCell sx={{ textAlign: 'left !important' }}>
                    {itemName}
                  </CustomTableCell>
                  <CustomTableCell align="right">{qtyDisplay}</CustomTableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
});

KOTPrint.displayName = 'KOTPrint'; // 👈 required

export { KOTPrint };
