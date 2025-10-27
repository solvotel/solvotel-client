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

import { Loader } from '@/component/common';
import { GetCustomDate, GetTodaysDate } from '@/utils/DateFetcher';
import { useReactToPrint } from 'react-to-print';
import { RestaurantInvoiceReportPrint } from '@/component/printables/RestaurantInvoiceReportPrint';
import { RoomInvoiceReportPrint } from '@/component/printables/RoomInvoiceReportPrint';

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

  const handleSearch = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter purchases within date range
    const filteredInvoices =
      data?.filter((pur) => {
        const d = new Date(pur.date);
        return d >= start && d <= end;
      }) || [];

    setfilteredData(filteredInvoices);
  };

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'stock-report',
  });

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/">
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
              <Button
                variant="contained"
                color="success"
                startIcon={<PrintIcon />}
                disabled={filteredData.length === 0}
                onClick={handlePrint}
              >
                Print
              </Button>
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
                      'Total Amount',
                      'GST',
                      'Payable Amount',
                      'Payment Method',
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
                      (sum, r) => sum + (r.rate || 0),
                      0
                    );
                    const totalServiceAmount = row?.service_billing.reduce(
                      (sum, s) => sum + (s.rate || 0),
                      0
                    );
                    const totalFoodAmount = row?.food_items.reduce(
                      (sum, f) => sum + (f.rate || 0),
                      0
                    );
                    const payableRoomAmount = row?.room_tokens.reduce(
                      (sum, r) => sum + (r.amount || 0),
                      0
                    );
                    const payableServiceAmount = row?.service_billing.reduce(
                      (sum, s) => sum + (s.amount || 0),
                      0
                    );
                    const payableFoodAmount = row?.food_items.reduce(
                      (sum, f) => sum + (f.amount || 0),
                      0
                    );
                    const finalRate =
                      totalFoodAmount + totalRoomAmount + totalServiceAmount;
                    const payable =
                      payableRoomAmount +
                      payableServiceAmount +
                      payableFoodAmount;

                    const gst = payable - finalRate;
                    return (
                      <TableRow key={row.documentId}>
                        <TableCell>{row.invoice_no}</TableCell>
                        <TableCell>
                          {GetCustomDate(row.date)}&nbsp;{row.time}
                        </TableCell>
                        <TableCell>{row.customer_name}</TableCell>
                        <TableCell>{finalRate.toFixed(2)}</TableCell>
                        <TableCell>{gst.toFixed(2)}</TableCell>
                        <TableCell>{payable.toFixed(2)}</TableCell>
                        <TableCell>{row.mop}</TableCell>
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
