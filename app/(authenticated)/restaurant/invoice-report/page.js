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
import { RestaurantInvoiceReportPrint } from '@/component/printables/RestaurantInvoiceReportPrint';
import { exportToExcel } from '@/utils/exportToExcel';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const InvoiceReportPage = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const data = GetDataList({
    auth,
    endPoint: 'restaurant-invoices',
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
    if ((!startDate || !endDate) && !searchText.trim()) return;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    const searchKey = searchText.trim().toLowerCase();

    const filteredInvoices =
      data?.filter((pur) => {
        const matchesDate =
          start && end
            ? (() => {
                const d = new Date(pur.date);
                return d >= start && d <= end;
              })()
            : true;

        const matchesSearch = searchKey
          ? [
              pur.invoice_no?.toString(),
              pur.customer_name,
              pur.customer_gst,
              `${pur.date} ${pur.time}`,
            ]
              .filter(Boolean)
              .some((value) =>
                value.toString().toLowerCase().includes(searchKey),
              )
          : true;

        return matchesDate && matchesSearch;
      }) || [];

    const dataToExport = filteredInvoices.map((row) => ({
      'Invoice No': row.invoice_no,
      'Date/Time': `${GetCustomDate(row.date)} ${row.time}`,
      'Customer Name': row.customer_name || 'NA',
      GSTIN: row.customer_gst || 'NA',
      'Taxable Amount ₹': row.total_amount,
      'SGST ₹ ': row.tax / 2,
      'CGST ₹ ': row.tax / 2,
      'Payable Amount ₹ ': row.payable_amount,
    }));

    setfilteredData(filteredInvoices);
    setDataToExport(dataToExport);
  };

  const handleReset = () => {
    setSearchText('');
    setStartDate('');
    setEndDate(todaysDate);
    setfilteredData([]);
    setDataToExport([]);
  };

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'stock-report',
  });
  const handleExport = () => {
    exportToExcel(dataToExport, 'restaurant_invoice_report');
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const formatPdfAmount = (amount) =>
      `INR ${Number(amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    doc.setFontSize(16);
    doc.text('Restaurant Invoice Report', 14, 16);
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
          'Customer Name',
          'GSTIN',
          'Taxable Amount',
          'SGST',
          'CGST',
          'Payable Amount',
        ],
      ],
      body: filteredData.map((invoice) => [
        invoice.invoice_no || '-',
        `${GetCustomDate(invoice.date) || '-'} ${invoice.time || ''}`.trim(),
        invoice.customer_name || 'NA',
        invoice.customer_gst || 'NA',
        formatPdfAmount(invoice.total_amount),
        formatPdfAmount(Number(invoice.tax || 0) / 2),
        formatPdfAmount(Number(invoice.tax || 0) / 2),
        formatPdfAmount(invoice.payable_amount),
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
        doc.setFontSize(8);
        doc.text(
          `Page ${doc.getNumberOfPages()}`,
          doc.internal.pageSize.getWidth() - 14,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'right' },
        );
      },
    });

    doc.save('restaurant_invoice_report.pdf');
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
          <Typography color="text.primary">
            Restaurant Invoice Report
          </Typography>
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
                  sx={{ mr: 1, minWidth: 220 }}
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
                      'Customer Name',
                      'GSTIN',
                      'Taxable Amount ₹',
                      'SGST ₹ ',
                      'CGST ₹ ',
                      'Payable Amount ₹ ',
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
                      <TableCell>{row.invoice_no}</TableCell>
                      <TableCell>
                        {GetCustomDate(row.date)}:{row.time}
                      </TableCell>
                      <TableCell>{row.customer_name || 'NA'}</TableCell>
                      <TableCell>{row.customer_gst || 'NA'}</TableCell>
                      <TableCell>{row.total_amount}</TableCell>
                      <TableCell>{row.tax / 2}</TableCell>
                      <TableCell>{row.tax / 2}</TableCell>
                      <TableCell>{row.payable_amount}</TableCell>
                    </TableRow>
                  ))}
                  {filteredData?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No invoice found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ display: 'none' }}>
            <RestaurantInvoiceReportPrint
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

export default InvoiceReportPage;
