'use client';
import {
  Box,
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '@/context';
import { GetCustomDate, GetTodaysDate } from '@/utils/DateFetcher';
import { DeleteData, GetDataList } from '@/utils/ApiFunctions';
import { Loader } from '@/component/common';
import { useMemo, useState } from 'react';
import { SuccessToast } from '@/utils/GenerateToast';

const Page = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const [search, setSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const data = GetDataList({
    auth,
    endPoint: 'room-invoices',
  });
  const paymentMethods = GetDataList({
    auth,
    endPoint: 'payment-methods',
  });

  // filter data by name
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.invoice_no?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // handle delete
  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    await DeleteData({
      auth,
      endPoint: 'room-invoices',
      id: selectedRow.documentId,
    });
    SuccessToast('Invoice deleted successfully');
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  const handleCancelDelete = () => {
    setDeleteOpen(false);
    setSelectedRow(null);
  };
  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Room Invoices</Typography>
        </Breadcrumbs>
      </Box>
      {!data || !paymentMethods ? (
        <Loader />
      ) : (
        <Box p={3}>
          {/* Header Section */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <TextField
              size="small"
              label="Search by invoice no"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>

          {/* Data Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  {[
                    'Invoice No',
                    'Date/Time',
                    'Customer Name',
                    'Total Amount',
                    'GST',
                    'Payable Amount',
                    'Payment Method',
                    'Actions',
                  ].map((item, index) => (
                    <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData?.map((row) => {
                  const totalRoomGst = row?.room_tokens.reduce(
                    (sum, r) => sum + (parseFloat(r.gst) || 0),
                    0
                  );
                  const totalServiceGst = row?.service_tokens.reduce(
                    (sum, s) => sum + (parseFloat(s.total_gst) || 0),
                    0
                  );
                  const totalFoodGst = row?.food_tokens.reduce(
                    (sum, f) => sum + (parseFloat(f.total_gst) || 0),
                    0
                  );
                  const payableRoomAmount = row?.room_tokens.reduce(
                    (sum, r) => sum + (parseFloat(r.amount) || 0),
                    0
                  );
                  const payableServiceAmount = row?.service_tokens.reduce(
                    (sum, s) => sum + (parseFloat(s.total_amount) || 0),
                    0
                  );
                  const payableFoodAmount = row?.food_tokens.reduce(
                    (sum, f) => sum + (parseFloat(f.total_amount) || 0),
                    0
                  );

                  const finalGst =
                    totalRoomGst + totalServiceGst + totalFoodGst;

                  const finalTotalAmount =
                    payableRoomAmount +
                    payableServiceAmount +
                    payableFoodAmount;

                  const finalRate = finalTotalAmount - finalGst;

                  return (
                    <TableRow key={row.documentId}>
                      <TableCell>{row.invoice_no}</TableCell>
                      <TableCell>
                        {GetCustomDate(row.date)}&nbsp;{row.time}
                      </TableCell>
                      <TableCell>{row.customer_name}</TableCell>
                      <TableCell>{finalRate.toFixed(2)}</TableCell>
                      <TableCell>{finalGst}</TableCell>
                      <TableCell>{finalTotalAmount}</TableCell>
                      <TableCell>{row.mop}</TableCell>
                      <TableCell sx={{ width: '150px' }}>
                        <Tooltip title="View">
                          <IconButton
                            color="secondary"
                            onClick={() => {
                              setViewData(row);
                              setViewOpen(true);
                            }}
                            size="small"
                          >
                            <VisibilityIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(row)}
                            size="small"
                          >
                            <EditIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(row)}
                            size="small"
                          >
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredData?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No invoice found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteOpen}
            onClose={handleCancelDelete}
            aria-labelledby="delete-dialog-title"
          >
            <DialogTitle id="delete-dialog-title">Delete Invoice</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete
                <strong>{selectedRow?.name}</strong>? This action cannot be
                undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete}>Cancel</Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Create/Edit Dialog */}
          {/* <Dialog
            open={formOpen}
            onClose={() => setFormOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              {editing ? 'Edit Invoice' : 'Create Invoice'}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom>
                Invoice Info
              </Typography>
              <Grid container spacing={2} mb={2}>
                <Grid item size={{ xs: 12, sm: 4 }}>
                  <Typography>
                    Invoice No: <b>{formData.invoice_no}</b>
                  </Typography>
                </Grid>
                <Grid item size={{ xs: 12, sm: 4 }}>
                  <Typography>
                    Date: <b>{GetCustomDate(formData.date)}</b>
                  </Typography>
                </Grid>
                <Grid item size={{ xs: 12, sm: 4 }}>
                  <Typography>
                    Time: <b>{formData.time}</b>
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Customer Info
              </Typography>
              <Grid container spacing={2} mb={2}>
                <Grid item size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Customer Name"
                    size="small"
                    fullWidth
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_name: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Phone"
                    size="small"
                    fullWidth
                    value={formData.customer_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_phone: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="GST No"
                    size="small"
                    fullWidth
                    value={formData.customer_gst}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_gst: e.target.value })
                    }
                  />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Address"
                    size="small"
                    fullWidth
                    value={formData.customer_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_address: e.target.value,
                      })
                    }
                  />
                </Grid>
              </Grid>

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

              {formData.menu_items?.length > 0 && (
                <TableContainer
                  component={Paper}
                  sx={{ borderRadius: 1, mb: 3 }}
                >
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
                      {formData.menu_items.map((item, idx) => (
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
                                const updated = [...formData.menu_items];
                                updated[idx].rate = newRate;
                                updated[idx].amount =
                                  updated[idx].qty * newRate +
                                  (updated[idx].qty *
                                    newRate *
                                    updated[idx].gst) /
                                    100;
                                setFormData({
                                  ...formData,
                                  menu_items: updated,
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
                                const updated = [...formData.menu_items];
                                updated[idx].qty = newQty;
                                updated[idx].amount =
                                  newQty * item.rate +
                                  (newQty * item.rate * updated[idx].gst) / 100;
                                setFormData({
                                  ...formData,
                                  menu_items: updated,
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
                                const updated = [...formData.menu_items];
                                updated[idx].gst = newGst;
                                updated[idx].amount =
                                  updated[idx].qty * item.rate +
                                  (updated[idx].qty * item.rate * newGst) / 100;
                                setFormData({
                                  ...formData,
                                  menu_items: updated,
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
                                const updated = formData.menu_items.filter(
                                  (_, i) => i !== idx
                                );
                                setFormData({
                                  ...formData,
                                  menu_items: updated,
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

              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              {(() => {
                const totalAmount = formData.menu_items.reduce(
                  (acc, cur) => acc + cur.rate * cur.qty,
                  0
                );
                const tax = formData.menu_items.reduce(
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

              <Typography variant="h6" gutterBottom>
                Payment
              </Typography>
              <Grid container spacing={2}>
                <Grid item size={{ xs: 12 }}>
                  <TextField
                    select
                    margin="dense"
                    label="Mode Of Payment"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.mop}
                    onChange={(e) =>
                      setFormData({ ...formData, mop: e.target.value })
                    }
                    SelectProps={{ native: true }}
                  >
                    <option value="">-- Select --</option>
                    {paymentMethods?.map((cat) => (
                      <option key={cat.documentId} value={cat.name}>
                        {cat?.name}
                      </option>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} variant="contained">
                {editing ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog> */}

          {/* view invoice dialog */}
          {/* <Dialog
            open={viewOpen}
            onClose={() => setViewOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Invoice: {viewData?.invoice_no}</DialogTitle>
            <DialogContent dividers>
              {viewData && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Date: {viewData.date} | Time: {viewData.time}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Customer: {viewData.customer_name} (
                    {viewData.customer_phone})
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    GST: {viewData.customer_gst}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Address: {viewData.customer_address}
                  </Typography>

                
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>HSN</TableCell>
                          <TableCell>Rate</TableCell>
                          <TableCell>Qty</TableCell>
                          <TableCell>GST %</TableCell>
                          <TableCell>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {viewData.menu_items?.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.item}</TableCell>
                            <TableCell>{item.hsn}</TableCell>
                            <TableCell>{item.rate}</TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>{item.gst}</TableCell>
                            <TableCell>{item.amount.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                 
                  <Box mt={2}>
                    <Typography>Total: ₹{viewData.total_amount}</Typography>
                    <Typography>GST: ₹{viewData.tax}</Typography>
                    <Typography>Payable: ₹{viewData.payable_amount}</Typography>
                    <Typography>Payment Method: {viewData.mop}</Typography>
                  </Box>
                  <div style={{ display: 'none' }}>
                    <RestaurantPosInvoice
                      ref={componentRef}
                      invoice={viewData}
                      profile={myProfile}
                      size="58mm"
                    />
                  </div>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewOpen(false)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                Print Invoice
              </Button>
            </DialogActions>
          </Dialog> */}
        </Box>
      )}
    </>
  );
};

export default Page;
