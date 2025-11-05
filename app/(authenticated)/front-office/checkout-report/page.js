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
import { GetCustomDate, GetTodaysDate } from '@/utils/DateFetcher';
import { useReactToPrint } from 'react-to-print';
import { RoomBookingReportPrint } from '@/component/printables/RoomBookingReportPrint';
import { exportToExcel } from '@/utils/exportToExcel';

const Page = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const data = GetDataList({
    auth,
    endPoint: 'room-bookings',
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(todaysDate);
  const [filteredData, setfilteredData] = useState([]);
  const [dataToExport, setDataToExport] = useState([]);

  const handleSearch = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Normalize times to cover the whole days
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const filteredInvoices =
      data?.filter((booking) => {
        const checkout = booking.checkout_date
          ? new Date(booking.checkout_date)
          : null;

        const isCheckoutInRange =
          checkout && checkout >= start && checkout <= end;

        return isCheckoutInRange;
      }) || [];

    const dataToExport = filteredInvoices.map((row) => {
      return {
        'Booking ID': row.booking_id,
        Guest: row.customer.company_name,
        'Booking Type': row.booking_type,
        'Room No': row.rooms.map((r) => r.room_no).join(', '),
        'Room Tokens': row.room_tokens
          .reduce(
            (sum, r) => sum + (parseFloat(r.total_amount) || r.amount || 0),
            0
          )
          .toFixed(2),
        Services: row.service_tokens
          .reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0)
          .toFixed(2),
        'Food Items': row.food_tokens
          .reduce((sum, f) => sum + (parseFloat(f.total_amount) || 0), 0)
          .toFixed(2),
        'Grand Total': (
          row.room_tokens.reduce(
            (sum, r) => sum + (parseFloat(r.total_amount) || r.amount || 0),
            0
          ) +
          row.service_tokens.reduce(
            (sum, s) => sum + (parseFloat(s.total_amount) || 0),
            0
          ) +
          row.food_tokens.reduce(
            (sum, f) => sum + (parseFloat(f.total_amount) || 0),
            0
          )
        ).toFixed(2),
        'Total Paid': (
          row.payment_tokens.reduce(
            (sum, p) => sum + (Number(p.amount) || 0),
            0
          ) + (row.advance_payment ? Number(row.advance_payment.amount) : 0)
        ).toFixed(2),
        'Due Payment': (
          row.room_tokens.reduce(
            (sum, r) => sum + (parseFloat(r.total_amount) || r.amount || 0),
            0
          ) +
          row.service_tokens.reduce(
            (sum, s) => sum + (parseFloat(s.total_amount) || 0),
            0
          ) +
          row.food_tokens.reduce(
            (sum, f) => sum + (parseFloat(f.total_amount) || 0),
            0
          ) -
          (row.payment_tokens.reduce(
            (sum, p) => sum + (Number(p.amount) || 0),
            0
          ) +
            (row.advance_payment ? Number(row.advance_payment.amount) : 0))
        ).toFixed(2),
      };
    });

    setfilteredData(filteredInvoices);
    setDataToExport(dataToExport);
  };

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'checkout-report',
  });

  const handleExport = () => {
    exportToExcel(dataToExport, 'checkout_report');
  };
  return (
    <>
      {' '}
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Checkout Report</Typography>
        </Breadcrumbs>
      </Box>
      {!data ? (
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
                  InputLabelProps={{ shrink: true }} // 👈 fixes label overlap
                  inputProps={{ max: todaysDate }} // 👈 move `max` inside inputProps
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
                  InputLabelProps={{ shrink: true }} // 👈 fixes label overlap
                  inputProps={{ max: todaysDate }} // 👈 move `max` inside inputProps
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

            {/* Data Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    {[
                      'Booking ID',
                      'Guest',
                      'Booking Type',
                      'Room No',
                      'Room Tokens',
                      'Services',
                      'Food Items',
                      'Grand Total',
                      'Total Paid',
                      'Due Payment',
                    ].map((item, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                        {item}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData?.map((row) => {
                    const totalRoomAmount = row?.room_tokens.reduce(
                      (sum, r) =>
                        sum + (parseFloat(r.total_amount) || r.amount || 0),
                      0
                    );
                    const totalServiceAmount = row?.service_tokens.reduce(
                      (sum, s) => sum + (parseFloat(s.total_amount) || 0),
                      0
                    );
                    const totalFoodAmount = row?.food_tokens.reduce(
                      (sum, f) => sum + (parseFloat(f.total_amount) || 0),
                      0
                    );
                    const totalAmount = row?.payment_tokens.reduce(
                      (sum, p) => sum + (Number(p.amount) || 0),
                      0
                    );
                    const advancePayment = row?.advance_payment || null;
                    const advanceAmount = advancePayment?.amount || 0;

                    const grandTotal =
                      totalRoomAmount + totalServiceAmount + totalFoodAmount;
                    const amountPayed = totalAmount + advanceAmount;
                    const dueAmount = grandTotal - amountPayed;
                    return (
                      <TableRow key={row.documentId}>
                        <TableCell>{row.booking_id}</TableCell>
                        <TableCell>{row.customer.company_name}</TableCell>
                        <TableCell>{row.booking_type}</TableCell>
                        <TableCell>
                          {row.rooms.map((r) => r.room_no).join(', ')}
                        </TableCell>
                        <TableCell>{totalRoomAmount}</TableCell>
                        <TableCell>{totalServiceAmount}</TableCell>
                        <TableCell>{totalFoodAmount}</TableCell>
                        <TableCell>{grandTotal}</TableCell>
                        <TableCell>{amountPayed}</TableCell>
                        <TableCell>{dueAmount.toFixed(2)}</TableCell>
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
          </Box>
          <Box sx={{ display: 'none' }}>
            <RoomBookingReportPrint
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
