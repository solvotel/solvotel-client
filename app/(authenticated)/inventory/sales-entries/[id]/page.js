'use client';

import { useAuth } from '@/context';
import { GetSingleData } from '@/utils/ApiFunctions';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Loader } from '@/component/common';
import { GetCustomDate } from '@/utils/DateFetcher';
import { use } from 'react';

export default function Page({ params }) {
  const { auth } = useAuth();
  const { id } = use(params);

  // ✅ Using your existing SWR hook for data fetching
  const data = GetSingleData({
    auth,
    endPoint: 'inventory-sales',
    id: id,
  });

  if (!data) return <Loader />;

  const gstAmount = (data?.total_price * data?.tax) / (100 + data?.tax);
  const baseAmount = data?.total_price - gstAmount;
  const sgst = gstAmount / 2;
  const cgst = gstAmount / 2;

  return (
    <>
      {/* Breadcrumb Header */}
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/inventory/purchase-sales"
          >
            Inventory Sakes
          </Link>
          <Typography color="text.primary">{data?.invoice_no}</Typography>
        </Breadcrumbs>
      </Box>

      <Box p={4}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" fontWeight="bold">
            Invoice No: {data?.invoice_no}
          </Typography>
        </Box>

        {/* Purchase Details */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Order ID</Typography>
              <Typography variant="body1" fontWeight="500">
                {data?.order_id || '—'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Invoice No</Typography>
              <Typography variant="body1" fontWeight="500">
                {data?.invoice_no || '—'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Invoice Date</Typography>
              <Typography variant="body1" fontWeight="500">
                {GetCustomDate(data?.date)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Inventory Item</Typography>
              <Typography variant="body1" fontWeight="500">
                {data?.inventory_item?.name || '—'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Unit</Typography>
              <Typography variant="body1" fontWeight="500">
                {data?.inventory_item?.unit || '—'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Quantity</Typography>
              <Typography variant="body1" fontWeight="500">
                {data?.qty}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Rate (₹)</Typography>
              <Typography variant="body1" fontWeight="500">
                {data?.rate?.toFixed(2)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">GST (%)</Typography>
              <Typography variant="body1" fontWeight="500">
                {data?.tax}%
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Calculation Summary */}
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              💰 Summary
            </Typography>
            <Typography>Base Amount: ₹{baseAmount.toFixed(2)}</Typography>
            <Typography>SGST (₹): ₹{sgst.toFixed(2)}</Typography>
            <Typography>CGST (₹): ₹{cgst.toFixed(2)}</Typography>
            <Typography variant="h6" fontWeight="bold" color="primary" mt={1}>
              Total Amount: ₹{parseFloat(data?.total_price).toFixed(2)}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
