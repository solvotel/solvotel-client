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
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Loader } from '@/component/common';
import { GetCustomDate, GetTodaysDate } from '@/utils/DateFetcher';
import { useReactToPrint } from 'react-to-print';
import { RoomInvoiceReportPrint } from '@/component/printables/RoomInvoiceReportPrint';
import { exportToExcel } from '@/utils/exportToExcel';
import VisibilityIcon from '@mui/icons-material/Visibility';
const Page = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const data = GetDataList({
    auth,
    endPoint: 'room-invoices',
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

    const dataToExport = filteredInvoices.map((row) => {
      return {
        'Invoice No': row.invoice_no,
        'Date/Time': `${GetCustomDate(row.date)} ${row.time}`,
        'Customer Name': row?.customer_name,
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

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'stock-report',
  });
  const handleExport = () => {
    exportToExcel(dataToExport, 'room_invoice_report');
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
                      'Taxable Amount',
                      'SGST',
                      'CGST',
                      'Payable Amount',
                      'Payment Method',
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
                        <TableCell>{row?.customer_name}</TableCell>
                        <TableCell>{row?.customer_gst}</TableCell>
                        <TableCell>{row.total_amount.toFixed(2)}</TableCell>
                        <TableCell>{row.tax / 2}</TableCell>
                        <TableCell>{row.tax / 2}</TableCell>
                        <TableCell>{row.payable_amount.toFixed(2)}</TableCell>
                        <TableCell>{row?.mop}</TableCell>
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
            <RoomInvoiceReportPrint
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
