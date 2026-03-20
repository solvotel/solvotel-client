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

const formatDateTime = (isoString) => {
  const date = new Date(isoString);

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const RoomBookingCalculator = (booking) => {
  const payments = booking?.payment_tokens || [];
  const roomTokens = booking?.room_tokens || [];
  const services = booking?.service_tokens || [];
  const foodItems = booking?.food_tokens || [];
  const totalAmount = payments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0,
  );
  const advancePayment = booking?.advance_payment || null;
  const advanceAmount = advancePayment?.amount || 0;
  const totalRoomAmount = roomTokens.reduce(
    (sum, r) => sum + (parseFloat(r.total_amount) || r.amount || 0),
    0,
  );
  const totalServiceAmount = services.reduce(
    (sum, s) => sum + (parseFloat(s.total_amount) || 0),
    0,
  );
  const totalFoodAmount = foodItems.reduce(
    (sum, f) => sum + (parseFloat(f.total_amount) || 0),
    0,
  );
  const grandTotal = totalRoomAmount + totalServiceAmount + totalFoodAmount;
  const amountPayed = totalAmount + advanceAmount;
  const dueAmount = grandTotal - amountPayed;

  return {
    grandTotal: parseFloat(grandTotal.toFixed(2)),
    amountPayed: parseFloat(amountPayed.toFixed(2)),
    dueAmount: parseFloat(dueAmount.toFixed(2)),
  };
};

const Page = () => {
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
  const [dataToExport, setDataToExport] = useState([]);

  const handleSearch = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    // Normalize to ignore time part
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const restructuredRoomData =
      roomBookings?.map((booking) => {
        const { grandTotal, amountPayed, dueAmount } =
          RoomBookingCalculator(booking);
        return {
          documentId: booking.documentId,
          type: 'Room',
          invoice_no: booking.booking_id,
          date: booking.createdAt,
          customer_name: booking.customer.name,
          payable_amount: grandTotal,
          payed: amountPayed,
          due: dueAmount,
        };
      }) || [];

    const restructuredRestaurantData =
      restaurantInvoices?.map((invoice) => ({
        documentId: invoice.documentId,
        type: 'Restaurant',
        invoice_no: invoice.invoice_no,
        date: invoice.createdAt,
        customer_name: invoice.customer_name,
        payable_amount: invoice.payable_amount,
        payed: invoice.payments?.reduce(
          (acc, payment) => acc + (parseFloat(payment.amount) || 0),
          0,
        ),
        due: invoice.due,
      })) || [];

    // Combine all invoices
    const allInvoices = [
      ...(restructuredRoomData || []),
      ...(restructuredRestaurantData || []),
    ];

    console.log('All Invoices:', allInvoices);

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
      'Date/Time': formatDateTime(row.date),
      'Customer Name': row.customer_name || 'N/A',
      'Payable Amount ₹': row.payable_amount,
      'Total Paid ₹': row.payed || 0,
      'Due Amount ₹': row.due || 0,
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
                    <strong>Total Entries:</strong> {filteredData.length}
                  </Typography>
                  <Typography>
                    <strong>Total Due Amount:</strong> ₹
                    {filteredData
                      .reduce((sum, inv) => sum + (inv.due || 0), 0)
                      .toFixed(2)}
                  </Typography>
                  <Typography>
                    <strong>Room Bookings:</strong>{' '}
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

                      'Payable ₹',
                      ' Paid ₹',
                      'Due ₹',
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
                      <TableCell>
                        <Link
                          href={
                            row.type === 'Room'
                              ? `/front-office/room-booking/${row.documentId}`
                              : `/restaurant/invoices/${row.documentId}`
                          }
                          style={{ textDecoration: 'none' }}
                        >
                          {row.invoice_no}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDateTime(row.date)}</TableCell>
                      <TableCell>{row.customer_name || 'N/A'}</TableCell>

                      <TableCell>{row.payable_amount}</TableCell>
                      <TableCell>{row.payed || '0.00'}</TableCell>
                      <TableCell>
                        <Typography color="error" fontWeight="bold">
                          {row.due || 0}
                        </Typography>
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
