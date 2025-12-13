'use client';
import {
  Box,
  Breadcrumbs,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { GetCustomDate } from '@/utils/DateFetcher';
import { GetDataList, GetSingleData } from '@/utils/ApiFunctions';
import { Loader } from '@/component/common';
import { useMemo, useState } from 'react';
import { useAuth } from '@/context';

const Page = () => {
  const { auth } = useAuth();
  const [search, setSearch] = useState('');

  const hotel = GetSingleData({
    endPoint: 'hotels',
    auth: auth,
    id: auth?.user?.hotel_id,
  });
  const data = GetDataList({
    auth,
    endPoint: 'room-invoices',
  });
  const roomBookings = GetDataList({
    auth,
    endPoint: 'room-bookings',
  });
  const paymentMethods = GetDataList({
    auth,
    endPoint: 'payment-methods',
  });

  // filter data by invoice no
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.invoice_no?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

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
          <Typography color="text.primary">Room Invoices</Typography>
        </Breadcrumbs>
      </Box>

      {!data || !paymentMethods || !roomBookings ? (
        <Loader />
      ) : (
        <Box p={3}>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <TextField
              size="small"
              label="Search by invoice no"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>

          {/* Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  {[
                    'Invoice No',
                    'Date/Time',
                    'Customer Name',
                    'Total Amount',
                    'SGST',
                    'CGST',
                    'Payable Amount',
                    'Payment Method',
                    'Actions',
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
                      <TableCell>{row.customer_name}</TableCell>
                      <TableCell>{parseInt(row.total_amount)}</TableCell>
                      <TableCell>{parseInt(row.tax / 2)}</TableCell>
                      <TableCell>{parseInt(row.tax / 2)}</TableCell>
                      <TableCell>{parseInt(row.payable_amount)}</TableCell>
                      <TableCell>{row.mop}</TableCell>
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
                    <TableCell colSpan={8} align="center">
                      No invoice found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </>
  );
};

export default Page;
