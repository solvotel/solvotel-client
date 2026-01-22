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
const DueReportPrint = React.forwardRef((props, ref) => {
  const { filteredData, startDate, endDate } = props;

  const totalAmount = filteredData?.reduce((sum, i) => sum + i.total_amount, 0);
  const totalGst = filteredData?.reduce((sum, i) => sum + i.tax, 0);
  const totalPayable = filteredData?.reduce(
    (sum, i) => sum + i.payable_amount,
    0,
  );
  const totalDue = filteredData?.reduce((sum, i) => sum + (i.due || 0), 0);
  const totalPaid = filteredData?.reduce((sum, i) => {
    const paid =
      i.payments?.reduce(
        (acc, payment) => acc + (parseFloat(payment.amount) || 0),
        0,
      ) || 0;
    return sum + paid;
  }, 0);

  return (
    <Box
      ref={ref}
      sx={{
        p: 3,
        backgroundColor: '#fff',
      }}
    >
      <Typography variant="h6" textAlign={'center'} fontWeight={600} mb={2}>
        Due Report
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

      {/* Summary */}
      <Box sx={{ mb: 2, p: 2, border: '1px solid black', borderRadius: 1 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Summary
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Typography>
            Total Invoices:{' '}
            <span style={{ fontWeight: 600 }}>{filteredData?.length || 0}</span>
          </Typography>
          <Typography>
            Total Due Amount:{' '}
            <span style={{ fontWeight: 600 }}>
              ₹{totalDue?.toFixed(2) || '0.00'}
            </span>
          </Typography>
          <Typography>
            Room Invoices:{' '}
            <span style={{ fontWeight: 600 }}>
              {filteredData?.filter((inv) => inv.type === 'Room').length || 0}
            </span>
          </Typography>
          <Typography>
            Restaurant Invoices:{' '}
            <span style={{ fontWeight: 600 }}>
              {filteredData?.filter((inv) => inv.type === 'Restaurant')
                .length || 0}
            </span>
          </Typography>
        </Box>
      </Box>

      <CustomTableContainer>
        <Table>
          <TableBody>
            <TableRow>
              {[
                'Type',
                'Invoice No',
                'Date/Time',
                'Customer Name',
                'Total Amount ₹',
                'SGST ₹',
                'CGST ₹',
                'Payable Amount ₹',
                'Total Paid ₹',
                'Due Amount ₹',
                'Payment Method',
              ].map((item, index) => (
                <HeadingCell key={index} sx={{ fontWeight: 'bold' }}>
                  {item}
                </HeadingCell>
              ))}
            </TableRow>
            {filteredData?.map((row, index) => (
              <TableRow key={index}>
                <BodyCell>{row.type}</BodyCell>
                <BodyCell>{row.invoice_no}</BodyCell>
                <BodyCell>
                  {row.date} {row.time}
                </BodyCell>
                <BodyCell>{row.customer_name || 'N/A'}</BodyCell>
                <BodyCell>{row.total_amount}</BodyCell>
                <BodyCell>{row.tax / 2}</BodyCell>
                <BodyCell>{row.tax / 2}</BodyCell>
                <BodyCell>{row.payable_amount}</BodyCell>
                <BodyCell>
                  {row.payments
                    ?.reduce(
                      (acc, payment) => acc + (parseFloat(payment.amount) || 0),
                      0,
                    )
                    .toFixed(2) || '0.00'}
                </BodyCell>
                <BodyCell>{row.due || 0}</BodyCell>
                <BodyCell>
                  {row.mop ||
                    row.payments?.map((p) => p.mop).join(', ') ||
                    'N/A'}
                </BodyCell>
              </TableRow>
            ))}
            {/* Totals Row */}
            <TableRow>
              <HeadingCell
                colSpan={4}
                sx={{ textAlign: 'right', fontWeight: 'bold' }}
              >
                TOTAL
              </HeadingCell>
              <HeadingCell sx={{ fontWeight: 'bold' }}>
                ₹{totalAmount?.toFixed(2) || '0.00'}
              </HeadingCell>
              <HeadingCell sx={{ fontWeight: 'bold' }}>
                ₹{(totalGst / 2)?.toFixed(2) || '0.00'}
              </HeadingCell>
              <HeadingCell sx={{ fontWeight: 'bold' }}>
                ₹{(totalGst / 2)?.toFixed(2) || '0.00'}
              </HeadingCell>
              <HeadingCell sx={{ fontWeight: 'bold' }}>
                ₹{totalPayable?.toFixed(2) || '0.00'}
              </HeadingCell>
              <HeadingCell sx={{ fontWeight: 'bold' }}>
                ₹{totalPaid?.toFixed(2) || '0.00'}
              </HeadingCell>
              <HeadingCell sx={{ fontWeight: 'bold' }}>
                ₹{totalDue?.toFixed(2) || '0.00'}
              </HeadingCell>
              <HeadingCell sx={{ fontWeight: 'bold' }}>-</HeadingCell>
            </TableRow>
          </TableBody>
        </Table>
      </CustomTableContainer>
      <Typography variant="body2" mt={2}>
        Report generated from: www.solvotel.com
      </Typography>
    </Box>
  );
});

DueReportPrint.displayName = 'DueReportPrint'; // 👈 required

export { DueReportPrint };
