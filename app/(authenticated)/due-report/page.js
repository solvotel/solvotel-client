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
import { DueReportPrint } from '@/component/printables/DueReportPrint';

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

  const handleSearch = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    // Normalize to ignore time part
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Combine all invoices
    const allInvoices = [
      ...(roomInvoices?.map((inv) => ({ ...inv, type: 'Room' })) || []),
      ...(restaurantInvoices?.map((inv) => ({ ...inv, type: 'Restaurant' })) ||
        []),
    ];

    // Filter invoices with due amount > 0 and within date range
    const filteredInvoices = allInvoices.filter((inv) => {
      const invoiceDate = new Date(inv.date);
      const hasDue = (inv.due || 0) > 0;
      const inDateRange = invoiceDate >= start && invoiceDate <= end;
      return hasDue && inDateRange;
    });

    // Prepare data for export
    const dataToExport = filteredInvoices.map((row) => ({
      Type: row.type,
      'Invoice No': row.invoice_no,
      'Date/Time': `${row.date} ${row.time}`,
      'Customer Name': row.customer_name || 'N/A',
      GSTIN: row.customer_gst || 'N/A',
      'Total Amount ₹': row.total_amount,
      'SGST ₹': row.tax / 2,
      'CGST ₹': row.tax / 2,
      'Payable Amount ₹': row.payable_amount,
      'Total Paid ₹': (() => {
        const totalPaid =
          row.payments?.reduce(
            (acc, payment) => acc + (parseFloat(payment.amount) || 0),
            0,
          ) || 0;
        return totalPaid;
      })(),
      'Due Amount ₹': row.due || 0,
      'Payment Method':
        row.mop || row.payments?.map((p) => p.mop).join(', ') || 'N/A',
    }));

    setFilteredData(filteredInvoices);
    setDataToExport(dataToExport);
  };

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'due-report',
  });

  const handleExport = () => {
    exportToExcel(dataToExport, 'due_report');
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
          <Typography color="text.primary">Due Report</Typography>
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
            {filteredData.length > 0 && (
              <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <Box display="flex" gap={3}>
                  <Typography>
                    <strong>Total Invoices:</strong> {filteredData.length}
                  </Typography>
                  <Typography>
                    <strong>Total Due Amount:</strong> ₹
                    {filteredData
                      .reduce((sum, inv) => sum + (inv.due || 0), 0)
                      .toFixed(2)}
                  </Typography>
                  <Typography>
                    <strong>Room Invoices:</strong>{' '}
                    {filteredData.filter((inv) => inv.type === 'Room').length}
                  </Typography>
                  <Typography>
                    <strong>Restaurant Invoices:</strong>{' '}
                    {
                      filteredData.filter((inv) => inv.type === 'Restaurant')
                        .length
                    }
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Data Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    {[
                      'Type',
                      'Invoice No',
                      'Date/Time',
                      'Customer Name',
                      'GSTIN',
                      'Total Amount ₹',
                      'SGST ₹',
                      'CGST ₹',
                      'Payable Amount ₹',
                      'Total Paid ₹',
                      'Due Amount ₹',
                      'Payment Method',
                    ].map((item, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                        {item}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData?.map((row) => (
                    <TableRow key={row.documentId}>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            bgcolor:
                              row.type === 'Room'
                                ? 'primary.main'
                                : 'secondary.main',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'inline-block',
                          }}
                        >
                          {row.type}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.invoice_no}</TableCell>
                      <TableCell>
                        {row.date} {row.time}
                      </TableCell>
                      <TableCell>{row.customer_name || 'N/A'}</TableCell>
                      <TableCell>{row.customer_gst || 'N/A'}</TableCell>
                      <TableCell>{row.total_amount}</TableCell>
                      <TableCell>{row.tax / 2}</TableCell>
                      <TableCell>{row.tax / 2}</TableCell>
                      <TableCell>{row.payable_amount}</TableCell>
                      <TableCell>
                        {row.payments
                          ?.reduce(
                            (acc, payment) =>
                              acc + (parseFloat(payment.amount) || 0),
                            0,
                          )
                          .toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <Typography color="error" fontWeight="bold">
                          {row.due || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {row.mop ||
                          row.payments?.map((p) => p.mop).join(', ') ||
                          'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12} align="center">
                        No due invoices found for the selected date range
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ display: 'none' }}>
            <DueReportPrint
              filteredData={filteredData}
              ref={componentRef}
              startDate={startDate}
              endDate={endDate}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default Page;
