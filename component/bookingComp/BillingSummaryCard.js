'use client';

import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Paper,
  Grid,
} from '@mui/material';

import RoomIcon from '@mui/icons-material/MeetingRoom';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import RestaurantIcon from '@mui/icons-material/Restaurant';

export default function BillingSummaryCard({ booking }) {
  const roomTokens = booking?.room_tokens || [];

  const services = booking?.service_billing || [];

  const foodItems = booking?.food_items || [];

  // ---- Summary calculations ----
  const totalRoomAmount = roomTokens.reduce(
    (sum, r) => sum + (r.amount || 0),
    0
  );
  const totalServiceAmount = services.reduce(
    (sum, s) => sum + (s.amount || 0),
    0
  );
  const totalFoodAmount = foodItems.reduce(
    (sum, f) => sum + (f.amount || 0),
    0
  );
  const grandTotal = totalRoomAmount + totalServiceAmount + totalFoodAmount;

  return (
    <Card sx={{ borderRadius: 4, p: 2 }}>
      <CardContent sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 2, color: 'primary.main' }}
        >
          📃 Billing Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#e3f2fd' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Room Tokens
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ₹ {totalRoomAmount}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fff0f1' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Services
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ₹ {totalServiceAmount}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f0fff4' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Food Items
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ₹ {totalFoodAmount.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fff8e1' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Grand Total
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                ₹ {grandTotal}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      <CardContent sx={{ p: 0 }}>
        {/* Room Tokens */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <RoomIcon color="primary" />
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Room Tokens
            </Typography>
          </Box>
          {/* <Button
            size="small"
            variant="contained"
            color="success"
            sx={{ textTransform: 'none', borderRadius: 3 }}
          >
            Room Invoice
          </Button> */}
        </Box>
        <TableContainer component={Paper} sx={{ borderRadius: 3, mb: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f0f4ff' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Room No</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>

                <TableCell sx={{ fontWeight: 'bold' }}>Tariff</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>GST</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomTokens.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.room}</TableCell>
                  <TableCell>{r.item}</TableCell>

                  <TableCell>₹{r.rate}</TableCell>
                  <TableCell>{r.gst}%</TableCell>
                  <TableCell>₹{r.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 2 }} />

        {/* Services */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <LocalMallIcon color="secondary" />
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Services
            </Typography>
          </Box>
          {/* <Button
            size="small"
            variant="contained"
            color="success"
            sx={{ textTransform: 'none', borderRadius: 3 }}
          >
            Service Invoice
          </Button> */}
        </Box>
        <TableContainer component={Paper} sx={{ borderRadius: 3, mb: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#fff0f2' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>HSN</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rate</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>GST</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((s, i) => (
                <TableRow key={i} hover>
                  <TableCell>{s.room}</TableCell>
                  <TableCell>{s.item}</TableCell>
                  <TableCell>{s.hsn}</TableCell>
                  <TableCell>₹{s.rate}</TableCell>
                  <TableCell>{s.gst}</TableCell>
                  <TableCell>₹{s.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 2 }} />

        {/* Food Items */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <RestaurantIcon color="success" />
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Food Items
            </Typography>
          </Box>
          {/* <Button
            size="small"
            variant="contained"
            color="success"
            sx={{ textTransform: 'none', borderRadius: 3 }}
          >
            Food Invoice
          </Button> */}
        </Box>
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f0fff4' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rate</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>GST</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {foodItems.map((f, i) => (
                <TableRow key={i} hover>
                  <TableCell>{f.room}</TableCell>
                  <TableCell>{f.item}</TableCell>
                  <TableCell>₹{f.rate}</TableCell>
                  <TableCell>{f.qty}</TableCell>
                  <TableCell>{f.gst}</TableCell>
                  <TableCell>₹{f.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
