'use client';

import React, { useMemo } from 'react';
import { useAuth } from '@/context';
import { GetPosDataList, GetSingleData } from '@/utils/ApiFunctions';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Breadcrumbs,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  Store as StoreIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  NavigateNext,
} from '@mui/icons-material';
import { Loader } from '@/component/common';
import Image from 'next/image';

// Helper functions remain the same
function safeGetCreatedAt(item) {
  return (
    item?.createdAt ||
    item?.created_at ||
    item?.attributes?.createdAt ||
    item?.attributes?.created_at ||
    item?.time_stamp ||
    ''
  );
}

function getInvoicePayable(inv) {
  const direct = inv?.payable ?? inv?.total_amount ?? inv?.taxable;
  if (typeof direct === 'number') return direct;
  if (direct) return parseFloat(direct) || 0;

  const attrs = inv?.attributes || {};
  const directA = attrs?.payable ?? attrs?.total_amount ?? attrs?.taxable;
  if (typeof directA === 'number') return directA;
  if (directA) return parseFloat(directA) || 0;

  const billing = inv?.billing_items || attrs?.billing_items || [];
  if (billing && billing.length) {
    return billing.reduce((acc, it) => {
      const rate = it?.rate || it?.price || 0;
      const qty = it?.qty || it?.quantity || 1;
      const cgst = it?.cgst || 0;
      const sgst = it?.sgst || 0;
      const base = rate * qty;
      const tax = (base * (cgst + sgst)) / 100;
      return acc + base + tax;
    }, 0);
  }

  return 0;
}

// Stat Card Component
const StatCard = ({ title, value, icon, color, trend }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
          border: `1px solid ${alpha(theme.palette[color].main, 0.3)}`,
        },
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            {trend && (
              <Chip
                size="small"
                label={trend}
                color={trend.includes('+') ? 'success' : 'error'}
                sx={{ mt: 1, fontSize: '0.75rem' }}
              />
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: theme.palette[color].main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Invoice Row Component
const InvoiceRow = ({ invoice }) => {
  const theme = useTheme();

  return (
    <TableRow
      sx={{
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
        },
        transition: 'background-color 0.2s',
      }}
    >
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ReceiptIcon color="action" fontSize="small" />
          <Typography variant="body2" fontWeight="medium">
            {invoice?.invoice_no ??
              invoice?.attributes?.invoice_no ??
              invoice?.invoiceNo ??
              'N/A'}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {new Date(safeGetCreatedAt(invoice)).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Chip
          label={`₹${getInvoicePayable(invoice).toFixed(2)}`}
          size="small"
          sx={{
            fontWeight: 'bold',
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: theme.palette.success.dark,
          }}
        />
      </TableCell>
      <TableCell align="right">
        <IconButton size="small">
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default function Page() {
  const { auth } = useAuth();
  const theme = useTheme();

  const posOutlet = GetSingleData({
    auth,
    endPoint: 'pos-outlets',
    id: auth?.user?.pos_outlet_id,
  });

  const _posItems = GetPosDataList({ auth, endPoint: 'pos-items' });
  const posItems = useMemo(() => _posItems || [], [_posItems]);

  const _invoices = GetPosDataList({ auth, endPoint: 'pos-outlet-invoices' });
  const invoices = useMemo(() => _invoices || [], [_invoices]);

  // Calculations
  const totalItems = posItems.length;
  const totalInvoices = invoices.length;
  const totalAmount = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + getInvoicePayable(inv), 0);
  }, [invoices]);

  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return invoices
      .filter((inv) => {
        const d = new Date(safeGetCreatedAt(inv));
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      })
      .reduce((acc, inv) => acc + getInvoicePayable(inv), 0);
  }, [invoices]);

  const recentInvoices = invoices.slice(0, 6);

  // Format currency for Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!posOutlet) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Loader />
      </Box>
    );
  }

  return (
    <>
      {/* <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Typography color="text.primary">Dashboard</Typography>
        </Breadcrumbs>
      </Box> */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Items"
              value={totalItems}
              icon={<InventoryIcon />}
              color="primary"
              trend="+12%"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Invoices"
              value={totalInvoices}
              icon={<ReceiptIcon />}
              color="secondary"
              trend="+8%"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="This Month"
              value={formatCurrency(totalThisMonth)}
              icon={<TrendingUpIcon />}
              color="success"
              trend="+15%"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Revenue"
              value={formatCurrency(totalAmount)}
              icon={<WalletIcon />}
              color="warning"
              trend="+18%"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Store Info Card */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ mb: 3 }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    <Image
                      src={
                        posOutlet?.logo?.url ||
                        'https://res.cloudinary.com/deyxdpnom/image/upload/v1760012402/demo_hpzblb.png'
                      }
                      alt={posOutlet?.name || 'POS Outlet'}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {posOutlet?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {posOutlet?.district}, {posOutlet?.state}
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      Address
                    </Typography>
                    <Typography variant="body2">
                      {posOutlet?.address_line_1}, {posOutlet?.address_line_2}
                    </Typography>
                    <Typography variant="body2">
                      {posOutlet?.district}, {posOutlet?.state} -{' '}
                      {posOutlet?.pincode}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={4}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        Contact
                      </Typography>
                      <Typography variant="body2">
                        {posOutlet?.phone || 'N/A'}
                      </Typography>
                      {posOutlet?.alt_phone && (
                        <Typography variant="body2">
                          {posOutlet.alt_phone}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        Email
                      </Typography>
                      <Typography variant="body2">
                        {posOutlet?.email || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        Website
                      </Typography>
                      <Typography variant="body2">
                        {posOutlet?.website || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>

                  {posOutlet?.gst_no && (
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        GSTIN
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        {posOutlet.gst_no}
                      </Typography>
                    </Box>
                  )}

                  {posOutlet?.website && (
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        Website
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'primary.main', textDecoration: 'none' }}
                      >
                        {posOutlet.website}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Invoices */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Recent Invoices
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Latest 6 transactions
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                </Stack>

                {recentInvoices.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      color: 'text.secondary',
                    }}
                  >
                    <ReceiptIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                    <Typography variant="body1">No invoices found</Typography>
                    <Typography variant="body2">
                      Start creating invoices to see them here
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Invoice #</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentInvoices.map((inv, idx) => (
                          <InvoiceRow key={idx} invoice={inv} />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Stats Footer */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Performance Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Avg. Invoice Value
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {totalInvoices > 0
                    ? formatCurrency(totalAmount / totalInvoices)
                    : '₹0'}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Items per Invoice
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {totalInvoices > 0
                    ? (totalItems / totalInvoices).toFixed(1)
                    : '0'}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Monthly Growth
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  +15.2%
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Active Since
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {posOutlet?.createdAt
                    ? new Date(posOutlet.createdAt).getFullYear()
                    : '2024'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}
