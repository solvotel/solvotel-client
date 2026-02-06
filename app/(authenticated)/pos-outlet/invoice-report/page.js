'use client';

import { useAuth } from '@/context';
import { GetDataList, GetPosDataList } from '@/utils/ApiFunctions';
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
import { PosOutletInvoiceReportPrint } from '@/component/printables/PosOutletInvoiceReportPrint';

const Page = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const data = GetPosDataList({
    auth,
    endPoint: 'pos-outlet-invoices',
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(todaysDate);
  const [filteredData, setfilteredData] = useState([]);
  const [dataToExport, setDataToExport] = useState([]);

  const handleSearch = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    // Normalize to ignore time part
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Filter purchases within date range
    const filteredInvoices =
      data?.filter((pur) => {
        const d = new Date(pur.date);
        return d >= start && d <= end;
      }) || [];

    const dataToExport = filteredInvoices.map((row) => ({
      'Invoice No': row.invoice_no,
      'Date/Time': `${row.date} ${row.time}`,
      'Customer Name': row.customer_name || 'N/A',
      GSTIN: row.customer_gst || 'N/A',
      'Total Amount ₹': row.taxable,
      'SGST ₹ ': row.sgst,
      'CGST ₹ ': row.cgst,
      'Payable Amount ₹ ': row.payable,
      'Payment Method': row.mop || 'N/A',
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
    exportToExcel(dataToExport, 'pos_outlet_invoice_report');
  };

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/pos-outlet/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Invoice Report</Typography>
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
                      'Invoice No',
                      'Date/Time',
                      'Customer Name',
                      'GSTIN',
                      'Total Amount ₹',
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
                      <TableCell>{row.customer_name || 'N/A'}</TableCell>
                      <TableCell>{row.customer_gst || 'N/A'}</TableCell>
                      <TableCell>{row.taxable}</TableCell>
                      <TableCell>{row.sgst}</TableCell>
                      <TableCell>{row.cgst}</TableCell>
                      <TableCell>{row.payable}</TableCell>
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
            <PosOutletInvoiceReportPrint
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
