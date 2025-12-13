'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
} from '@mui/material';
import RoomIcon from '@mui/icons-material/MeetingRoom';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { Delete } from '@mui/icons-material';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { UpdateData } from '@/utils/ApiFunctions';
import { useAuth } from '@/context';

export default function BillingSummaryCard({ booking }) {
  const { auth } = useAuth();
  const roomTokens = booking?.room_tokens || [];
  const services = booking?.service_tokens || [];
  const foodItems = booking?.food_tokens || [];

  // ---- Summary calculations ----
  const totalRoomAmount = roomTokens.reduce(
    (sum, r) => sum + (parseFloat(r.total_amount) || r.amount || 0),
    0
  );
  const totalServiceAmount = services.reduce(
    (sum, s) => sum + (parseFloat(s.total_amount) || 0),
    0
  );
  const totalFoodAmount = foodItems.reduce(
    (sum, f) => sum + (parseFloat(f.total_amount) || 0),
    0
  );
  const grandTotal = totalRoomAmount + totalServiceAmount + totalFoodAmount;

  const deleteServices = async (id) => {
    const filteredServices = services.filter((_, index) => index !== id);
    try {
      const res = await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { service_tokens: filteredServices } },
      });
      SuccessToast('Service deleted successfully');
    } catch (err) {
      console.log(err);
      ErrorToast('Failed to delete service');
    }
  };

  const deleteFoodItems = async ({ id, orderId }) => {
    const filteredFoodItems = foodItems.filter((_, index) => index !== id);
    try {
      await UpdateData({
        auth,
        endPoint: 'table-orders',
        id: orderId,
        payload: {
          data: {
            closing_method: 'Room Transfer',
            token_status: 'Open',
            room_no: '',
            room_booking: null,
          },
        },
      });
      await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { food_tokens: filteredFoodItems } },
      });

      SuccessToast('Food item deleted successfully');
    } catch (err) {
      console.log(err);
      ErrorToast('Failed to delete food item');
    }
  };
  return (
    <Card sx={{ borderRadius: 4, p: 2 }}>
      {/* ---- Header Summary ---- */}
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
                ₹ {totalRoomAmount.toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fff0f1' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Services
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ₹ {totalServiceAmount.toFixed(2)}
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
                ₹ {grandTotal.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      {/* ---- ROOM TOKENS TABLE ---- */}
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <RoomIcon color="primary" />
          <Typography variant="subtitle1" fontWeight="bold">
            Room Tokens
          </Typography>
        </Box>
        {roomTokens.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No room tokens found.
          </Typography>
        ) : (
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>
                    <b>Room No</b>
                  </TableCell>
                  <TableCell>
                    <b>Items</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>SGST (₹)</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>CGST (₹)</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>Total (₹)</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomTokens.map((room, index) => {
                  const rate = room.rate * room.days;
                  return (
                    <TableRow key={index}>
                      <TableCell>{room.room || room.room_no}</TableCell>
                      <TableCell>{room.item}</TableCell>
                      <TableCell align="right">
                        {parseFloat((room.amount - rate) / 2 || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat((room.amount - rate) / 2 || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(room.amount || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        )}
      </CardContent>

      <Divider sx={{ my: 2 }} />

      {/* ---- SERVICES TABLE ---- */}
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <LocalMallIcon color="secondary" />
          <Typography variant="subtitle1" fontWeight="bold">
            Services
          </Typography>
        </Box>
        {services.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No service tokens found.
          </Typography>
        ) : (
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>
                    <b>Room No</b>
                  </TableCell>
                  <TableCell>
                    <b>Items</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>SGST (₹)</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>CGST (₹)</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>Total (₹)</b>
                  </TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service, index) => {
                  const itemsString =
                    service.items?.map((i) => i.item).join(', ') || '—';
                  return (
                    <TableRow key={index}>
                      <TableCell>{service.room_no}</TableCell>
                      <TableCell>{itemsString}</TableCell>
                      <TableCell align="right">
                        {parseFloat(service.total_gst / 2 || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(service.total_gst / 2 || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(service.total_amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          disabled={service?.invoice}
                          size="small"
                          color="error"
                          onClick={() => deleteServices(index)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        )}
      </CardContent>

      <Divider sx={{ my: 2 }} />

      {/* ---- FOOD TABLE ---- */}
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <RestaurantIcon color="success" />
          <Typography variant="subtitle1" fontWeight="bold">
            Food Items
          </Typography>
        </Box>
        {foodItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No food tokens found.
          </Typography>
        ) : (
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>
                    <b>Room No</b>
                  </TableCell>
                  {/* <TableCell>
                    <b>Items</b>
                  </TableCell> */}
                  <TableCell>
                    <b>Items</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>SGST (₹)</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>CGST (₹)</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>Total (₹)</b>
                  </TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {foodItems.map((food, index) => {
                  const itemsString =
                    food.items?.map((i) => i.item).join(', ') || '—';
                  return (
                    <TableRow key={index}>
                      <TableCell>{food.room_no}</TableCell>
                      <TableCell>{itemsString}</TableCell>
                      {/* <TableCell>{food.type}</TableCell> */}
                      <TableCell align="right">
                        {parseFloat(food.total_gst / 2 || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(food.total_gst / 2 || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(food.total_amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          disabled={food?.invoice}
                          size="small"
                          color="error"
                          onClick={() =>
                            deleteFoodItems({
                              id: index,
                              orderId: food.orderId,
                            })
                          }
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
}
