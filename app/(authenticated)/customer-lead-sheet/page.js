'use client';

import { useMemo, useRef } from 'react';
import { useAuth } from '@/context';
import { GetDataList } from '@/utils/ApiFunctions';
import {
  Breadcrumbs,
  Link,
  Typography,
  Box,
  Button,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Table,
} from '@mui/material';
import { FileDownload, NavigateNext, Print } from '@mui/icons-material';
import { Loader } from '@/component/common';

import { exportToExcel } from '@/utils/exportToExcel';
import { useReactToPrint } from 'react-to-print';
import { CustomerLeadSheetPrint } from '@/component/printables/CustomerLeadSheetPrint';

const Page = () => {
  const { auth } = useAuth();

  const roomGuest = GetDataList({
    auth,
    endPoint: 'customers',
  });

  const restaurantInvoices = GetDataList({
    auth,
    endPoint: 'restaurant-invoices',
  });

  const mergedGuests = useMemo(() => {
    if (!roomGuest && !restaurantInvoices) return [];

    const guestMap = {};

    // First add room guests
    roomGuest?.forEach((guest) => {
      const phone = guest.mobile || '';
      guestMap[phone] = {
        name: guest.name || '',
        phone,
        email: guest.email || '',
      };
    });

    // Then add restaurant invoice guests (if not already present)
    restaurantInvoices
      ?.filter((inv) => inv.customer_name || inv.customer_phone)
      ?.forEach((inv) => {
        const phone = inv.customer_phone || '';

        if (!guestMap[phone]) {
          guestMap[phone] = {
            name: inv.customer_name || '',
            phone,
            email: '',
          };
        }
      });

    return Object.values(guestMap);
  }, [roomGuest, restaurantInvoices]);

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'customer_lead_sheet',
  });
  const handleExport = () => {
    exportToExcel(mergedGuests, 'customer_lead_sheet');
  };

  return (
    <>
      {' '}
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Customer Lead Sheet</Typography>
        </Breadcrumbs>
      </Box>
      {!roomGuest || !restaurantInvoices ? (
        <Loader />
      ) : (
        <>
          <Box p={3}>
            {/* Header Section */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                mb: 2,
              }}
            >
              <Box>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Print />}
                  disabled={mergedGuests.length === 0}
                  onClick={handlePrint}
                  sx={{ mr: 1 }}
                >
                  Print
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={mergedGuests.length === 0}
                  variant="contained"
                  color="success"
                  startIcon={<FileDownload />}
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
                    {['Name', 'Mobile', 'Email'].map((item, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                        {item}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mergedGuests?.map((row) => {
                    return (
                      <TableRow key={row.documentId}>
                        <TableCell>{row.name || '-'}</TableCell>
                        <TableCell>{row.phone || '-'}</TableCell>
                        <TableCell>{row.email || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                  {mergedGuests?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No Guest found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ display: 'none' }}>
            <CustomerLeadSheetPrint
              filteredData={mergedGuests}
              ref={componentRef}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default Page;
