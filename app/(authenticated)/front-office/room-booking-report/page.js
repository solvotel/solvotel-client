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
        const createdAt = booking.createdAt
          ? new Date(booking.createdAt)
          : null;
        const checkin = booking.checkin_date
          ? new Date(booking.checkin_date)
          : null;
        const checkout = booking.checkout_date
          ? new Date(booking.checkout_date)
          : null;

        // Check if any of the three dates fall within the range
        const isCreatedInRange =
          createdAt && createdAt >= start && createdAt <= end;
        const isCheckinInRange = checkin && checkin >= start && checkin <= end;
        const isCheckoutInRange =
          checkout && checkout >= start && checkout <= end;

        return isCreatedInRange || isCheckinInRange || isCheckoutInRange;
      }) || [];

    const dataToExport = filteredInvoices.map((row) => ({
      'Booking ID': row.booking_id,
      'Booking Date': GetCustomDate(row.createdAt),
      'Check-in Date': GetCustomDate(row.checkin_date),
      'Check-out Date': GetCustomDate(row.checkout_date),
      'Room No': row.rooms.map((r) => r.room_no).join(', '),
      Guest: row.customer.name,
      'Company Name': row.customer.company_name,
      GSTIN: row.customer.gst_no,
      'Meal Plan': row.meal_plan,
      Notes: row.remarks,
    }));

    setfilteredData(filteredInvoices);
    setDataToExport(dataToExport);
  };

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'stock-report',
  });

  const handleExport = () => {
    exportToExcel(dataToExport, 'room_booking_report');
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
          <Typography color="text.primary">Room Booking Report</Typography>
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
                      'Booking Date',
                      'Check-in Date',
                      'Check-out Date',
                      'Room No',
                      'Guest',
                      'Company Name',
                      'GSTIN',
                      'Meal Plan',
                      'Notes',
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
                      <TableCell>{row.booking_id}</TableCell>
                      <TableCell>{GetCustomDate(row.createdAt)}</TableCell>
                      <TableCell>{GetCustomDate(row.checkin_date)}</TableCell>
                      <TableCell>{GetCustomDate(row.checkout_date)}</TableCell>
                      <TableCell>
                        {row.rooms.map((r) => r.room_no).join(', ')}
                      </TableCell>
                      <TableCell>{row.customer.name}</TableCell>
                      <TableCell>{row.customer.company_name}</TableCell>
                      <TableCell>{row.customer.gst_no}</TableCell>
                      <TableCell>{row.meal_plan}</TableCell>
                      <TableCell>{row.remarks}</TableCell>
                    </TableRow>
                  ))}
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
