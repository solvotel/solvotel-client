import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Divider,
  Chip,
  IconButton,
  Box,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import React from 'react';

const ViewTableOrder = ({ open, setOpen, selectedRow, setSelectedRow }) => {
  const theme = useTheme();

  // Calculate totals
  const calculateTotals = () => {
    const totalAmount =
      selectedRow?.food_items?.reduce(
        (acc, cur) => acc + cur.rate * cur.qty,
        0,
      ) || 0;
    const tax =
      selectedRow?.food_items?.reduce(
        (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
        0,
      ) || 0;
    const payable = totalAmount + tax;
    return { totalAmount, tax, payable };
  };

  const { totalAmount, tax, payable } = calculateTotals();

  // Format date if available
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        },
      }}
    >
      {/* Header with gradient */}
      <Box
        sx={{
          background: '#1e3a8a',
          color: 'white',
          position: 'relative',
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <ReceiptLongIcon sx={{ fontSize: 24 }} />
              <Typography variant="h6" fontWeight={700}>
                Order Details
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                setOpen(false);
                setSelectedRow(null);
              }}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Order Info Cards */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCodeScannerIcon sx={{ fontSize: 16, opacity: 0.9 }} />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.8, fontSize: '0.7rem' }}
                  >
                    Table No.
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight={700}
                    lineHeight={1.2}
                    sx={{ fontSize: '0.9rem' }}
                  >
                    {selectedRow?.table?.table_no || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 16, opacity: 0.9 }} />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.8, fontSize: '0.7rem' }}
                  >
                    Order Time
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    lineHeight={1.2}
                    sx={{ fontSize: '0.8rem' }}
                  >
                    {formatDate(selectedRow?.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalOfferIcon sx={{ fontSize: 16, opacity: 0.9 }} />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.8, fontSize: '0.7rem' }}
                  >
                    Order Status
                  </Typography>
                  <Chip
                    label={selectedRow?.token_status || 'Open'}
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: alpha('#fff', 0.2),
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 20,
                      '& .MuiChip-label': { px: 1, fontSize: '0.7rem' },
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <DialogContent dividers={false} sx={{ p: 0 }}>
        {/* Items Section */}
        <Box sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <RestaurantMenuIcon sx={{ color: '#667eea', fontSize: 20 }} />
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.primary"
              sx={{ fontSize: '0.95rem' }}
            >
              Order Items
            </Typography>
            <Chip
              label={`${selectedRow?.food_items?.length || 0} items`}
              size="small"
              sx={{
                ml: 1,
                bgcolor: alpha('#667eea', 0.1),
                color: '#667eea',
                fontSize: '0.7rem',
                height: 22,
                '& .MuiChip-label': { fontSize: '0.7rem', px: 1 },
              }}
            />
          </Box>

          {selectedRow?.food_items?.length > 0 ? (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                overflow: 'hidden',
                mb: 3,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha('#667eea', 0.05) }}>
                    {['Item', 'HSN', 'Rate', 'Qty', 'GST', 'Total'].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          fontWeight: 700,
                          color: 'text.secondary',
                          borderBottom: `2px solid ${alpha('#667eea', 0.2)}`,
                          fontSize: '0.75rem',
                          py: 1.5,
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedRow?.food_items.map((item, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha('#667eea', 0.02),
                        },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>
                        <Typography
                          fontWeight={500}
                          sx={{ fontSize: '0.8rem' }}
                        >
                          {item.item}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', py: 1 }}>
                        <Chip
                          label={item.hsn}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.65rem',
                            height: 20,
                            '& .MuiChip-label': { fontSize: '0.65rem' },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <CurrencyRupeeIcon
                            sx={{ fontSize: 11, color: 'text.secondary' }}
                          />
                          <Typography sx={{ fontSize: '0.8rem' }}>
                            {item.rate}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>
                        <Typography
                          fontWeight={500}
                          sx={{ fontSize: '0.8rem' }}
                        >
                          {item.qty}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', py: 1 }}>
                        <Chip
                          label={`${item.gst}%`}
                          size="small"
                          sx={{
                            bgcolor: alpha('#f59e0b', 0.1),
                            color: '#f59e0b',
                            fontSize: '0.65rem',
                            height: 20,
                            '& .MuiChip-label': { fontSize: '0.65rem' },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <CurrencyRupeeIcon
                            sx={{ fontSize: 11, color: 'text.secondary' }}
                          />
                          <Typography
                            fontWeight={600}
                            sx={{ fontSize: '0.8rem' }}
                          >
                            {item.amount}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: alpha('#f5f5f5', 0.5),
                borderRadius: 3,
                mb: 3,
              }}
            >
              <RestaurantMenuIcon
                sx={{ fontSize: 40, color: '#cbd5e1', mb: 1 }}
              />
              <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                No items in this order
              </Typography>
            </Paper>
          )}

          <Divider sx={{ my: 2.5 }} />

          {/* Summary Section */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.primary"
              gutterBottom
              sx={{ fontSize: '0.95rem' }}
            >
              Payment Summary
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: alpha('#667eea', 0.03),
                    borderRadius: 3,
                    border: `1px solid ${alpha('#667eea', 0.1)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Bill Breakdown
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.8rem' }}>
                      Subtotal
                    </Typography>
                    <Typography fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                      ₹{totalAmount?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.8rem' }}>
                      SGST ({((tax / 2 / totalAmount) * 100).toFixed(1)}%)
                    </Typography>
                    <Typography fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                      ₹{(tax / 2)?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.8rem' }}>
                      CGST ({((tax / 2 / totalAmount) * 100).toFixed(1)}%)
                    </Typography>
                    <Typography fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                      ₹{(tax / 2)?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 0.5,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{ fontSize: '0.85rem' }}
                    >
                      Total Payable
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      sx={{ color: '#667eea', fontSize: '1.1rem' }}
                    >
                      ₹{payable?.toFixed(2)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: alpha('#10b981', 0.03),
                    borderRadius: 3,
                    border: `1px solid ${alpha('#10b981', 0.1)}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Tax Summary
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.8rem' }}>
                      Total Taxable Value
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem' }}>
                      ₹{totalAmount?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography sx={{ fontSize: '0.8rem' }}>
                      Total Tax Amount
                    </Typography>
                    <Typography
                      fontWeight={600}
                      color="#f59e0b"
                      sx={{ fontSize: '0.8rem' }}
                    >
                      + ₹{tax?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      Inclusive of all taxes
                    </Typography>
                    <Chip
                      label="GST Compliant"
                      size="small"
                      sx={{
                        bgcolor: alpha('#10b981', 0.1),
                        color: '#10b981',
                        fontSize: '0.65rem',
                        height: 20,
                        '& .MuiChip-label': { fontSize: '0.65rem', px: 1 },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 2, bgcolor: alpha('#f8f9fa', 0.5) }}>
        <Button
          onClick={() => {
            setOpen(false);
            setSelectedRow(null);
          }}
          variant="outlined"
          size="small"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8rem',
            px: 2.5,
            borderColor: alpha('#667eea', 0.3),
            color: '#667eea',
            '&:hover': {
              borderColor: '#667eea',
              bgcolor: alpha('#667eea', 0.05),
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewTableOrder;
