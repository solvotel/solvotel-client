import { GetCustomDate } from '@/utils/DateFetcher';
import {
  Box,
  styled,
  Typography,
  Divider,
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
} from '@mui/material';
import React from 'react';

const CustomTableCell = styled(TableCell)`
  border: 1px solid black;
  padding: 5px;
  & > p {
    font-size: 15px;
  }
`;
const RoomInvoicePrint = React.forwardRef((props, ref) => {
  const { data, hotel, booking } = props;
  return (
    <div ref={ref}>
      <Box sx={{ m: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <CustomTableCell colSpan={8} align="center">
                  <Typography fontWeight={600} align="center">
                    TAX INVOICE
                  </Typography>
                </CustomTableCell>
              </TableRow>
              <TableRow>
                <CustomTableCell colSpan={8} align="center">
                  <Typography align="center" variant="h5">
                    {hotel?.hotel_name}
                  </Typography>
                  <Typography align="center">
                    Contact: {hotel?.hotel_mobile}
                    {`, ${hotel?.hotel_alt_mobile} `} | Email:{' '}
                    {hotel?.hotel_email || 'N/A'}
                  </Typography>
                  <Typography align="center">
                    {hotel?.hotel_address_line1},{hotel?.hotel_address_line2},
                    {hotel?.hotel_state},{hotel?.hotel_pincode}
                  </Typography>
                  <Typography align="center">GSTIN:{hotel?.gstNo}</Typography>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography>Bill to</Typography>
                    <Typography>Booking Id: {booking.booking_id}</Typography>
                  </Box>
                </CustomTableCell>
              </TableRow>
              <TableRow>
                <CustomTableCell rowSpan={3} colSpan={2}>
                  <Typography>
                    Guest Name: {booking?.customer?.name || 'N/A'}
                  </Typography>
                  <Typography>
                    Phone: {booking?.customer?.name || 'N/A'}
                  </Typography>
                  <Typography>
                    Company Name: {booking?.customer?.company_name || 'N/A'}
                  </Typography>
                  <Typography>
                    Address: {booking?.customer?.address || 'N/A'}
                  </Typography>
                  <Typography>
                    GSTIN: {booking?.customer?.gst_no || 'N/A'}
                  </Typography>
                </CustomTableCell>
                <CustomTableCell colSpan={3}>
                  <Typography fontWeight={600}>
                    Check-in: {GetCustomDate(booking?.checkin_date)}
                  </Typography>
                </CustomTableCell>
                <CustomTableCell align="center" colSpan={2}>
                  <Typography fontWeight={600}>Invoice:</Typography>
                </CustomTableCell>
                <CustomTableCell align="center">
                  <Typography fontWeight={600}>Date:</Typography>
                </CustomTableCell>
              </TableRow>
              <TableRow>
                <CustomTableCell colSpan={3}>
                  <Typography fontWeight={600}>
                    Check-out: {GetCustomDate(booking?.checkout_date)}
                  </Typography>
                </CustomTableCell>
                <CustomTableCell rowSpan={2} colSpan={2} align="center">
                  <Typography fontWeight={600}>{booking.booking_id}</Typography>
                </CustomTableCell>
                <CustomTableCell rowSpan={2} align="center">
                  <Typography fontWeight={600}>
                    {GetCustomDate(booking?.checkout_date)}
                  </Typography>
                </CustomTableCell>
              </TableRow>
              <TableRow>
                <CustomTableCell colSpan={3}>
                  <Typography>
                    Room No. (s):{' '}
                    {booking?.rooms?.map((item, index) => (
                      <span key={index} style={{ fontWeight: 600 }}>
                        {item?.room_no}
                        {index < booking?.rooms.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </Typography>
                </CustomTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <CustomTableCell align="center">
                  <Typography fontWeight={600}>
                    Description of Services
                  </Typography>
                </CustomTableCell>
                <CustomTableCell align="center" width="9%">
                  <Typography fontWeight={600}>HSN/SAC</Typography>
                </CustomTableCell>
                <CustomTableCell align="center" width="10%">
                  <Typography fontWeight={600}>Base Amt.</Typography>
                </CustomTableCell>
                <CustomTableCell align="center" width="9%">
                  <Typography fontWeight={600}>SGST%</Typography>
                </CustomTableCell>
                <CustomTableCell align="center" width="9%">
                  <Typography fontWeight={600}>CGST%</Typography>
                </CustomTableCell>
                <CustomTableCell align="center" width="9%">
                  <Typography fontWeight={600}>IGST%</Typography>
                </CustomTableCell>
                <CustomTableCell align="center" width="10%">
                  <Typography fontWeight={600}>Total GST</Typography>
                </CustomTableCell>
                <CustomTableCell align="center" width="10%">
                  <Typography fontWeight={600}>Total</Typography>
                </CustomTableCell>
              </TableRow>
            </TableBody>
            <TableBody>
              {/* {bookingData?.room?.map((room, index) => (
              <TableRow key={index}>
                <CustomTableCell
                  sx={{ borderBottom: 'none', borderTop: 'none', py: 2 }}
                >
                  <Typography>
                    Room No:{room?.number}- {room?.category?.category}
                    <br />
                    <span style={{ fontSize: '12px' }}>
                      ({`Per night: Rs.${room?.category?.tariff}/-`})
                    </span>
                  </Typography>
                </CustomTableCell>
                <CustomTableCell
                  sx={{ borderBottom: 'none', borderTop: 'none', py: 2 }}
                  align="center"
                >
                  <Typography>996311</Typography>
                </CustomTableCell>
                <CustomTableCell
                  sx={{ borderBottom: 'none', borderTop: 'none', py: 2 }}
                  align="center"
                >
                  <Typography>{room?.category?.tariff * noOfNights}</Typography>
                </CustomTableCell>
                <CustomTableCell
                  align="center"
                  sx={{ borderBottom: 'none', borderTop: 'none', py: 2 }}
                >
                  <Typography>
                    {isSameState ? room?.category?.sgst : ''}
                  </Typography>
                </CustomTableCell>
                <CustomTableCell
                  align="center"
                  sx={{ borderBottom: 'none', borderTop: 'none', py: 2 }}
                >
                  <Typography>
                    {isSameState ? room?.category?.cgst : ''}
                  </Typography>
                </CustomTableCell>
                <CustomTableCell
                  align="center"
                  sx={{ borderBottom: 'none', borderTop: 'none', py: 2 }}
                >
                  <Typography>
                    {!isSameState
                      ? room?.category?.cgst + room?.category?.sgst
                      : ''}
                  </Typography>
                </CustomTableCell>
                <CustomTableCell
                  align="center"
                  sx={{ borderBottom: 'none', borderTop: 'none', py: 2 }}
                >
                  <Typography>
                    {(room?.category?.total - room?.category?.tariff) *
                      noOfNights}
                  </Typography>
                </CustomTableCell>
                <CustomTableCell
                  align="center"
                  sx={{ borderBottom: 'none', borderTop: 'none', py: 2 }}
                >
                  <Typography>{room?.category?.total * noOfNights}</Typography>
                </CustomTableCell>
              </TableRow>
            ))} */}
            </TableBody>
            <TableBody>
              {Array.from({
                length: 10 - (booking?.rooms?.length || 0),
              }).map((_, idx) => (
                <TableRow key={`empty-${idx}`}>
                  {[...Array(8)].map((__, cellIdx) => (
                    <CustomTableCell
                      key={cellIdx}
                      sx={{ borderBottom: 'none', borderTop: 'none', py: 2 }}
                    >
                      &nbsp;
                    </CustomTableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            <TableBody>
              <TableRow>
                <CustomTableCell>
                  <Typography fontWeight={600}>Grand Total</Typography>
                </CustomTableCell>
                <CustomTableCell align="center">
                  <Typography></Typography>
                </CustomTableCell>
                <CustomTableCell align="center">
                  <Typography>{0}</Typography>
                </CustomTableCell>
                <CustomTableCell align="center">
                  <Typography>{0}</Typography>
                </CustomTableCell>
                <CustomTableCell align="center">
                  <Typography>{0}</Typography>
                </CustomTableCell>
                <CustomTableCell align="center">
                  <Typography>{0}</Typography>
                </CustomTableCell>
                <CustomTableCell align="center">
                  <Typography>{0}</Typography>
                </CustomTableCell>
                <CustomTableCell align="center">
                  <Typography>{0}</Typography>
                </CustomTableCell>
              </TableRow>
              <TableRow>
                <CustomTableCell colSpan={2}>
                  <Typography>Amuount Chargeable (in words):</Typography>
                  <Typography fontWeight={600}>{0} rupees</Typography>
                </CustomTableCell>
                <CustomTableCell rowSpan={2} colSpan={3} align="center">
                  <Typography variant="body2">
                    I agree that I&apos;m responsible for the full payment of
                    this invoice,in the event it is not paid by the
                    company,organisation or person indicated above.
                  </Typography>
                </CustomTableCell>
                <CustomTableCell colSpan={3} rowSpan={2} align="center">
                  <Typography fontWeight={600}>Authorised Signatory</Typography>
                </CustomTableCell>
              </TableRow>
              <TableRow>
                <CustomTableCell colSpan={2}>
                  <Typography fontWeight={600} sx={{ mb: 10 }}>
                    GUEST SIGNATURE:
                  </Typography>
                </CustomTableCell>
              </TableRow>
              <TableRow>
                <CustomTableCell colSpan={8} align="center">
                  <Typography variant="caption">
                    We are Happy to Serve You.Visit us again...
                  </Typography>
                </CustomTableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
});

RoomInvoicePrint.displayName = 'RoomInvoicePrint';

export { RoomInvoicePrint };
