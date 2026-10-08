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
  Tooltip,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PrintIcon from '@mui/icons-material/Print';
import TableViewIcon from '@mui/icons-material/TableView';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Loader } from '@/component/common';
import { GetCustomDate, GetTodaysDate } from '@/utils/DateFetcher';
import { useReactToPrint } from 'react-to-print';
import { RoomInvoiceReportPrint } from '@/component/printables/RoomInvoiceReportPrint';
import { exportToExcel } from '@/utils/exportToExcel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
const RoomInvoiceReportPage = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const data = GetDataList({
    auth,
    endPoint: 'room-invoices',
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(todaysDate);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setfilteredData] = useState([]);
  const [dataToExport, setDataToExport] = useState([]);

  const invoiceStats = filteredData.reduce(
    (totals, invoice) => {
      totals.taxableAmount += Number(invoice.total_amount) || 0;
      totals.tax += Number(invoice.tax) || 0;
      totals.payableAmount += Number(invoice.payable_amount) || 0;
      return totals;
    },
    {
      taxableAmount: 0,
      tax: 0,
      payableAmount: 0,
    },
  );

  const stats = {
    invoiceCount: filteredData.length,
    ...invoiceStats,
    sgst: invoiceStats.tax / 2,
    cgst: invoiceStats.tax / 2,
  };

  const formatAmount = (amount) =>
    `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleSearch = () => {
    if (!startDate && !endDate && !searchText.trim()) return;

    const hasDateRange = Boolean(startDate && endDate);
    let start, end;
    if (hasDateRange) {
      start = new Date(startDate);
      end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    const keyword = searchText?.trim().toLowerCase();

    const filteredInvoices =
      data?.filter((pur) => {
        const invoiceDate = new Date(pur.date);
        const dateMatches = hasDateRange
          ? invoiceDate >= start && invoiceDate <= end
          : true;

        const searchMatches = !keyword
          ? true
          : [
              pur.invoice_no,
              pur.customer_name,
              pur.customer_gst,
              pur.date,
              pur.time,
            ]
              .filter(Boolean)
              .some((field) => String(field).toLowerCase().includes(keyword));

        return dateMatches && searchMatches;
      }) || [];

    const dataToExport = filteredInvoices.map((row) => {
      return {
        'Invoice No': row.invoice_no,
        'Date/Time': `${GetCustomDate(row.date)} ${row.time}`,
        Checkin: `${GetCustomDate(row.checkin_date)}`,
        Checkout: `${GetCustomDate(row.checkout_date)}`,
        'Customer Name': row?.customer_name,
        Address: row?.customer_address,
        GSTIN: row?.customer_gst,
        'Taxable Amount': row.total_amount.toFixed(2),
        SGST: row.tax / 2,
        CGST: row.tax / 2,
        'Payable Amount': row.payable_amount.toFixed(2),
        'Payment Method': row?.mop,
      };
    });

    setfilteredData(filteredInvoices);
    setDataToExport(dataToExport);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate(todaysDate);
    setSearchText('');
    setfilteredData([]);
    setDataToExport([]);
  };

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'room-invoice-report',
  });
  const handleExport = () => {
    exportToExcel(dataToExport, 'room_invoice_report');
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a3' });
    const formatPdfAmount = (amount) =>
      `INR ${Number(amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    doc.setFontSize(16);
    doc.text('Room Invoice Report', 14, 16);
    doc.setFontSize(10);
    doc.text(
      `Start Date: ${GetCustomDate(startDate) || '-'}    End Date: ${GetCustomDate(endDate) || '-'}`,
      14,
      24,
    );
    doc.text(
      `Invoices: ${stats.invoiceCount}    Taxable Amount: ${formatPdfAmount(stats.taxableAmount)}    SGST: ${formatPdfAmount(stats.sgst)}    CGST: ${formatPdfAmount(stats.cgst)}    Payable Amount: ${formatPdfAmount(stats.payableAmount)}`,
      14,
      31,
    );

    autoTable(doc, {
      startY: 38,
      head: [
        [
          'Invoice No',
          'Date/Time',
          'Check-in',
          'Check-out',
          'Customer Name',
          'Address',
          'GSTIN',
          'Taxable Amount',
          'SGST',
          'CGST',
          'Payable Amount',
          'Payment Method',
        ],
      ],
      body: filteredData.map((invoice) => [
        invoice.invoice_no || '-',
        `${GetCustomDate(invoice.date) || '-'} ${invoice.time || ''}`.trim(),
        GetCustomDate(
          invoice.checkin_date || invoice.room_booking?.checkin_date,
        ) || '-',
        GetCustomDate(
          invoice.checkout_date || invoice.room_booking?.checkout_date,
        ) || '-',
        invoice.customer_name || 'NA',
        invoice.customer_address || 'NA',
        invoice.customer_gst || 'NA',
        formatPdfAmount(invoice.total_amount),
        formatPdfAmount(Number(invoice.tax || 0) / 2),
        formatPdfAmount(Number(invoice.tax || 0) / 2),
        formatPdfAmount(invoice.payable_amount),
        invoice.mop || '-',
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [55, 71, 79],
      },
      margin: { top: 38, right: 14, bottom: 16, left: 14 },
      didDrawPage: () => {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(
          `Page ${pageCount}`,
          doc.internal.pageSize.getWidth() - 20,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'right' },
        );
      },
    });

    doc.save('room_invoice_report.pdf');
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
          <Typography color="text.primary">Room Invoice Report</Typography>
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
                  label="Search (Invoice/Customer/GSTIN/Date)"
                  variant="outlined"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  sx={{ mr: 1, minWidth: 250 }}
                />
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
                  sx={{ mr: 1 }}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  color="warning"
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
                  startIcon={<TableViewIcon />}
                >
                  Export
                </Button>
                <Button
                  onClick={handleExportPdf}
                  disabled={filteredData.length === 0}
                  variant="contained"
                  color="error"
                  startIcon={<PictureAsPdfIcon />}
                  sx={{ ml: 1 }}
                >
                  Download
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(5, 1fr)',
                },
                gap: 2,
                mb: 3,
              }}
            >
              {[
                { label: 'Invoices', value: stats.invoiceCount },
                {
                  label: 'Taxable Amount',
                  value: formatAmount(stats.taxableAmount),
                },
                { label: 'SGST', value: formatAmount(stats.sgst) },
                { label: 'CGST', value: formatAmount(stats.cgst) },
                {
                  label: 'Payable Amount',
                  value: formatAmount(stats.payableAmount),
                },
              ].map((stat) => (
                <Card key={stat.label} elevation={2}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={700} mt={0.5}>
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Data Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    {[
                      'Invoice No',
                      'Date/Time',
                      'Checkin',
                      'Checkout',
                      'Customer Name',
                      'Address',
                      'GSTIN',
                      'Taxable Amount',
                      'SGST',
                      'CGST',
                      'Payable Amount',

                      'Action',
                    ].map((item, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                        {item}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData?.map((row) => {
                    return (
                      <TableRow key={row.documentId}>
                        <TableCell>{row.invoice_no}</TableCell>
                        <TableCell>
                          {GetCustomDate(row.date)}&nbsp;{row.time}
                        </TableCell>
                        <TableCell>
                          {GetCustomDate(row.checkin_date) || '-'}
                        </TableCell>
                        <TableCell>
                          {GetCustomDate(row.checkout_date) || '-'}
                        </TableCell>
                        <TableCell>{row?.customer_name || 'NA'}</TableCell>
                        <TableCell>{row?.customer_address || 'NA'}</TableCell>
                        <TableCell>{row?.customer_gst || 'NA'}</TableCell>
                        <TableCell>{row.total_amount.toFixed(2)}</TableCell>
                        <TableCell>{row.tax / 2}</TableCell>
                        <TableCell>{row.tax / 2}</TableCell>
                        <TableCell>{row.payable_amount.toFixed(2)}</TableCell>

                        <TableCell sx={{ width: '150px' }}>
                          <Tooltip title="View">
                            <IconButton
                              color="secondary"
                              href={`/front-office/room-invoice/${row.documentId}`}
                              size="small"
                            >
                              <VisibilityIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredData?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        No invoice found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ display: 'none' }}>
            <RoomInvoiceReportPrint
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

export default RoomInvoiceReportPage;
