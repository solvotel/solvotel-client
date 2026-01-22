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

const Page = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;

  // Fetch both room and restaurant invoices
  const roomInvoices = GetDataList({
    auth,
    endPoint: 'room-invoices',
  });
  const restaurantInvoices = GetDataList({
    auth,
    endPoint: 'restaurant-invoices',
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(todaysDate);
  const [filteredData, setFilteredData] = useState([]);
  const [dataToExport, setDataToExport] = useState([]);
  const [stats, setStats] = useState({});

  const handleSearch = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    // Normalize to ignore time part
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Combine all invoices
    const allInvoices = [
      ...(roomInvoices?.map((inv) => ({ ...inv, source: 'Room' })) || []),
      ...(restaurantInvoices?.map((inv) => ({
        ...inv,
        source: 'Restaurant',
      })) || []),
    ];

    // Extract all payments from invoices
    const allPayments = [];
    allInvoices.forEach((invoice) => {
      if (invoice.payments && invoice.payments.length > 0) {
        invoice.payments.forEach((payment) => {
          const paymentDate = new Date(payment.time_stamp);
          if (paymentDate >= start && paymentDate <= end) {
            allPayments.push({
              id: `${invoice.documentId}-${payment.time_stamp}`,
              invoice_no: invoice.invoice_no,
              source: invoice.source,
              customer_name: invoice.customer_name || 'N/A',
              time_stamp: payment.time_stamp,
              mop: payment.mop,
              amount: parseFloat(payment.amount) || 0,
            });
          }
        });
      }
      // Handle backward compatibility for old mop field
      else if (
        invoice.mop &&
        invoice.payable_amount &&
        invoice.due !== undefined
      ) {
        const paidAmount = invoice.payable_amount - (invoice.due || 0);
        if (paidAmount > 0) {
          const paymentDate = new Date(invoice.date);
          if (paymentDate >= start && paymentDate <= end) {
            allPayments.push({
              id: `${invoice.documentId}-legacy`,
              invoice_no: invoice.invoice_no,
              source: invoice.source,
              customer_name: invoice.customer_name || 'N/A',
              time_stamp: new Date(
                invoice.date + ' ' + invoice.time,
              ).toISOString(),
              mop: invoice.mop,
              amount: paidAmount,
            });
          }
        }
      }
    });

    // Sort by timestamp (newest first)
    allPayments.sort((a, b) => new Date(b.time_stamp) - new Date(a.time_stamp));

    // Calculate stats by MOP
    const mopStats = {};
    let totalAmount = 0;

    allPayments.forEach((payment) => {
      const mop = payment.mop || 'N/A';
      if (!mopStats[mop]) {
        mopStats[mop] = { count: 0, amount: 0 };
      }
      mopStats[mop].count += 1;
      mopStats[mop].amount += payment.amount;
      totalAmount += payment.amount;
    });

    // Prepare data for export
    const dataToExport = allPayments.map((payment) => ({
      'Invoice No': payment.invoice_no,
      Source: payment.source,
      'Customer Name': payment.customer_name,
      'Payment Method': payment.mop,
      'Amount ₹': payment.amount,
      Timestamp: new Date(payment.time_stamp).toLocaleString(),
    }));

    setFilteredData(allPayments);
    setDataToExport(dataToExport);
    setStats({ mopStats, totalAmount, totalPayments: allPayments.length });
  };

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'collection-report',
  });

  const handleExport = () => {
    exportToExcel(dataToExport, 'collection_report');
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
      {!roomInvoices || !restaurantInvoices ? (
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
                  disabled={filteredData.length === 0}
                  onClick={handlePrint}
                  sx={{ mr: 1 }}
                >
                  Print
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={filteredData.length === 0}
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
                </Box>

                {/* MOP-wise Stats */}
                <Typography variant="subtitle1" gutterBottom>
                  Payment Method Breakdown:
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  {Object.entries(stats.mopStats || {}).map(([mop, data]) => (
                    <Paper
                      key={mop}
                      sx={{
                        p: 2,
                        minWidth: 150,
                        bgcolor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'grey.300',
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
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    {[
                      'Invoice No',
                      'Source',
                      'Customer Name',
                      'Payment Method',
                      'Amount ₹',
                      'Timestamp',
                    ].map((item, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                        {item}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.invoice_no}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            bgcolor:
                              payment.source === 'Room'
                                ? 'primary.main'
                                : 'secondary.main',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'inline-block',
                          }}
                        >
                          {payment.source}
                        </Typography>
                      </TableCell>
                      <TableCell>{payment.customer_name}</TableCell>
                      <TableCell>{payment.mop}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold" color="success.main">
                          ₹{payment.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.time_stamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData?.length === 0 && (
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
              filteredData={filteredData}
              ref={componentRef}
              startDate={startDate}
              endDate={endDate}
              stats={stats}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default Page;
