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
const CollectionReportPrint = React.forwardRef((props, ref) => {
  const { filteredData, startDate, endDate, stats } = props;

  return (
    <Box
      ref={ref}
      sx={{
        p: 3,
        backgroundColor: '#fff',
      }}
    >
      <Typography variant="h6" textAlign={'center'} fontWeight={600} mb={2}>
        Collection Report
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
          Collection Summary
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Typography>
            Total Payments:{' '}
            <span style={{ fontWeight: 600 }}>{stats?.totalPayments || 0}</span>
          </Typography>
          <Typography>
            Total Amount Collected:{' '}
            <span style={{ fontWeight: 600 }}>
              ₹{stats?.totalAmount?.toFixed(2) || '0.00'}
            </span>
          </Typography>
        </Box>

        {/* MOP-wise Stats */}
        <Typography variant="subtitle2" fontWeight={600} mt={1} mb={1}>
          Payment Method Breakdown:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {stats?.mopStats &&
            Object.entries(stats.mopStats).map(([mop, data]) => (
              <Box
                key={mop}
                sx={{
                  p: 1,
                  border: '1px solid black',
                  borderRadius: 1,
                  minWidth: 120,
                  backgroundColor: '#f5f5f5',
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {mop}
                </Typography>
                <Typography variant="body2">Payments: {data.count}</Typography>
                <Typography variant="body2">
                  Amount: ₹{data.amount.toFixed(2)}
                </Typography>
              </Box>
            ))}
        </Box>
      </Box>

      <CustomTableContainer>
        <Table>
          <TableBody>
            <TableRow>
              {[
                'Invoice No',
                'Source',
                'Customer Name',
                'Payment Method',
                'Amount ₹',
                'Timestamp',
              ].map((item, index) => (
                <HeadingCell key={index} sx={{ fontWeight: 'bold' }}>
                  {item}
                </HeadingCell>
              ))}
            </TableRow>
            {filteredData?.map((payment, index) => (
              <TableRow key={index}>
                <BodyCell>{payment.invoice_no}</BodyCell>
                <BodyCell>{payment.source}</BodyCell>
                <BodyCell>{payment.customer_name || 'N/A'}</BodyCell>
                <BodyCell>{payment.mop}</BodyCell>
                <BodyCell align="right">₹{payment.amount.toFixed(2)}</BodyCell>
                <BodyCell>
                  {new Date(payment.time_stamp).toLocaleString()}
                </BodyCell>
              </TableRow>
            ))}
            {/* Totals Row */}
            <TableRow>
              <HeadingCell
                colSpan={5}
                sx={{ textAlign: 'right', fontWeight: 'bold' }}
              >
                TOTAL
              </HeadingCell>
              <HeadingCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                ₹{stats?.totalAmount?.toFixed(2) || '0.00'}
              </HeadingCell>
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

CollectionReportPrint.displayName = 'CollectionReportPrint'; // 👈 required

export { CollectionReportPrint };
