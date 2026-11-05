'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Link,
  Paper,
  Stack,
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
import SearchIcon from '@mui/icons-material/Search';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '@/context';
import { Loader } from '@/component/common';
import { GetDataList } from '@/utils/ApiFunctions';
import { GetTodaysDate } from '@/utils/DateFetcher';
import { exportToExcel } from '@/utils/exportToExcel';
import { HousekeepingReportPrint } from '@/component/printables/HousekeepingReportPrint';

const dateKey = (date) => String(date || '').split('T')[0];

const nextDateKey = (date) => {
  const nextDate = new Date(`${dateKey(date)}T00:00:00.000Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  return nextDate.toISOString().split('T')[0];
};

const formatDate = (date) => {
  const key = dateKey(date);
  if (!key) return '';
  const [year, month, day] = key.split('-');
  return `${day}-${month}-${year}`;
};

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date
    .toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    })
    .replace(',', '');
};

const getHousekeepingReportRows = (bookings, startDate, endDate) => {
  const rows = [];

  (bookings || []).forEach((booking) => {
    if (booking.booking_status === 'Cancelled') return;

    (booking.housekeeping_tokens || []).forEach((token, index) => {
      const base = {
        booking_id: booking.booking_id || '',
        customer_name: booking.customer?.name || 'N/A',
        room: token.room || 'N/A',
      };
      const stayDate = dateKey(token.date);

      if (stayDate >= startDate && stayDate <= endDate) {
        rows.push({
          id: `${booking.documentId}-${token.room}-${stayDate}-stay-${index}`,
          ...base,
          task_type: 'Stay cleaning',
          task_date: stayDate,
          status: token.status || 'dirty',
          cleaned_by: token.cleaned_by || '',
          time_stamp: token.time_stamp || '',
        });
      }

      const checkoutDate = dateKey(token.out_date);
      const isLastStayNight =
        stayDate && checkoutDate && nextDateKey(stayDate) === checkoutDate;
      if (
        isLastStayNight &&
        token.after_checkout &&
        checkoutDate >= startDate &&
        checkoutDate <= endDate
      ) {
        rows.push({
          id: `${booking.documentId}-${token.room}-${checkoutDate}-checkout-${index}`,
          ...base,
          task_type: 'After checkout',
          task_date: checkoutDate,
          status: token.after_checkout.status || 'dirty',
          cleaned_by: token.after_checkout.cleaned_by || '',
          time_stamp: token.after_checkout.time_stamp || '',
        });
      }
    });
  });

  return rows.sort(
    (a, b) =>
      b.task_date.localeCompare(a.task_date) ||
      String(a.room).localeCompare(String(b.room), undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
  );
};

const HousekeepingReport = () => {
  const { auth } = useAuth();
  const bookings = GetDataList({ auth, endPoint: 'room-bookings' });
  const today = GetTodaysDate().dateString;
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reportRange, setReportRange] = useState(null);
  const [error, setError] = useState('');
  const printRef = useRef(null);

  const reportRows = useMemo(
    () =>
      reportRange
        ? getHousekeepingReportRows(
            bookings,
            reportRange.startDate,
            reportRange.endDate,
          )
        : [],
    [bookings, reportRange],
  );
  const cleanCount = reportRows.filter(
    (row) => row.status.toLowerCase() === 'clean',
  ).length;
  const dirtyCount = reportRows.length - cleanCount;

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      setError('Select both a start date and an end date.');
      return;
    }
    if (startDate > endDate) {
      setError('Start date must be on or before the end date.');
      return;
    }

    setError('');
    setReportRange({ startDate, endDate });
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'housekeeping-report',
  });

  const exportRows = reportRows.map((row) => ({
    Date: formatDate(row.task_date),
    Room: row.room,
    'Booking ID': row.booking_id,
    Guest: row.customer_name,
    'Cleaned By': row.cleaned_by || '-',
    'Cleaned At': formatDateTime(row.time_stamp) || '-',
  }));

  const handleExport = () => {
    exportToExcel(exportRows, 'housekeeping_report');
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('Housekeeping Cleaning Report', 14, 16);
    doc.setFontSize(10);
    doc.text(
      `Date Range: ${formatDate(reportRange.startDate)} - ${formatDate(reportRange.endDate)}    Tasks: ${reportRows.length}    Clean: ${cleanCount}    Dirty: ${dirtyCount}`,
      14,
      24,
    );

    autoTable(doc, {
      startY: 30,
      head: [
        [
          'Date',
          'Room',
          'Booking ID',
          'Guest',
          'Cleaned By',
          'Cleaned At',
        ],
      ],
      body: reportRows.map((row) => [
        formatDate(row.task_date),
        row.room,
        row.booking_id || '-',
        row.customer_name,
        row.cleaned_by || '-',
        formatDateTime(row.time_stamp) || '-',
      ]),
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [55, 71, 79] },
      margin: { top: 30, right: 12, bottom: 14, left: 12 },
      didDrawPage: () => {
        doc.setFontSize(8);
        doc.text(
          `Page ${doc.getNumberOfPages()}`,
          doc.internal.pageSize.getWidth() - 12,
          doc.internal.pageSize.getHeight() - 7,
          { align: 'right' },
        );
      },
    });

    doc.save('housekeeping_report.pdf');
  };

  if (!bookings) return <Loader />;

  return (
    <>
      <Box sx={{ px: 3, py: 2, bgcolor: '#efefef' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Link underline="hover" color="inherit" href="/house-keeping">
            Housekeeping
          </Link>
          <Typography color="text.primary">Cleaning Report</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', lg: 'center' }}
          gap={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Housekeeping Cleaning Report
            </Typography>
            <Typography color="text.secondary">
              Review room cleaning tasks and staff activity by date range.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            gap={1}
          >
            <TextField
              size="small"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
            />
            <TextField
              size="small"
              label="End Date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleGenerateReport}
            >
              Generate
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          gap={2}
          sx={{ mb: 2 }}
        >
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Chip label={`Tasks: ${reportRows.length}`} />
            <Chip label={`Clean: ${cleanCount}`} color="success" />
            <Chip label={`Dirty: ${dirtyCount}`} color="warning" />
          </Stack>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Button
              variant="contained"
              color="warning"
              startIcon={<PrintIcon />}
              disabled={!reportRange || reportRows.length === 0}
              onClick={handlePrint}
            >
              Print
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<TableViewIcon />}
              disabled={!reportRange || reportRows.length === 0}
              onClick={handleExport}
            >
              Export Excel
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<PictureAsPdfIcon />}
              disabled={!reportRange || reportRows.length === 0}
              onClick={handleDownloadPdf}
            >
              Download PDF
            </Button>
          </Stack>
        </Stack>

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                {[
                  'Date',
                  'Room',
                  'Booking ID',
                  'Guest',
                  'Cleaned By',
                  'Cleaned At',
                ].map((heading) => (
                  <TableCell key={heading} sx={{ fontWeight: 700 }}>
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!reportRange ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Choose a date range and generate the report.
                  </TableCell>
                </TableRow>
              ) : reportRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No housekeeping tasks found for this date range.
                  </TableCell>
                </TableRow>
              ) : (
                reportRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{formatDate(row.task_date)}</TableCell>
                    <TableCell>{row.room}</TableCell>
                    <TableCell>{row.booking_id || '-'}</TableCell>
                    <TableCell>{row.customer_name}</TableCell>
                    <TableCell>{row.cleaned_by || '-'}</TableCell>
                    <TableCell>
                      {formatDateTime(row.time_stamp) || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {reportRange && (
        <Box sx={{ display: 'none' }}>
          <HousekeepingReportPrint
            ref={printRef}
            rows={reportRows}
            startDate={reportRange.startDate}
            endDate={reportRange.endDate}
          />
        </Box>
      )}
    </>
  );
};

export default HousekeepingReport;
