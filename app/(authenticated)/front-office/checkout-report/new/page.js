'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context';
import { GetDataList } from '@/utils/ApiFunctions';
import { GetTodaysDate } from '@/utils/DateFetcher';
import { useReactToPrint } from 'react-to-print';
import { exportToExcel } from '@/utils/exportToExcel';
import { Loader } from '@/component/common';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Box,
  Breadcrumbs,
  Button,
  Link as MuiLink,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PrintIcon from '@mui/icons-material/Print';
import TableViewIcon from '@mui/icons-material/TableView';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const getDateKey = (value) => {
  if (!value) return '';
  const date = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
};

const formatAmount = (value) => Number(value || 0).toFixed(2);

const CheckoutReportPage = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const bookings = GetDataList({ auth, endPoint: 'room-bookings' });
  const [startDate, setStartDate] = useState(todaysDate);
  const [endDate, setEndDate] = useState(todaysDate);
  const [searchBookingId, setSearchBookingId] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: todaysDate,
    endDate: todaysDate,
    bookingId: '',
  });
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'checkout-report',
  });

  const invalidDateRange = Boolean(startDate && endDate) && startDate > endDate;

  const reportRows = useMemo(() => {
    if (
      !Array.isArray(bookings) ||
      !appliedFilters.startDate ||
      !appliedFilters.endDate
    ) {
      return [];
    }

    const searchTerm = appliedFilters.bookingId.trim().toLowerCase();
    return bookings.flatMap((booking) => {
      const bookingId = String(booking?.booking_id || '');
      if (searchTerm && !bookingId.toLowerCase().includes(searchTerm)) {
        return [];
      }

      return (Array.isArray(booking?.room_tokens) ? booking.room_tokens : [])
        .filter((token) => {
          const checkedOut =
            token?.checked_out === true || booking?.checked_out === true;
          const outDate = getDateKey(token?.out_date);

          return (
            checkedOut &&
            outDate &&
            outDate >= appliedFilters.startDate &&
            outDate <= appliedFilters.endDate
          );
        })
        .map((token, index) => ({
          booking,
          token,
          rowId: `${booking?.documentId || bookingId}-${token?.id || `${token?.room || 'room'}-${index}`}`,
        }));
    });
  }, [bookings, appliedFilters]);

  const exportRows = useMemo(
    () =>
      reportRows.map(({ booking, token }) => ({
        'Booking ID': booking?.booking_id || 'N/A',
        Guest:
          booking?.customer?.name || booking?.customer?.company_name || 'N/A',
        Phone: booking?.customer?.mobile || 'N/A',
        'Room No': token?.room || 'N/A',
        'Room Type': token?.item || 'N/A',
        'Check-in Date': getDateKey(token?.in_date) || 'N/A',
        'Check-out Date': getDateKey(token?.out_date) || 'N/A',
        Nights: Number(token?.days || 0),
        'Room Rate': formatAmount(token?.rate),
        'Room Amount': formatAmount(token?.amount),
      })),
    [reportRows],
  );

  const handleSearch = () => {
    if (invalidDateRange) return;
    setAppliedFilters({
      startDate,
      endDate,
      bookingId: searchBookingId,
    });
  };

  const handleReset = () => {
    setStartDate(todaysDate);
    setEndDate(todaysDate);
    setSearchBookingId('');
    setAppliedFilters({
      startDate: todaysDate,
      endDate: todaysDate,
      bookingId: '',
    });
  };

  const handleExport = () => {
    exportToExcel(exportRows, 'checkout_report');
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const totalAmount = reportRows.reduce(
      (sum, { token }) => sum + (Number(token?.amount) || 0),
      0,
    );

    doc.setFontSize(16);
    doc.text('Checkout Report', 14, 16);
    doc.setFontSize(10);
    doc.text(
      `Out date: ${appliedFilters.startDate} to ${appliedFilters.endDate}    Booking ID: ${appliedFilters.bookingId || 'All'}`,
      14,
      24,
    );
    doc.text(
      `Rooms: ${reportRows.length}    Room Amount: INR ${formatAmount(totalAmount)}`,
      14,
      31,
    );

    autoTable(doc, {
      startY: 38,
      head: [
        [
          'Booking ID',
          'Guest',
          'Phone',
          'Room No',
          'Room Type',
          'Check-in',
          'Check-out',
          'Nights',
          'Room Rate',
          'Room Amount',
        ],
      ],
      body: exportRows.map((row) => [
        row['Booking ID'],
        row.Guest,
        row.Phone,
        row['Room No'],
        row['Room Type'],
        row['Check-in Date'],
        row['Check-out Date'],
        row.Nights,
        `INR ${row['Room Rate']}`,
        `INR ${row['Room Amount']}`,
      ]),
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [55, 71, 79] },
      margin: { top: 38, right: 14, bottom: 16, left: 14 },
      didDrawPage: () => {
        doc.setFontSize(8);
        doc.text(
          `Page ${doc.getNumberOfPages()}`,
          doc.internal.pageSize.getWidth() - 14,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'right' },
        );
      },
    });

    doc.save('checkout_report.pdf');
  };

  const table = (
    <Table size="small">
      <TableHead>
        <TableRow sx={{ backgroundColor: 'grey.100' }}>
          {[
            'Booking ID',
            'Guest',
            'Phone',
            'Room No',
            'Room Type',
            'Check-in Date',
            'Check-out Date',
            'Nights',
            'Room Rate',
            'Room Amount',
          ].map((heading) => (
            <TableCell
              key={heading}
              sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
            >
              {heading}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {reportRows.map(({ booking, token, rowId }) => (
          <TableRow key={rowId}>
            <TableCell>
              <MuiLink
                component={Link}
                href={`/front-office/room-booking/${booking?.documentId}`}
                underline="hover"
              >
                {booking?.booking_id || 'N/A'}
              </MuiLink>
            </TableCell>
            <TableCell>
              {booking?.customer?.name ||
                booking?.customer?.company_name ||
                'N/A'}
            </TableCell>
            <TableCell>{booking?.customer?.mobile || 'N/A'}</TableCell>
            <TableCell>{token?.room || 'N/A'}</TableCell>
            <TableCell>{token?.item || 'N/A'}</TableCell>
            <TableCell>{getDateKey(token?.in_date) || 'N/A'}</TableCell>
            <TableCell>{getDateKey(token?.out_date) || 'N/A'}</TableCell>
            <TableCell>{Number(token?.days || 0)}</TableCell>
            <TableCell>{formatAmount(token?.rate)}</TableCell>
            <TableCell>{formatAmount(token?.amount)}</TableCell>
          </TableRow>
        ))}
        {reportRows.length === 0 && (
          <TableRow>
            <TableCell colSpan={10} align="center">
              No checked-out rooms found for the selected date range.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (!bookings) return <Loader />;

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <MuiLink
            component={Link}
            underline="hover"
            color="inherit"
            href="/dashboard"
          >
            Dashboard
          </MuiLink>
          <Typography color="text.primary">Checkout Report</Typography>
        </Breadcrumbs>
      </Box>
      <Box p={3}>
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <TextField
              size="small"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="End Date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              error={invalidDateRange}
              helperText={
                invalidDateRange
                  ? 'End date must be on or after start date.'
                  : ''
              }
            />
            <TextField
              size="small"
              label="Search Booking ID"
              value={searchBookingId}
              onChange={(event) => setSearchBookingId(event.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={invalidDateRange}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant="contained"
              color="warning"
              startIcon={<PrintIcon />}
              disabled={reportRows.length === 0}
              onClick={handlePrint}
            >
              Print
            </Button>
            <Button
              onClick={handleExport}
              disabled={reportRows.length === 0}
              variant="contained"
              color="success"
              startIcon={<TableViewIcon />}
            >
              Export
            </Button>
            <Button
              onClick={handleExportPdf}
              disabled={reportRows.length === 0}
              variant="contained"
              color="error"
              startIcon={<PictureAsPdfIcon />}
            >
              Download
            </Button>
          </Box>
        </Box>

        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, overflowX: 'auto' }}
        >
          {table}
        </TableContainer>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {reportRows.length} room{reportRows.length === 1 ? '' : 's'} checked
          out
          {' · '}Total room amount: ₹
          {formatAmount(
            reportRows.reduce(
              (sum, { token }) => sum + (Number(token?.amount) || 0),
              0,
            ),
          )}
        </Typography>
      </Box>
      <Box
        ref={printRef}
        sx={{ position: 'absolute', top: 0, left: '-10000px', width: '100%' }}
      >
        <Typography variant="h6" textAlign="center" fontWeight={600} mb={1}>
          Checkout Report
        </Typography>
        <Typography variant="body2" mb={2}>
          Out date: {appliedFilters.startDate} to {appliedFilters.endDate}
        </Typography>
        {table}
      </Box>
    </>
  );
};

export default CheckoutReportPage;
