import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Table,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';

const CreateNewOrder = ({
  formOpen,
  setFormOpen,
  editing,
  formData,
  setFormData,
  tables,
  menuItems,
  selectedItem,
  setSelectedItem,
  handleSave,
}) => {
  const handleItemSelect = () => {
    if (!selectedItem) return;
    const itemObj = menuItems.find((m) => m.documentId === selectedItem);
    if (!itemObj) return;

    const rate = itemObj.rate || 0;
    const gstPercent = itemObj.gst || 0;
    const gstValue = (rate * gstPercent) / 100;

    const newItem = {
      item: itemObj.item,
      hsn: itemObj.hsn || '',
      rate,
      qty: 1,
      gst: gstPercent,
      amount: rate + gstValue,
    };

    setFormData({
      ...formData,
      food_items: [...formData.food_items, newItem],
    });

    setSelectedItem('');
  };
  return (
    <>
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editing ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2, width: '250px' }}>
            <TextField
              select
              margin="dense"
              label="Select Table"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.table || ''}
              onChange={(e) =>
                setFormData({ ...formData, table: e.target.value })
              }
              SelectProps={{ native: true }}
            >
              <option value="">-- Select --</option>
              {tables?.map((table) => (
                <option key={table.documentId} value={table.documentId}>
                  {table?.table_no}
                </option>
              ))}
            </TextField>
          </Box>
          {/* Items Section */}
          <Typography variant="h6" gutterBottom>
            Items
          </Typography>
          <Grid container spacing={2} alignItems="center" mb={2}>
            <Grid item size={{ xs: 10 }}>
              <TextField
                select
                margin="dense"
                label="Select Menu Item"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={selectedItem || ''}
                onChange={(e) => setSelectedItem(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="">-- Select --</option>
                {menuItems?.map((cat) => (
                  <option key={cat.documentId} value={cat.documentId}>
                    {cat?.item}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item size={{ xs: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleItemSelect}
              >
                Add
              </Button>
            </Grid>
          </Grid>

          {formData.food_items?.length > 0 && (
            <TableContainer component={Paper} sx={{ borderRadius: 1, mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {[
                      'Name',
                      'HSN',
                      'Rate',
                      'Qty',
                      'GST %',
                      'Total',
                      'Actions',
                    ].map((h) => (
                      <TableCell key={h}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.food_items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.item}</TableCell>
                      <TableCell>{item.hsn}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={item.rate}
                          onChange={(e) => {
                            const newRate = parseFloat(e.target.value) || 0;
                            const updated = [...formData.food_items];
                            updated[idx].rate = newRate;
                            updated[idx].amount =
                              updated[idx].qty * newRate +
                              (updated[idx].qty * newRate * updated[idx].gst) /
                                100;
                            setFormData({
                              ...formData,
                              food_items: updated,
                            });
                          }}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={item.qty}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 1;
                            const updated = [...formData.food_items];
                            updated[idx].qty = newQty;
                            updated[idx].amount =
                              newQty * item.rate +
                              (newQty * item.rate * updated[idx].gst) / 100;
                            setFormData({
                              ...formData,
                              food_items: updated,
                            });
                          }}
                          sx={{ width: 60 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={item.gst}
                          onChange={(e) => {
                            const newGst = parseFloat(e.target.value) || 0;
                            const updated = [...formData.food_items];
                            updated[idx].gst = newGst;
                            updated[idx].amount =
                              updated[idx].qty * item.rate +
                              (updated[idx].qty * item.rate * newGst) / 100;
                            setFormData({
                              ...formData,
                              food_items: updated,
                            });
                          }}
                          sx={{ width: 60 }}
                        />
                      </TableCell>
                      <TableCell>{item.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => {
                            const updated = formData.food_items.filter(
                              (_, i) => i !== idx
                            );
                            setFormData({
                              ...formData,
                              food_items: updated,
                            });
                          }}
                          size="small"
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Summary Section */}
          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          {(() => {
            const totalAmount = formData.food_items.reduce(
              (acc, cur) => acc + cur.rate * cur.qty,
              0
            );
            const tax = formData.food_items.reduce(
              (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
              0
            );
            const payable = totalAmount + tax;

            return (
              <Grid container spacing={2} mb={2}>
                <Grid item size={{ xs: 12, sm: 4 }}>
                  <Typography>
                    Total: <b>{totalAmount.toFixed(2)}</b>
                  </Typography>
                </Grid>
                <Grid item size={{ xs: 12, sm: 4 }}>
                  <Typography>
                    GST: <b>{tax.toFixed(2)}</b>
                  </Typography>
                </Grid>
                <Grid item size={{ xs: 12, sm: 4 }}>
                  <Typography>
                    Payable: <b>{payable.toFixed(2)}</b>
                  </Typography>
                </Grid>
              </Grid>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateNewOrder;
