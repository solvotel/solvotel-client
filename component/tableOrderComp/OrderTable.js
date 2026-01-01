import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Link from 'next/link';

const OrderTable = ({ orders, handleEdit, setSelectedRow, setDeleteOpen }) => {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          📋 Table Orders
        </Typography>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Table size="small">
          <TableHead
            sx={{
              background: 'linear-gradient(135deg, #ffb74d, #ff7043)',
            }}
          >
            <TableRow>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>
                Table
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>
                Status
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>
                Method
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>
                Amount
              </TableCell>
              <TableCell
                sx={{
                  color: '#fff',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const totalAmount = order.food_items?.reduce(
                (sum, item) => sum + item.amount,
                0
              );

              return (
                <TableRow
                  key={order.id}
                  sx={{
                    '&:hover': { backgroundColor: '#f1f8ff' },
                    transition: '0.2s',
                  }}
                >
                  <TableCell>{order.order_id}</TableCell>
                  <TableCell>{order.table?.table_no}</TableCell>
                  <TableCell>
                    <Chip
                      sx={{
                        fontSize: 10,
                      }}
                      label={order.token_status}
                      color={
                        order.token_status === 'Closed'
                          ? 'secondary'
                          : order.token_status === 'Open'
                          ? 'success'
                          : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {order.token_status === 'Closed' && (
                      <>
                        {order.closing_method || '-'}&nbsp;
                        {(order?.room_booking?.booking_id ||
                          order?.restaurant_invoice?.invoice_no) && (
                          <Link
                            href={
                              order?.room_booking
                                ? `/front-office/room-booking/${order.room_booking.documentId}`
                                : `/restaurant/invoices/${order.restaurant_invoice.documentId}`
                            }
                            style={{
                              fontSize: 10,
                              color: 'blue',
                              textDecoration: 'none',
                            }}
                          >
                            (
                            {order?.room_booking?.booking_id ||
                              order?.restaurant_invoice?.invoice_no}
                            )
                          </Link>
                        )}
                      </>
                    )}
                  </TableCell>
                  <TableCell>₹{totalAmount.toFixed(2) || 0}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleEdit(order)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => {
                        setSelectedRow(order);
                        setDeleteOpen(true);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default OrderTable;
