'use client';

import { useAuth } from '@/context';
import { GetDataList } from '@/utils/ApiFunctions';
import { useState, useRef } from 'react';

// mui
import {
  Box,
  Button,
  Breadcrumbs,
  Link,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Loader } from '@/component/common';
import { GetTodaysDate } from '@/utils/DateFetcher';
import { useReactToPrint } from 'react-to-print';
import { exportToExcel } from '@/utils/exportToExcel';
import { CollectionReportPrint } from '@/component/printables/CollectionReportPrint';

const CollectionReportPage = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;

  // Fetch both room and restaurant invoices
  const roomBookings = GetDataList({
    auth,
    endPoint: 'room-bookings',
  });
  const restaurantInvoices = GetDataList({
    auth,
    endPoint: 'restaurant-invoices',
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(todaysDate);
  const [filteredData, setFilteredData] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [selectedMop, setSelectedMop] = useState('');
  const [dataToExport, setDataToExport] = useState([]);
  const [stats, setStats] = useState({});

  const handleSearch = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const allPayments = [];

    // 🟢 ROOM BOOKINGS
    roomBookings?.forEach((booking) => {
      // payment_tokens
      booking.payment_tokens?.forEach((p) => {
        const date = new Date(p.date);

        if (date >= start && date <= end) {
          allPayments.push({
            documentId: booking.documentId,
            uid: booking.booking_id,
            type: 'Room',
            customer_name: booking.customer?.name || 'N/A',
            time_stamp: date.toISOString(),
            mop: p.mode,
            amount: Number(p.amount) || 0,
          });
        }
      });

      // advance_payment
      if (booking.advance_payment) {
        const ap = booking.advance_payment;
        const date = new Date(ap.date);

        if (date >= start && date <= end) {
          allPayments.push({
            documentId: booking.documentId,
            uid: booking.booking_id,
            type: 'Room',
            customer_name: booking.customer?.name || 'N/A',
            time_stamp: date.toISOString(),
            mop: ap.mode,
            amount: Number(ap.amount) || 0,
          });
        }
      }
    });

    // 🟡 RESTAURANT INVOICES
    restaurantInvoices?.forEach((inv) => {
      // new payments array
      if (inv.payments?.length) {
        inv.payments.forEach((p) => {
          const date = new Date(p.time_stamp);

          if (date >= start && date <= end) {
            allPayments.push({
              documentId: inv.documentId,
              uid: inv.invoice_no,
              type: 'Restaurant',
              customer_name: inv.customer_name || 'N/A',
              time_stamp: p.time_stamp,
              mop: p.mop,
              amount: Number(p.amount) || 0,
            });
          }
        });
      }
    });

    // 🔽 SORT (latest first)
    allPayments.sort((a, b) => new Date(b.time_stamp) - new Date(a.time_stamp));

    // 📊 STATS
    const mopStats = {};
    let totalAmount = 0;
    let totalRoomCollection = 0;
    let totalRestaurantCollection = 0;

    allPayments.forEach((p) => {
      const mop = p.mop || 'N/A';

      if (!mopStats[mop]) {
        mopStats[mop] = { count: 0, amount: 0 };
      }

      mopStats[mop].count += 1;
      mopStats[mop].amount += p.amount;
      totalAmount += p.amount;

      // Track room and restaurant collection separately
      if (p.type === 'Room') {
        totalRoomCollection += p.amount;
      } else if (p.type === 'Restaurant') {
        totalRestaurantCollection += p.amount;
      }
    });

    // 📤 EXPORT DATA
    const dataToExport = allPayments.map((p) => ({
      'Date & Time': new Date(p.time_stamp).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
      }),
      Type: ` ${p.type} - ${p.uid}`,
      'Customer Name': p.customer_name,
      'Payment Method': p.mop,
      'Amount ₹': p.amount,
    }));

    // ✅ SET STATE
    setFilteredData(allPayments);
    setAllPayments(allPayments);
    setDataToExport(dataToExport);
    setStats({
      mopStats,
      totalAmount,
      totalPayments: allPayments.length,
      totalRoomCollection,
      totalRestaurantCollection,
    });
  };

  const handleMopFilter = (mop) => {
    setSelectedMop((current) => (current === mop ? '' : mop));
  };

  const displayData = selectedMop
    ? filteredData.filter((payment) => payment.mop === selectedMop)
    : filteredData;

  const exportData = selectedMop
    ? dataToExport.filter((row) => row['Payment Method'] === selectedMop)
    : dataToExport;

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'collection-report',
  });

  const handleExport = () => {
    exportToExcel(exportData, 'collection_report');
  };

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Collection Report</Typography>
        </Breadcrumbs>
      </Box>
      {!roomBookings || !restaurantInvoices ? (
        <Loader />
      ) : (
        <>
          <Box p={3}>
            {/* Header Section */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  size="small"
                  label="Start Date"
                  variant="outlined"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: todaysDate }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  sx={{ mr: 1 }}
                />
                <TextField
                  size="small"
                  label="End Date"
                  variant="outlined"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  sx={{ mr: 1 }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: todaysDate }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<PrintIcon />}
                  disabled={displayData.length === 0}
                  onClick={handlePrint}
                  sx={{ mr: 1 }}
                >
                  Print
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={displayData.length === 0}
                  variant="contained"
                  color="success"
                  startIcon={<FileDownloadIcon />}
                >
                  Export
                </Button>
              </Box>
            </Box>

            {/* Summary Stats */}
            {Object.keys(stats).length > 0 && (
              <Box mb={2}>
                <Typography variant="h6" gutterBottom>
                  Collection Summary
                </Typography>
                <Box display="flex" gap={3} mb={2}>
                  <Typography>
                    <strong>Total Payments:</strong> {stats.totalPayments || 0}
                  </Typography>
                  <Typography>
                    <strong>Total Amount Collected:</strong> ₹
                    {stats.totalAmount?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography>
                    <strong>Room Collection:</strong> ₹
                    {stats.totalRoomCollection?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography>
                    <strong>Restaurant Collection:</strong> ₹
                    {stats.totalRestaurantCollection?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  Payment Method Breakdown:
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Paper
                    onClick={() => setSelectedMop('')}
                    sx={{
                      p: 2,
                      minWidth: 150,
                      cursor: 'pointer',
                      bgcolor: selectedMop === '' ? 'primary.light' : 'grey.50',
                      border: '1px solid',
                      borderColor:
                        selectedMop === '' ? 'primary.main' : 'grey.300',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      All
                    </Typography>
                    <Typography variant="body2">
                      Payments: {stats.totalPayments || 0}
                    </Typography>
                    <Typography variant="body2">
                      Amount: ₹{stats.totalAmount?.toFixed(2) || '0.00'}
                    </Typography>
                  </Paper>
                  {Object.entries(stats.mopStats || {}).map(([mop, data]) => (
                    <Paper
                      key={mop}
                      onClick={() => handleMopFilter(mop)}
                      sx={{
                        p: 2,
                        minWidth: 150,
                        cursor: 'pointer',
                        bgcolor:
                          selectedMop === mop ? 'primary.light' : 'grey.50',
                        border: '1px solid',
                        borderColor:
                          selectedMop === mop ? 'primary.main' : 'grey.300',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        {mop}
                      </Typography>
                      <Typography variant="body2">
                        Payments: {data.count}
                      </Typography>
                      <Typography variant="body2">
                        Amount: ₹{data.amount.toFixed(2)}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}

            {/* Data Table */}
            {selectedMop && (
              <Box mb={2}>
                <Typography variant="subtitle2">
                  Showing payments filtered by <strong>{selectedMop}</strong>.
                  Click the same payment method again to clear the filter.
                </Typography>
              </Box>
            )}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    {[
                      'Date & Time',
                      'Source',
                      'Customer Name',
                      'Payment Method',
                      'Amount ₹',
                    ].map((item, index) => (
                      <TableCell
                        align="center"
                        key={index}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {item}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayData?.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">
                        {new Date(payment.time_stamp).toLocaleString()}
                      </TableCell>

                      <TableCell align="center">
                        {payment.type}&nbsp;
                        <Link
                          href={
                            payment.type === 'Room'
                              ? `/front-office/room-booking/${payment.documentId}`
                              : `/restaurant/invoices/${payment.documentId}`
                          }
                          style={{
                            textDecoration: 'none',
                            fontSize: '0.875em',
                          }}
                        >
                          {payment.uid}
                        </Link>
                      </TableCell>
                      <TableCell align="center">
                        {payment.customer_name}
                      </TableCell>
                      <TableCell align="center">{payment.mop}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold" color="success.main">
                          ₹{payment.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {displayData?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No collection data found for the selected date range
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ display: 'none' }}>
            <CollectionReportPrint
              filteredData={displayData}
              ref={componentRef}
              startDate={startDate}
              endDate={endDate}
              stats={stats}
              selectedMop={selectedMop}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default CollectionReportPage;
