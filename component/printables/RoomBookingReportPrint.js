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

  const totalAmount = filteredData?.reduce((sum, i) => sum + i.total_amount, 0);
  const totalGst = filteredData?.reduce((sum, i) => sum + i.tax, 0);
  const totalPayable = filteredData?.reduce(
    (sum, i) => sum + i.payable_amount,
    0
  );
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
                'Booking Date',
                'Check-in Date',
                'Check-out Date',
                'Room No',
                'Guest',
                'Company Name',
                'GSTIN',
                'Meal Plan',
                'Notes',
              ].map((item, index) => (
                <HeadingCell key={index} sx={{ fontWeight: 'bold' }}>
                  {item}
                </HeadingCell>
              ))}
            </TableRow>
            {filteredData?.map((row, index) => (
              <TableRow key={index}>
                <BodyCell>{row.booking_id}</BodyCell>
                <BodyCell>{GetCustomDate(row.createdAt)}</BodyCell>
                <BodyCell>{GetCustomDate(row.checkin_date)}</BodyCell>
                <BodyCell>{GetCustomDate(row.checkout_date)}</BodyCell>
                <BodyCell>
                  {row.rooms.map((r) => r.room_no).join(', ')}
                </BodyCell>
                <BodyCell>{row.customer.name}</BodyCell>
                <BodyCell>{row.customer.company_name}</BodyCell>
                <BodyCell>{row.customer.gst_no}</BodyCell>
                <BodyCell>{row.meal_plan}</BodyCell>
                <BodyCell>{row.remarks}</BodyCell>
              </TableRow>
            ))}
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
