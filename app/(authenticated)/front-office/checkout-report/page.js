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
      const foodTokens = row?.food_tokens || [];
      const serviceTokens = row?.service_tokens || [];
      const totalRoomAmount = row?.room_tokens.reduce(
        (sum, r) => sum + (parseFloat(r.amount) || 0),
        0,
      );
      const totalServiceAmount = serviceTokens.reduce(
        (sum, s) => sum + (parseFloat(s.total_amount) || 0),
        0,
      );
      const totalFoodAmount = foodTokens.reduce(
        (sum, f) => sum + (parseFloat(f.total_amount) || 0),
        0,
      );
      const totalPaidAmount = (row?.payment_tokens || []).reduce(
        (sum, p) => sum + (Number(p.amount) || 0),
        0,
      );
      const advanceAmount = row?.advance_payment?.amount || 0;

      return {
        'Booking ID': row.booking_id,
        Guest: row.customer?.name || row.customer?.company_name || 'N/A',
        'Meal Plan': row.meal_plan || 'N/A',
        'Room No': row.rooms.map((r) => r.room_no).join(', '),
        'Room Tokens': totalRoomAmount.toFixed(2),
        Services: totalServiceAmount.toFixed(2),
        'Food Items': totalFoodAmount.toFixed(2),
        'Grand Total': (
          totalRoomAmount +
          totalServiceAmount +
          totalFoodAmount
        ).toFixed(2),
        'Total Paid': (totalPaidAmount + advanceAmount).toFixed(2),
        'Due Payment': (
          totalRoomAmount +
          totalServiceAmount +
          totalFoodAmount -
          totalPaidAmount -
          advanceAmount
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
          <Link underline="hover" color="inherit" href="/dashboard">
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
                      'Meal Plan',
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
                    const foodTokens = row?.food_tokens || [];
                    const serviceTokens = row?.service_tokens || [];
                    const totalRoomAmount = row?.room_tokens.reduce(
                      (sum, r) => sum + (parseFloat(r.amount) || 0),
                      0,
                    );
                    const totalServiceAmount = serviceTokens.reduce(
                      (sum, s) => sum + (parseFloat(s.total_amount) || 0),
                      0,
                    );
                    const totalFoodAmount = foodTokens.reduce(
                      (sum, f) => sum + (parseFloat(f.total_amount) || 0),
                      0,
                    );
                    const totalPaidAmount = (row?.payment_tokens || []).reduce(
                      (sum, p) => sum + (Number(p.amount) || 0),
                      0,
                    );
                    const advanceAmount = row?.advance_payment?.amount || 0;

                    const grandTotal =
                      totalRoomAmount + totalServiceAmount + totalFoodAmount;
                    const amountPayed = totalPaidAmount + advanceAmount;
                    const dueAmount = grandTotal - amountPayed;
                    return (
                      <TableRow key={row.documentId}>
                        <TableCell>
                          <Link
                            href={`/front-office/room-booking/${row.documentId}`}
                            underline="hover"
                          >
                            {row.booking_id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {row.customer?.name ||
                            row.customer?.company_name ||
                            'N/A'}
                        </TableCell>
                        <TableCell>{row.meal_plan || 'N/A'}</TableCell>
                        <TableCell>
                          {row.rooms.map((r) => r.room_no).join(', ')}
                        </TableCell>
                        <TableCell>{totalRoomAmount.toFixed(2)}</TableCell>
                        <TableCell>{totalServiceAmount.toFixed(2)}</TableCell>
                        <TableCell>{totalFoodAmount.toFixed(2)}</TableCell>
                        <TableCell>{grandTotal.toFixed(2)}</TableCell>
                        <TableCell>{amountPayed.toFixed(2)}</TableCell>
                        <TableCell>{dueAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredData?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
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
