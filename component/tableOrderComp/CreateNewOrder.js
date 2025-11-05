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

    const rate = parseFloat(itemObj.rate) || 0;
    const gstPercent = parseFloat(itemObj.gst) || 0;
    const amount = rate + (rate * gstPercent) / 100;

    const newItem = {
      item: itemObj.item,
      hsn: itemObj.hsn || '',
      rate,
      qty: 1,
      gst: gstPercent,
      amount: parseFloat(amount.toFixed(2)),
    };

    setFormData({
      ...formData,
      food_items: [...formData.food_items, newItem],
    });

    setSelectedItem('');
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.food_items];
    const item = { ...updated[index] };
    const numericValue = parseFloat(value) || 0;

    item[field] = numericValue;

    const rate = parseFloat(item.rate) || null;
    const qty = parseFloat(item.qty) || 1;
    const gst = parseFloat(item.gst) || null;
    const amount = parseFloat(item.amount) || null;

    if (field === 'rate' || field === 'gst' || field === 'qty') {
      // Forward calculation
      const newAmount = qty * rate * (1 + gst / 100);
      item.amount = parseFloat(newAmount.toFixed(2));
    } else if (field === 'amount') {
      // Reverse calculation
      const base = amount / qty;
      const newRate = base / (1 + gst / 100);
      item.rate = parseFloat(newRate.toFixed(2));
    }

    updated[index] = item;
    setFormData({ ...formData, food_items: updated });
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

                      {/* Rate */}
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(idx, 'rate', e.target.value)
                          }
                          sx={{ width: 80 }}
                        />
                      </TableCell>

                      {/* Qty */}
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={item.qty}
                          onChange={(e) =>
                            handleItemChange(idx, 'qty', e.target.value)
                          }
                          sx={{ width: 60 }}
                        />
                      </TableCell>

                      {/* GST */}
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={item.gst}
                          onChange={(e) =>
                            handleItemChange(idx, 'gst', e.target.value)
                          }
                          sx={{ width: 60 }}
                        />
                      </TableCell>

                      {/* Total (Editable for reverse calc) */}
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={item.amount}
                          onChange={(e) =>
                            handleItemChange(idx, 'amount', e.target.value)
                          }
                          sx={{ width: 100 }}
                        />
                      </TableCell>

                      {/* Delete */}
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
                <Grid item size={{ xs: 12, sm: 3 }}>
                  <Typography>
                    Total: <b>{totalAmount.toFixed(2)}</b>
                  </Typography>
                </Grid>
                <Grid item size={{ xs: 12, sm: 3 }}>
                  <Typography>
                    SGST: <b>{(tax / 2).toFixed(2)}</b>
                  </Typography>
                </Grid>
                <Grid item size={{ xs: 12, sm: 3 }}>
                  <Typography>
                    CGST: <b>{(tax / 2).toFixed(2)}</b>
                  </Typography>
                </Grid>
                <Grid item size={{ xs: 12, sm: 3 }}>
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
