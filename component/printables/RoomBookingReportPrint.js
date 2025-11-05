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
const RoomBookingReportPrint = React.forwardRef((props, ref) => {
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
        Room Booking Report
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
                'Booking ID',
                'Guest',
                'Booking Type',
                'Room No',
                'Room Tokens',
                'Services',
                'Food Items',
                'Grand Total',
                'Total Paid',
                'Due Payment',
              ].map((item, index) => (
                <HeadingCell key={index} sx={{ fontWeight: 'bold' }}>
                  {item}
                </HeadingCell>
              ))}
            </TableRow>
            {filteredData?.map((row, index) => {
              const totalRoomAmount = row?.room_tokens.reduce(
                (sum, r) => sum + (parseFloat(r.total_amount) || r.amount || 0),
                0
              );
              const totalServiceAmount = row?.service_tokens.reduce(
                (sum, s) => sum + (parseFloat(s.total_amount) || 0),
                0
              );
              const totalFoodAmount = row?.food_tokens.reduce(
                (sum, f) => sum + (parseFloat(f.total_amount) || 0),
                0
              );
              const totalAmount = row?.payment_tokens.reduce(
                (sum, p) => sum + (Number(p.amount) || 0),
                0
              );
              const advancePayment = row?.advance_payment || null;
              const advanceAmount = advancePayment?.amount || 0;

              const grandTotal =
                totalRoomAmount + totalServiceAmount + totalFoodAmount;
              const amountPayed = totalAmount + advanceAmount;
              const dueAmount = grandTotal - amountPayed;
              return (
                <TableRow key={index}>
                  <BodyCell>{row.booking_id}</BodyCell>
                  <BodyCell>{row.customer.company_name}</BodyCell>
                  <BodyCell>{row.booking_type}</BodyCell>
                  <BodyCell>
                    {row.rooms.map((r) => r.room_no).join(', ')}
                  </BodyCell>
                  <BodyCell>{totalRoomAmount}</BodyCell>
                  <BodyCell>{totalServiceAmount}</BodyCell>
                  <BodyCell>{totalFoodAmount}</BodyCell>
                  <BodyCell>{grandTotal}</BodyCell>
                  <BodyCell>{amountPayed}</BodyCell>
                  <BodyCell>{dueAmount.toFixed(2)}</BodyCell>
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

RoomBookingReportPrint.displayName = 'RoomBookingReportPrint'; // 👈 required

export { RoomBookingReportPrint };
