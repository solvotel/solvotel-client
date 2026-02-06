'use client';

import { useAuth } from '@/context';
import { GetSingleData } from '@/utils/ApiFunctions';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Divider,
  Breadcrumbs,
  Link,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@/component/common';
import { RestaurantPosInvoice } from '@/component/printables/RestaurantPosInvoice';
import { PosOutletInvoice } from '@/component/printables/PosOutletInvoice';

export default function Page({ params }) {
  const { auth } = useAuth();
  const { id } = use(params);

  // ✅ Same way you already fetch data
  const invoiceData = GetSingleData({
    auth,
    endPoint: 'pos-outlet-invoices',
    id: id,
  });

  const myProfile = GetSingleData({
    auth,
    endPoint: 'pos-outlets',
    id: auth?.user?.pos_outlet_id,
  });

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'res-inv',
  });

  if (!invoiceData || !myProfile) {
    return <Loader />;
  }

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/pos-outlet/dashboard">
            Dashboard
          </Link>
          <Link underline="hover" color="inherit" href="/pos-outlet/invoices/">
            Invoices
          </Link>

          <Typography color="text.primary">
            {invoiceData?.invoice_no}
          </Typography>
        </Breadcrumbs>
      </Box>
      <Box p={4}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Invoice: {invoiceData.invoice_no}
          </Typography>

          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            sx={{ ml: 2 }}
            onClick={handlePrint}
          >
            Print Invoice
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Customer Info */}
        <Typography variant="subtitle1">
          Date: {invoiceData.date} | Time: {invoiceData.time}
        </Typography>
        <Typography variant="subtitle1">
          Customer: {invoiceData.customer_name || 'N/A'}
        </Typography>
        <Typography variant="subtitle1">
          Phone:
          {invoiceData.customer_phone || 'N/A'}
        </Typography>
        <Typography variant="subtitle1">
          GST: {invoiceData.customer_gst}
        </Typography>
        <Typography variant="subtitle1">
          Address: {invoiceData.customer_address}
        </Typography>

        {/* Item Table */}
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>HSN</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>CGST %</TableCell>
                <TableCell>SGST %</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceData.billing_items?.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.hsn}</TableCell>
                  <TableCell>{item.rate}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{item.cgst}</TableCell>
                  <TableCell>{item.sgst}</TableCell>
                  <TableCell>
                    {parseFloat(item.total || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary */}
        <Box mt={2}>
          <Typography>
            Total: ₹{invoiceData.total_amount ?? invoiceData.taxable ?? 0}
          </Typography>
          <Typography>
            CGST: ₹
            {(invoiceData.cgst ?? (invoiceData.tax ? invoiceData.tax / 2 : 0))
              .toFixed
              ? (
                  invoiceData.cgst ??
                  (invoiceData.tax ? invoiceData.tax / 2 : 0)
                ).toFixed(2)
              : (invoiceData.cgst ??
                (invoiceData.tax ? invoiceData.tax / 2 : 0))}
          </Typography>
          <Typography>
            SGST: ₹
            {(invoiceData.sgst ?? (invoiceData.tax ? invoiceData.tax / 2 : 0))
              .toFixed
              ? (
                  invoiceData.sgst ??
                  (invoiceData.tax ? invoiceData.tax / 2 : 0)
                ).toFixed(2)
              : (invoiceData.sgst ??
                (invoiceData.tax ? invoiceData.tax / 2 : 0))}
          </Typography>
          <Typography>
            Payable: ₹{invoiceData.payable ?? invoiceData.payable_amount ?? 0}
          </Typography>
        </Box>

        {/* Payments Table */}
        {invoiceData.payments && invoiceData.payments.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>MOP</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceData.payments.map((payment, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {new Date(payment.time_stamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{payment.mop}</TableCell>
                    <TableCell>
                      ₹{parseFloat(payment.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Payment Summary */}
        <Box mt={2}>
          <Typography>
            Total Paid: ₹
            {invoiceData.payments
              ? invoiceData.payments
                  .reduce(
                    (acc, payment) => acc + (parseFloat(payment.amount) || 0),
                    0,
                  )
                  .toFixed(2)
              : '0.00'}
          </Typography>
          <Typography>Due: ₹{invoiceData.due || '0.00'}</Typography>
        </Box>

        <div style={{ display: 'none' }}>
          <PosOutletInvoice
            ref={componentRef}
            invoice={invoiceData}
            profile={myProfile}
            size="58mm"
          />
        </div>
      </Box>
    </>
  );
}
