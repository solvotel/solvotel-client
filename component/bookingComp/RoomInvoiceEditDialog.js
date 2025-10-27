import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Divider,
  Box,
} from '@mui/material';

export default function EditRoomInvoiceDialog({
  editOpen,
  setEditOpen,
  editData,
  setEditData,
  paymentMethods,
  handleSaveEdit,
}) {
  if (!editData) return null;

  // 💡 Combine tokens for table view/edit
  const combinedTokens = [];

  // Room Tokens
  editData.room_tokens?.forEach((r, idx) => {
    combinedTokens.push({
      key: `room-${idx}`,
      type: 'Room',
      room: r.room,
      item: r.item,
      hsn: r.hsn,
      rate: r.rate,
      qty: r.days || 1,
      gst: r.gst,
      amount: r.amount,
    });
  });

  // Service Tokens
  editData.service_tokens?.forEach((s, sIndex) => {
    s.items?.forEach((it, iIndex) => {
      combinedTokens.push({
        key: `service-${sIndex}-${iIndex}`,
        type: 'Service',
        room: s.room_no,
        item: it.item,
        hsn: it.hsn,
        rate: it.rate,
        qty: 1,
        gst: it.gst,
        amount: it.amount,
      });
    });
  });

  // Food Tokens
  editData.food_tokens?.forEach((f, fIndex) => {
    f.items?.forEach((it, iIndex) => {
      combinedTokens.push({
        key: `food-${fIndex}-${iIndex}`,
        type: f.type,
        room: f.room_no,
        item: it.item,
        hsn: it.hsn,
        rate: it.rate,
        qty: it.qty,
        gst: it.gst,
        amount: it.amount,
      });
    });
  });

  // 🧮 Calculate Totals
  const subtotal = combinedTokens.reduce(
    (a, b) => a + Number(b.rate * b.qty),
    0
  );
  const totalGst = combinedTokens.reduce(
    (a, b) => a + (Number(b.rate * b.qty) * b.gst) / 100,
    0
  );
  const payable = subtotal + totalGst;

  const handleItemChange = (key, field, value) => {
    const updated = combinedTokens.map((t) => {
      if (t.key === key) {
        return {
          ...t,
          [field]: value,
          amount:
            field === 'rate' || field === 'qty' || field === 'gst'
              ? ((value || t.rate) * (t.qty || 1) * (1 + t.gst / 100)).toFixed(
                  2
                )
              : t.amount,
        };
      }
      return t;
    });
    setEditData({ ...editData, updatedTokens: updated });
  };

  return (
    <Dialog
      open={editOpen}
      onClose={() => setEditOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Edit Invoice</DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          🧾 Invoice: {editData.invoice_no}
        </Typography>

        {/* Customer Fields */}
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Customer Name"
              value={editData.customer_name || ''}
              onChange={(e) =>
                setEditData({ ...editData, customer_name: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Customer Phone"
              value={editData.customer_phone || ''}
              onChange={(e) =>
                setEditData({ ...editData, customer_phone: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Customer GST"
              value={editData.customer_gst || ''}
              onChange={(e) =>
                setEditData({ ...editData, customer_gst: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Customer Address"
              value={editData.customer_address || ''}
              onChange={(e) =>
                setEditData({ ...editData, customer_address: e.target.value })
              }
            />
          </Grid>
          <Grid size={12}>
            <TextField
              select
              fullWidth
              size="small"
              label="Mode of Payment"
              value={editData.mop || ''}
              onChange={(e) =>
                setEditData({ ...editData, mop: e.target.value })
              }
              SelectProps={{ native: true }}
            >
              <option value="">-- Select --</option>
              {paymentMethods?.map((pm) => (
                <option key={pm.documentId} value={pm.name}>
                  {pm.name}
                </option>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Editable Table */}
        <Typography variant="h6" gutterBottom>
          🧮 Edit Charges
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Room</strong>
                </TableCell>
                <TableCell>
                  <strong>Item</strong>
                </TableCell>
                <TableCell>
                  <strong>HSN</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Rate</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Qty</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>GST %</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Amount</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {combinedTokens.map((row) => (
                <TableRow key={row.key}>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.room}</TableCell>
                  <TableCell>{row.item}</TableCell>
                  <TableCell>{row.hsn}</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={row.rate}
                      onChange={(e) =>
                        handleItemChange(
                          row.key,
                          'rate',
                          Number(e.target.value)
                        )
                      }
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={row.qty}
                      onChange={(e) =>
                        handleItemChange(row.key, 'qty', Number(e.target.value))
                      }
                      sx={{ width: 60 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={row.gst}
                      onChange={(e) =>
                        handleItemChange(row.key, 'gst', Number(e.target.value))
                      }
                      sx={{ width: 60 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    ₹{Number(row.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals Section */}
        <Box mt={3}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6">💰 Summary</Typography>
          <Typography>Total Amount: ₹{subtotal.toFixed(2)}</Typography>
          <Typography>Tax (GST): ₹{totalGst.toFixed(2)}</Typography>
          <Typography fontWeight="bold" color="primary">
            Payable Amount: ₹{payable.toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setEditOpen(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleSaveEdit}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
