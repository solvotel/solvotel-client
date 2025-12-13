import { UpdateData } from '@/utils/ApiFunctions';
import { SuccessToast } from '@/utils/GenerateToast';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

const TransferOrder = ({
  auth,
  transferOpen,
  setTransferOpen,
  selectedRow,
  setSelectedRow,
  activeRooms,
  selectedBooking,
  setSelectedBooking,
  selectedRoom,
  setSelectedRoom,
  bookings,
}) => {
  const handleConfirmTransfer = async () => {
    if (!selectedRow || !selectedBooking || !selectedRoom) return;
    const booking = bookings?.find((b) => {
      return b.documentId === selectedBooking;
    });

    try {
      await UpdateData({
        auth,
        endPoint: 'table-orders',
        id: selectedRow.documentId,
        payload: {
          data: {
            closing_method: 'Room Transfer',
            token_status: 'Closed',
            room_no: selectedRoom,
            room_booking: selectedBooking,
          },
        },
      });

      const total_rate = selectedRow.food_items.reduce(
        (acc, item) => acc + item.rate * item.qty,
        0
      );

      // recalc before save

      const total_amount = selectedRow.food_items.reduce(
        (acc, item) => acc + item.amount,
        0
      );

      const total_gst = total_amount - total_rate;

      // ✅ Clean menu_items (remove id/documentId/etc.)
      const cleanedMenuItems = selectedRow.food_items.map(
        ({ id, documentId, room, ...rest }) => rest
      );
      const prevFood = booking?.food_tokens || [];
      await UpdateData({
        auth,
        endPoint: 'room-bookings',
        id: selectedBooking,
        payload: {
          data: {
            food_tokens: [
              ...prevFood,
              {
                id: new Date().getTime().toString(36),
                room_no: selectedRoom,
                type: 'Room Transfer',
                orderId: selectedRow.documentId,
                total_gst: parseFloat(total_gst).toFixed(2) || 0,
                total_amount: parseFloat(total_amount).toFixed(2) || 0,
                invoice: false,
                items: cleanedMenuItems,
              },
            ],
          },
        },
      });
      SuccessToast('Order transferred successfully');
      setTransferOpen(false);
      setSelectedRow(null);
      setSelectedBooking(null);
      setSelectedRoom('');
    } catch (err) {
      console.error('Error transferring order:', err);
      ErrorToast('Failed to transfer order. Please try again.');
      return;
    }
  };
  return (
    <>
      <Dialog
        open={transferOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedRow(null);
        }}
        aria-labelledby="transfer-dialog-title"
      >
        <DialogTitle id="transfer-dialog-title">Transfer Order</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, width: '250px' }}>
            <TextField
              select
              margin="dense"
              label="Select Room No"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={
                selectedBooking && selectedRoom
                  ? `${selectedBooking}|${selectedRoom}`
                  : ''
              }
              onChange={(e) => {
                const [booking_id, roomNo] = e.target.value.split('|');
                setSelectedBooking(booking_id);
                setSelectedRoom(roomNo);
              }}
              SelectProps={{ native: true }}
            >
              <option value="">-- Select --</option>
              {activeRooms?.map((room, index) => (
                <option
                  key={`${room.booking_id}-${room.room_no}-${index}`}
                  value={`${room.booking_id}|${room.room_no}`}
                >
                  {room.room_no}
                </option>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setTransferOpen(false);
              setSelectedRow(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmTransfer}
            color="primary"
            variant="contained"
          >
            Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TransferOrder;
