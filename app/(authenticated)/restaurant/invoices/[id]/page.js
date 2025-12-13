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

export default function Page({ params }) {
  const { auth } = useAuth();
  const { id } = use(params);

  // ✅ Same way you already fetch data
  const invoiceData = GetSingleData({
    auth,
    endPoint: 'restaurant-invoices',
    id: id,
  });

  const myProfile = GetSingleData({
    auth,
    endPoint: 'hotels',
    id: auth?.user?.hotel_id,
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
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Link underline="hover" color="inherit" href="/restaurant/invoices/">
            Restaurant Invoices
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
                <TableCell>SGST %</TableCell>
                <TableCell>CGST %</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceData.menu_items?.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.hsn}</TableCell>
                  <TableCell>{item.rate}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{item.gst / 2}</TableCell>
                  <TableCell>{item.gst / 2}</TableCell>
                  <TableCell>{item.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary */}
        <Box mt={2}>
          <Typography>Total: ₹{invoiceData.total_amount}</Typography>
          <Typography>SGST: ₹{invoiceData.tax / 2}</Typography>
          <Typography>CGST: ₹{invoiceData.tax / 2}</Typography>
          <Typography>Payable: ₹{invoiceData.payable_amount}</Typography>
          <Typography>Payment Method: {invoiceData.mop}</Typography>
        </Box>

        <div style={{ display: 'none' }}>
          <RestaurantPosInvoice
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
