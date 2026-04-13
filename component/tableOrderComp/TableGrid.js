import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Chip,
  Badge,
  Fade,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import EditIcon from '@mui/icons-material/Edit';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ChairIcon from '@mui/icons-material/Chair';
import LocalDiningIcon from '@mui/icons-material/LocalDining';

const TableGrid = ({
  tables,
  orders,
  handleCreate,
  handleEdit,
  handleTransferOrder,
  handleOrderInvoice,
  permissions,
  setKotOpen,
  setSelectedKot,
  setViewOpen,
  setSelectedRow,
}) => {
  // Get order count for a table
  const getOrderItemCount = (order) => {
    if (!order?.order_items) return 0;
    return order.order_items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );
  };

  // Get formatted time
  const getOrderDuration = (order) => {
    if (!order?.createdAt) return '';
    const created = new Date(order.createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - created) / 60000);
    if (diffMinutes < 60) return `${diffMinutes}m`;
    return `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m`;
  };

  return (
    <Box>
      {/* Header with stats */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: '#1e3a8a',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            🍽️ Table Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage orders and track table status
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`${tables?.length || 0} Total Tables`}
            size="small"
            variant="outlined"
            icon={<ChairIcon />}
          />
          <Chip
            label={`${orders?.filter((o) => o.token_status === 'Open').length || 0} Active Orders`}
            size="small"
            color="success"
            variant="outlined"
            icon={<LocalDiningIcon />}
          />
        </Box>
      </Box>

      {/* Table Grid with improved scrolling */}
      <Box
        sx={{
          height: { xs: 'auto', md: 'calc(100vh - 200px)' },
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-thumb': {
            background: '#1e3a8a',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
        }}
      >
        <Grid container spacing={3}>
          {tables?.map((table, index) => {
            const activeOrder = orders?.find(
              (o) =>
                o.table?.table_no == table.table_no &&
                o.token_status === 'Open',
            );
            const isAvailable = !activeOrder;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={table.id}>
                <Fade in timeout={index * 100}>
                  <Paper
                    elevation={0}
                    sx={{
                      height: 210,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      background: isAvailable
                        ? 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                        : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      border: '1px solid',
                      borderColor: isAvailable ? '#e5e7eb' : '#86efac',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 25px -12px rgba(0,0,0,0.15)',
                        borderColor: isAvailable ? '#cbd5e1' : '#4ade80',
                      },
                    }}
                  >
                    {/* Table Icon & Number */}
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isAvailable
                            ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
                            : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',

                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 800,
                            color: isAvailable ? '#475569' : 'white',
                            fontSize: 15,
                          }}
                        >
                          {table.table_no}
                        </Typography>
                      </Box>

                      {activeOrder?.temp_room_no && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <QrCodeScannerIcon sx={{ fontSize: 14 }} />
                          Room: {activeOrder?.temp_room_no?.split('|')[1]}
                        </Typography>
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ p: 2, pt: 1, pb: 2 }}>
                      {isAvailable ? (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleCreate(table.documentId)}
                          disabled={!permissions.canCreate}
                          sx={{
                            background: '#1e3a8a',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,

                            fontSize: 12,
                            '&:hover': {
                              background: '#1e3a8a',
                              transform: 'scale(1.02)',
                            },
                            transition: 'transform 0.2s',
                          }}
                        >
                          Create Order
                        </Button>
                      ) : (
                        <Grid container spacing={1}>
                          <Grid size={6}>
                            <Button
                              fullWidth
                              size="small"
                              variant="outlined"
                              startIcon={
                                <RemoveRedEyeIcon sx={{ fontSize: 16 }} />
                              }
                              onClick={() => {
                                setSelectedRow(activeOrder);
                                setViewOpen(true);
                              }}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                borderColor: '#cbd5e1',
                                color: '#475569',
                                '&:hover': {
                                  borderColor: '#667eea',
                                  bgcolor: 'rgba(102, 126, 234, 0.05)',
                                },
                              }}
                            >
                              View
                            </Button>
                          </Grid>
                          <Grid size={6}>
                            <Button
                              fullWidth
                              size="small"
                              variant="outlined"
                              startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                              onClick={() => handleEdit(activeOrder)}
                              disabled={!permissions.canUpdate}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                borderColor: '#cbd5e1',
                                color: '#475569',
                                '&:hover': {
                                  borderColor: '#f59e0b',
                                  bgcolor: 'rgba(245, 158, 11, 0.05)',
                                },
                              }}
                            >
                              Edit
                            </Button>
                          </Grid>
                          <Grid size={6}>
                            <Button
                              fullWidth
                              size="small"
                              variant="contained"
                              onClick={() => {
                                const latestKot =
                                  activeOrder.kots?.[
                                    activeOrder.kots?.length - 1
                                  ];
                                setSelectedKot(latestKot);
                                setKotOpen(true);
                              }}
                              disabled={!permissions.canUpdate}
                              sx={{
                                p: 0,
                                fontSize: 12,
                                borderRadius: 2,
                                textTransform: 'none',
                                bgcolor: '#ef4444',
                                '&:hover': { bgcolor: '#dc2626' },
                              }}
                            >
                              KOT
                            </Button>
                          </Grid>
                          <Grid size={6}>
                            <Button
                              fullWidth
                              size="small"
                              variant="contained"
                              onClick={() => handleTransferOrder(activeOrder)}
                              disabled={!permissions.canUpdate}
                              sx={{
                                p: 0,
                                fontSize: 12,
                                borderRadius: 2,
                                textTransform: 'none',
                                bgcolor: '#8b5cf6',
                                '&:hover': { bgcolor: '#7c3aed' },
                              }}
                            >
                              Transfer
                            </Button>
                          </Grid>
                          <Grid size={12}>
                            <Button
                              fullWidth
                              size="small"
                              variant="contained"
                              onClick={() => handleOrderInvoice(activeOrder)}
                              disabled={!permissions.canUpdate}
                              sx={{
                                p: 0,
                                fontSize: 12,
                                borderRadius: 2,
                                textTransform: 'none',
                                bgcolor: '#10b981',
                                '&:hover': { bgcolor: '#059669' },
                              }}
                            >
                              Bill
                            </Button>
                          </Grid>
                        </Grid>
                      )}
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default TableGrid;
