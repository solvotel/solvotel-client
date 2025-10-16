import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const TableGrid = ({
  tables,
  orders,
  handleCreate,
  handleEdit,
  handleTransferOrder,
  handleOrderInvoice,
}) => {
  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        🪑 Tables
      </Typography>

      <Box
        sx={{
          height: { xs: 'auto', md: 'calc(100vh - 200px)' },
          overflowY: 'auto',

          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#bdbdbd',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-track': { backgroundColor: '#eeeeee' },
        }}
      >
        <Grid container spacing={2} mt={1}>
          {tables?.map((table) => {
            const activeOrder = orders?.find(
              (o) =>
                o.table?.table_no == table.table_no && o.token_status === 'Open'
            );
            const isAvailable = !activeOrder;

            return (
              <Grid size={{ xs: 6, sm: 6, md: 3 }} key={table.id}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 1.5,
                    height: 110,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'center',
                    background: isAvailable
                      ? '#e8e8e8ff' // cool grey-blue for available
                      : '#b0e7b0ff', // soft green for active
                    color: isAvailable ? '#333' : '#1a3e1a',
                    borderRadius: 2,
                    border: isAvailable
                      ? '1px solid #d0d7de'
                      : '1px solid #7ecb7e',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer',
                  }}
                >
                  {/* Table Number */}
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      fontSize: 16,
                    }}
                  >
                    {table.table_no}
                  </Typography>

                  {isAvailable ? (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleCreate(table.documentId)}
                      sx={{
                        mt: 1,
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                        color: '#fff',
                        px: 1.5,
                        py: 0.3,
                      }}
                    >
                      New Token
                    </Button>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Button
                        onClick={() => handleEdit(activeOrder)}
                        size="small"
                        variant="contained"
                        color="success"
                        // startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                        sx={{
                          fontSize: 12,
                          borderRadius: 2,
                          textTransform: 'none',
                          px: 1.5,
                          py: 0.3,
                        }}
                      >
                        Update
                      </Button>

                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button
                          onClick={() => handleTransferOrder(activeOrder)}
                          size="small"
                          variant="contained"
                          color="secondary"
                          sx={{
                            fontSize: 12,
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 1.5,
                            py: 0.3,
                          }}
                        >
                          Transfer
                        </Button>
                        <Button
                          onClick={() => handleOrderInvoice(activeOrder)}
                          size="small"
                          variant="contained"
                          color="error"
                          sx={{
                            fontSize: 12,
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 1.5,
                            py: 0.3,
                          }}
                        >
                          Invoice
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </>
  );
};

export default TableGrid;
