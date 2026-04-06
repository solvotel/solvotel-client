'use client';
import { GetCustomDate } from '@/utils/DateFetcher';
import {
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { QRCodeCanvas } from 'qrcode.react';
import React from 'react';

const CustomTableCell = styled(TableCell)`
  border: 0px solid white;
  padding: 1px;
  font-size: 12px;
`;

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
        <h3 style={{ margin: 0, fontWeight: 'bold' }}>{profile.res_name}</h3>
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
      <p style={{ margin: '5px 0' }}>---------------------------------</p>
      <p>Invoice No: {invoice.invoice_no}</p>
      <p>
        Date: {GetCustomDate(invoice.date)} | Time: {invoice.time}
      </p>
      {invoice.customer_name && <p>Customer: {invoice.customer_name}</p>}
      {invoice.customer_phone && <p>Phone: {invoice.customer_phone}</p>}
      {invoice.customer_gst && <p>GST: {invoice.customer_gst}</p>}
      <p style={{ margin: '5px 0' }}>---------------------------------</p>

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
              <CustomTableCell align="right" sx={{ fontWeight: 600 }}>
                Rate
              </CustomTableCell>
              <CustomTableCell align="right" sx={{ fontWeight: 600 }}>
                Amt
              </CustomTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {invoice?.menu_items?.map((item, index) => (
              <TableRow key={index}>
                <CustomTableCell sx={{ textAlign: 'left !important' }}>
                  {item.item}

                  {item?.gst > 0 && (
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ fontSize: 9 }}
                    >
                      SGST: {item?.gst / 2}%, CGST: {item?.gst / 2}%
                    </Typography>
                  )}
                </CustomTableCell>

                <CustomTableCell align="right">{item.qty}</CustomTableCell>
                <CustomTableCell align="right">{item.rate}</CustomTableCell>
                <CustomTableCell align="right">{item.amount}</CustomTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <p style={{ margin: '5px 0' }}>---------------------------------</p>

      <div style={{ textAlign: 'right' }}>
        <p>Subtotal: ₹{invoice?.total_amount}</p>
        <p>SGST: ₹{invoice?.tax / 2}</p>
        <p>CGST: ₹{invoice?.tax / 2}</p>
        <p style={{ fontWeight: 'bold' }}>Total: ₹{invoice?.payable_amount}</p>
      </div>

      <p style={{ margin: '5px 0' }}>---------------------------------</p>
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
