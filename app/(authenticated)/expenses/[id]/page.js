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
    endPoint: 'expenses',
    id: id,
  });

  if (!data) return <Loader />;

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
          <Link underline="hover" color="inherit" href="/expenses">
            Expenses
          </Link>
          <Typography color="text.primary">{data?.id}</Typography>
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
            Expense ID: {data?.id}
          </Typography>
        </Box>

        {/* Purchase Details */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Date</Typography>
              <Typography variant="body1" fontWeight="500">
                {GetCustomDate(data?.date) || '—'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Title</Typography>
              <Typography variant="body1" fontWeight="500">
                {data?.title || '—'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Description</Typography>
              <Typography variant="body1" fontWeight="500">
                {data?.description || '—'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Mode Of Payment</Typography>
              <Typography variant="body1" fontWeight="500">
                {data?.mop || '—'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Amount</Typography>
              <Typography variant="body1" fontWeight="500">
                {data?.amount || '—'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </>
  );
}
