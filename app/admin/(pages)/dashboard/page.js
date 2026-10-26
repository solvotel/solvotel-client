'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  AccessTime,
  Apartment,
  ArrowForward,
  EventAvailable,
  HighlightOff,
  PointOfSale,
  ReceiptLong,
  TrendingUp,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { BASEURL, fetcher } from '@/config/MainApi';
import { useAuth } from '@/context';
import { GetCustomDate } from '@/utils/DateFetcher';

const EMPTY_SUBSCRIPTIONS = [];

const getPlanStatus = ({ start_date, expiry_date }) => {
  if (!start_date || !expiry_date) return 'Expired';

  const start = new Date(`${start_date.slice(0, 10)}T00:00:00`);
  const expiry = new Date(`${expiry_date.slice(0, 10)}T00:00:00`);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(expiry.getTime()) ||
    start > expiry
  ) {
    return 'Expired';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= start && today <= expiry ? 'Active' : 'Expired';
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const getSubscriptionName = (subscription, type) =>
  type === 'Hotel'
    ? subscription.hotel?.hotel_name || 'Hotel not specified'
    : subscription.pos_outlet?.name || 'Outlet not specified';

function SubscriptionTable({
  title,
  description,
  subscriptions,
  type,
  loading,
  href,
  emptyMessage,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid #e5e7eb',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1}
        sx={{ p: 2.5 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <Button
          component={Link}
          href={href}
          size="small"
          endIcon={<ArrowForward />}
          sx={{ textTransform: 'none' }}
        >
          View all
        </Button>
      </Stack>
      <TableContainer>
        <Table sx={{ minWidth: 600 }}>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>{type === 'Hotel' ? 'Hotel' : 'POS outlet'}</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Expiry date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    Loading subscription data...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : subscriptions.length ? (
              subscriptions.map((subscription) => {
                const status = getPlanStatus(subscription);
                return (
                  <TableRow
                    key={`${type}-${subscription.documentId || subscription.id}`}
                    hover
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ReceiptLong
                          fontSize="small"
                          sx={{ color: 'text.secondary' }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {subscription.order_id || '—'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {getSubscriptionName(subscription, type)}
                    </TableCell>
                    <TableCell>{subscription.plan || '—'}</TableCell>
                    <TableCell>
                      {subscription.expiry_date
                        ? GetCustomDate(subscription.expiry_date)
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status}
                        color={status === 'Active' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(subscription.amount)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default function AdminDashboardPage() {
  const { auth } = useAuth();
  const [now, setNow] = useState(() => new Date());

  const { data: hotelSubscriptions, isLoading: hotelsLoading } = useSWR(
    `${BASEURL}/hotel-subscriptions?sort=createdAt:DESC&populate=*`,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 500 },
  );
  const { data: outletSubscriptions, isLoading: outletsLoading } = useSWR(
    `${BASEURL}/pos-subscriptions?sort=createdAt:DESC&populate=*`,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 500 },
  );

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const hotels = Array.isArray(hotelSubscriptions)
    ? hotelSubscriptions
    : EMPTY_SUBSCRIPTIONS;
  const outlets = Array.isArray(outletSubscriptions)
    ? outletSubscriptions
    : EMPTY_SUBSCRIPTIONS;
  const recentHotels = [...hotels]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 6);
  const recentOutlets = [...outlets]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 6);
  const activeHotels = hotels.filter(
    (subscription) => getPlanStatus(subscription) === 'Active',
  ).length;
  const activeOutlets = outlets.filter(
    (subscription) => getPlanStatus(subscription) === 'Active',
  ).length;
  const expiredHotels = hotels.length - activeHotels;
  const expiredOutlets = outlets.length - activeOutlets;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  const isExpiringThisMonth = (subscription) => {
    if (!subscription.expiry_date) return false;
    const expiryDate = new Date(
      `${String(subscription.expiry_date).slice(0, 10)}T00:00:00`,
    );
    return (
      !Number.isNaN(expiryDate.getTime()) &&
      expiryDate >= today &&
      expiryDate <= endOfMonth
    );
  };
  const upcomingHotelSubscriptions = hotels
    .filter(isExpiringThisMonth)
    .sort(
      (a, b) =>
        new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime(),
    );
  const upcomingOutletSubscriptions = outlets
    .filter(isExpiringThisMonth)
    .sort(
      (a, b) =>
        new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime(),
    );
  const upcomingHotelExpirations = upcomingHotelSubscriptions.length;
  const upcomingOutletExpirations = upcomingOutletSubscriptions.length;
  const loading = hotelsLoading || outletsLoading;
  const totalRevenue = [...hotels, ...outlets].reduce(
    (total, subscription) => total + (Number(subscription.amount) || 0),
    0,
  );
  const greeting =
    now.getHours() < 12
      ? 'Good morning'
      : now.getHours() < 18
        ? 'Good afternoon'
        : 'Good evening';

  const stats = [
    {
      label: 'Hotel subscriptions · Active',
      value: activeHotels,
      detail: 'Active hotel plans',
      icon: <Apartment />,
      color: '#2563eb',
      background: '#eff6ff',
    },
    {
      label: 'Hotel subscriptions · Expired',
      value: expiredHotels,
      detail: 'Expired hotel plans',
      icon: <HighlightOff />,
      color: '#dc2626',
      background: '#fef2f2',
    },
    {
      label: 'POS outlet subscriptions · Active',
      value: activeOutlets,
      detail: 'Active POS outlet plans',
      icon: <PointOfSale />,
      color: '#7c3aed',
      background: '#f5f3ff',
    },
    {
      label: 'POS outlet subscriptions · Expired',
      value: expiredOutlets,
      detail: 'Expired POS outlet plans',
      icon: <HighlightOff />,
      color: '#dc2626',
      background: '#fef2f2',
    },
    {
      label: 'Expiring this month',
      value: upcomingHotelExpirations + upcomingOutletExpirations,
      detail: `${upcomingHotelExpirations} hotel · ${upcomingOutletExpirations} POS outlet`,
      icon: <EventAvailable />,
      color: '#d97706',
      background: '#fffbeb',
    },
    {
      label: 'Subscription amount',
      value: formatCurrency(totalRevenue),
      detail: 'Combined recorded plan amounts',
      icon: <TrendingUp />,
      color: '#d97706',
      background: '#fffbeb',
    },
  ];

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 3, md: 4 },
          overflow: 'hidden',
          borderRadius: 3,
          color: '#fff',
          background:
            'linear-gradient(120deg, #0a2e4b 0%, #14577c 62%, #167a8a 100%)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={3}
        >
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.75 }}>
              Solvotel administration
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
              {greeting}, {auth?.user?.username || 'Admin'}
            </Typography>
            <Typography sx={{ mt: 1, opacity: 0.8 }}>
              Here&apos;s an overview of subscriptions across your platform.
            </Typography>
          </Box>
          <Box
            sx={{
              minWidth: { md: 245 },
              p: 2,
              borderRadius: 2.5,
              bgcolor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTime fontSize="small" />
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Local time
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 0.75 }}>
              {now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {now.toLocaleDateString([], {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, xl: 4 }}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                p: 2.5,
                border: '1px solid #e5e7eb',
                borderRadius: 3,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography
                    variant={stat.label === 'Subscription amount' ? 'h5' : 'h4'}
                    fontWeight={700}
                    sx={{ mt: 1, color: '#0f172a' }}
                  >
                    {loading ? '—' : stat.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    color: stat.color,
                    bgcolor: stat.background,
                    borderRadius: 2,
                  }}
                >
                  {stat.icon}
                </Box>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {loading ? 'Loading subscription data...' : stat.detail}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, xl: 6 }}>
          <SubscriptionTable
            title="Recent hotel subscriptions"
            description="The latest hotel subscription records"
            subscriptions={recentHotels}
            type="Hotel"
            loading={hotelsLoading}
            href="/admin/hotel-subscriptions"
            emptyMessage="No hotel subscriptions found."
          />
        </Grid>
        <Grid size={{ xs: 12, xl: 6 }}>
          <SubscriptionTable
            title="Recent POS outlet subscriptions"
            description="The latest POS outlet subscription records"
            subscriptions={recentOutlets}
            type="POS Outlet"
            loading={outletsLoading}
            href="/admin/pos-outlet-subscriptions"
            emptyMessage="No POS outlet subscriptions found."
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, xl: 6 }}>
          <SubscriptionTable
            title="Hotel subscriptions expiring this month"
            description="Sorted by nearest expiry date"
            subscriptions={upcomingHotelSubscriptions}
            type="Hotel"
            loading={hotelsLoading}
            href="/admin/hotel-subscriptions"
            emptyMessage="No hotel subscriptions expiring this month."
          />
        </Grid>
        <Grid size={{ xs: 12, xl: 6 }}>
          <SubscriptionTable
            title="POS outlet subscriptions expiring this month"
            description="Sorted by nearest expiry date"
            subscriptions={upcomingOutletSubscriptions}
            type="POS Outlet"
            loading={outletsLoading}
            href="/admin/pos-outlet-subscriptions"
            emptyMessage="No POS outlet subscriptions expiring this month."
          />
        </Grid>
      </Grid>
    </Box>
  );
}
