'use client';
import React from 'react';
import {
  Box,
  styled,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
} from '@mui/material';
import { GetCustomDate } from '@/utils/DateFetcher';

// styles

const HeadingCell = styled(TableCell)`
  border: 1px solid black;
  padding: 2px 5px;
  font-size: 15px;
  font-weight: 600;
`;
const BodyCell = styled(TableCell)`
  border: 1px solid black;
  padding: 2px 5px;
  font-size: 14px;
`;

const CustomTableContainer = styled(TableContainer)``;

// forwardRef is required for react-to-print
const RoomInvoiceReportPrint = React.forwardRef((props, ref) => {
  const { filteredData, startDate, endDate } = props;

  return (
    <Box
      ref={ref}
      sx={{
        p: 3,
        backgroundColor: '#fff',
      }}
    >
      <Typography variant="h6" textAlign={'center'} fontWeight={600} mb={2}>
        Room Invoive Report
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography>
          Start Date:{' '}
          <span style={{ fontWeight: 600 }}>{GetCustomDate(startDate)}</span>
        </Typography>
        <Typography>
          End Date:{' '}
          <span style={{ fontWeight: 600 }}>{GetCustomDate(endDate)}</span>
        </Typography>
      </Box>
      <CustomTableContainer>
        <Table>
          <TableBody>
            <TableRow>
              {[
                'Invoice No',
                'Date/Time',
                'Customer Name',
                'Taxable Amount',
                'SGST',
                'CGST',
                'Payable Amount',
                'Payment Method',
              ].map((item, index) => (
                <HeadingCell key={index} sx={{ fontWeight: 'bold' }}>
                  {item}
                </HeadingCell>
              ))}
            </TableRow>
            {filteredData?.map((row) => {
              return (
                <TableRow key={row.documentId}>
                  <BodyCell>{row.invoice_no}</BodyCell>
                  <BodyCell>
                    {GetCustomDate(row.date)}&nbsp;{row.time}
                  </BodyCell>
                  <BodyCell>{row.customer_name}</BodyCell>
                  <BodyCell>{row.total_amount.toFixed(2)}</BodyCell>
                  <BodyCell>{row.tax / 2}</BodyCell>
                  <BodyCell>{row.tax / 2}</BodyCell>
                  <BodyCell>{row.payable_amount.toFixed(2)}</BodyCell>
                  <BodyCell>{row.mop}</BodyCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CustomTableContainer>
      <Typography variant="body2" mt={2}>
        Report generate from: www.solvotel.com
      </Typography>
    </Box>
  );
});

RoomInvoiceReportPrint.displayName = 'RoomInvoiceReportPrint'; // 👈 required

export { RoomInvoiceReportPrint };
