import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { KOTPrint } from '../printables/KOTPrint';

const KOTPrintDialog = ({ open, setOpen, selectedKot, setSelectedKot }) => {
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `KOT-${selectedKot?.kot_number || 'Print'}`,
  });

  if (!selectedKot) return null;

  const typeLabel = selectedKot.type === 'new' ? '🆕 NEW' : '📝 UPDATE';
  const tableNo =
    selectedKot.table_no ||
    selectedKot.table?.table_no ||
    selectedKot.table_order?.table?.table_no ||
    selectedKot.table_order?.table_no ||
    selectedKot.table_order?.table ||
    null;

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Kitchen Order Ticket (KOT)</DialogTitle>
        <DialogContent dividers>
          {/* Print Content */}

          <Box
            ref={printRef}
            sx={{
              p: 2,
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: '#fafafa',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                KITCHEN ORDER TICKET
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                KOT #{selectedKot.kot_number}
              </Typography>
              {tableNo && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Table: {tableNo}
                </Typography>
              )}
              <Typography
                variant="caption"
                sx={{
                  display: 'inline-block',
                  mt: 0.5,
                  px: 1,
                  py: 0.3,
                  backgroundColor:
                    selectedKot.type === 'new' ? '#4caf50' : '#ff9800',
                  color: 'white',
                  borderRadius: 1,
                  fontWeight: 'bold',
                }}
              >
                {typeLabel}
              </Typography>
            </Box>

            {/* Items */}
            <TableContainer component={Paper} sx={{ mb: 2, border: 'none' }}>
              <Table size="small" sx={{ '& td': { border: '1px solid #ddd' } }}>
                <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      Qty
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedKot.items?.map((item, idx) => {
                    const name =
                      item.name ||
                      item.item ||
                      item.itemName ||
                      (item.menu_item && item.menu_item.item) ||
                      String(item);
                    const qtyRaw =
                      item.qty ?? item.quantity ?? item.qtyString ?? '';
                    const qty =
                      typeof qtyRaw === 'string' ? qtyRaw : `+${qtyRaw}`;

                    return (
                      <TableRow key={idx}>
                        <TableCell>{name}</TableCell>
                        <TableCell align="right">{qty}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footer */}
            <Box
              sx={{
                textAlign: 'center',
                mt: 2,
                pt: 2,
                borderTop: '2px dashed #999',
              }}
            >
              <Typography variant="caption" sx={{ display: 'block' }}>
                {new Date().toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              setSelectedKot(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handlePrint}>
            🖨️ Print
          </Button>
        </DialogActions>
      </Dialog>
      <KOTPrint
        ref={printRef}
        kotData={selectedKot}
        tableNo={tableNo}
        size="80mm"
      />
    </>
  );
};

export default KOTPrintDialog;
