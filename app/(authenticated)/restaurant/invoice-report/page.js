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
import { RestaurantInvoiceReportPrint } from '@/component/printables/RestaurantInvoiceReportPrint';
import { exportToExcel } from '@/utils/exportToExcel';

const Page = () => {
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
      'Date/Time': `${row.date} ${row.time}`,
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
                        {row.date}:{row.time}
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
            />
          </Box>
        </>
      )}
    </>
  );
};

export default Page;
