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
}) => {
  const handleConfirmTransfer = async () => {
    if (!selectedRow || !selectedBooking || !selectedRoom) return;
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
