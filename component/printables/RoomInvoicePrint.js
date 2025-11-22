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
import Image from 'next/image';
import React from 'react';
import { ToWords } from 'to-words';

const CustomTableCell = styled(TableCell)`
  border: 1px solid black;
  padding: 5px;
  & > p {
    font-size: 14px;
    line-height: '0.9em';
  }
`;

const RoomInvoicePrint = React.forwardRef((props, ref) => {
  const toWords = new ToWords();
  const { data, hotel, booking } = props;
  const roomTokens = [];
  const serviceTokens = [];
  const foodTokens = [];

  data?.service_tokens?.forEach((service) => {
    service.items?.forEach((it) => {
      const gstAmount = it.amount - parseInt(it.rate);
      const sgst = parseInt(gstAmount / 2);
      const cgst = parseInt(gstAmount / 2);
      serviceTokens.push({
        item: it.item,
        hsn: it.hsn || '-',
        rate: parseInt(it.rate),
        gst: parseInt(gstAmount),
        sgst,
        cgst,
        room: service.room_no,
        amount: parseInt(it.amount),
      });
    });
  });

  data?.room_tokens?.forEach((room) => {
    const finalRate = parseInt(room?.rate) * parseInt(room.days);
    const gstAmount = (finalRate * room.gst) / 100;
    const sgst = parseInt(gstAmount / 2);
    const cgst = parseInt(gstAmount / 2);
    roomTokens.push({
      item: room.item,
      room: room.room,
      hsn: room.hsn,
      rate: parseInt(room.rate),
      gst: parseInt(gstAmount),
      sgst,
      cgst,
      amount: room.amount,
    });
  });

  data?.food_tokens?.forEach((food) => {
    const gst = parseInt(food.total_gst);
    const payable = parseInt(food.total_amount);

    foodTokens.push({
      item: 'Food Charges',
      room: food.room_no,
      hsn: '996331',
      rate: parseInt(payable - gst),
      gst: parseInt(gst),
      sgst: parseInt(gst / 2),
      cgst: parseInt(gst / 2),
      amount: payable,
    });
  });

  const allTokens = [...roomTokens, ...serviceTokens, ...foodTokens];

  let totalInWords = toWords?.convert(data?.payable_amount || 0);

  return (
    <div ref={ref}>
      <Box sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <CustomTableCell colSpan={7} align="center">
                  <Typography fontWeight={600} align="center">
                    TAX INVOICE
                  </Typography>
                </CustomTableCell>
              </TableRow>
              <TableRow>
                <CustomTableCell colSpan={7} align="center">
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Box sx={{ display: 'flex' }}>
                      <img
                        src={
                          hotel.hotel_logo.url ||
                          'https://res.cloudinary.com/deyxdpnom/image/upload/v1760012402/demo_hpzblb.png'
                        }
                        width="100px"
                        height="100px"
                        alt="logo"
                      />
                      <Box sx={{ textAlign: 'left', ml: 1.5 }}>
                        <Typography variant="h5">
                          {hotel?.hotel_name}
                        </Typography>
                        <Typography variant="body1">
                          Contact: {hotel?.hotel_mobile}
                          {`, ${hotel?.hotel_alt_mobile} `} | Email:{' '}
                          {hotel?.hotel_email || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          {hotel?.hotel_address_line1},
                          {hotel?.hotel_address_line2},{hotel?.hotel_state},
                          {hotel?.hotel_pincode}
                        </Typography>
                        <Typography variant="body2">
                          GSTIN:{hotel?.hotel_gst_no}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'end',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography>Booking Id: {booking.booking_id}</Typography>
                    </Box>
                  </Box>
                </CustomTableCell>
              </TableRow>
              <TableRow>
                <CustomTableCell rowSpan={3} colSpan={2}>
                  <Typography variant="caption">Bill to</Typography>
                  <Typography variant="body2">
                    Guest Name: {booking?.customer?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Phone: {booking?.customer?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Company Name: {booking?.customer?.company_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Address: {booking?.customer?.address || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    GSTIN: {booking?.customer?.gst_no || 'N/A'}
                  </Typography>
                </CustomTableCell>
                <CustomTableCell colSpan={2}>
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
                <CustomTableCell colSpan={2}>
                  <Typography fontWeight={600}>
                    Check-out: {GetCustomDate(booking?.checkout_date)}
                  </Typography>
                </CustomTableCell>
                <CustomTableCell rowSpan={2} colSpan={2} align="center">
                  <Typography fontWeight={600}>{data?.invoice_no}</Typography>
                </CustomTableCell>
                <CustomTableCell rowSpan={2} align="center">
                  <Typography fontWeight={600}>
                    {GetCustomDate(booking?.checkout_date)}
                  </Typography>
                </CustomTableCell>
              </TableRow>
              <TableRow>
                <CustomTableCell colSpan={2}>
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
                <CustomTableCell align="center" width="8%">
                  <Typography fontWeight={600}>HSN/SAC</Typography>
                </CustomTableCell>
                <CustomTableCell align="center" width="12%">
                  <Typography fontWeight={600}>Rate</Typography>
                </CustomTableCell>
                <CustomTableCell align="center" width="12%">
                  <Typography fontWeight={600}>SGST</Typography>
                </CustomTableCell>
                <CustomTableCell align="center" width="12%">
                  <Typography fontWeight={600}>CGST</Typography>
                </CustomTableCell>
                <CustomTableCell align="center" width="12%">
                  <Typography fontWeight={600}>Total GST</Typography>
                </CustomTableCell>
                <CustomTableCell align="center" width="12%">
                  <Typography fontWeight={600}>Total</Typography>
                </CustomTableCell>
              </TableRow>
            </TableBody>
            <TableBody>
              {allTokens?.map((token, index) => (
                <TableRow key={index}>
                  <CustomTableCell
                    sx={{ borderBottom: 'none', borderTop: 'none', py: 0.5 }}
                  >
                    {token?.item}
                    <br />
                    <span style={{ fontSize: '12px' }}>Room: {token.room}</span>
                  </CustomTableCell>
                  <CustomTableCell
                    sx={{ borderBottom: 'none', borderTop: 'none', py: 0.5 }}
                    align="center"
                  >
                    {token?.hsn}
                  </CustomTableCell>
                  <CustomTableCell
                    sx={{ borderBottom: 'none', borderTop: 'none', py: 0.5 }}
                    align="center"
                  >
                    {token?.rate || '-'}
                  </CustomTableCell>
                  <CustomTableCell
                    align="center"
                    sx={{ borderBottom: 'none', borderTop: 'none', py: 0.5 }}
                  >
                    {token?.sgst || '-'}
                  </CustomTableCell>
                  <CustomTableCell
                    align="center"
                    sx={{ borderBottom: 'none', borderTop: 'none', py: 0.5 }}
                  >
                    {token?.cgst || '-'}
                  </CustomTableCell>
                  <CustomTableCell
                    align="center"
                    sx={{ borderBottom: 'none', borderTop: 'none', py: 0.5 }}
                  >
                    {token?.gst || '-'}
                  </CustomTableCell>
                  <CustomTableCell
                    align="center"
                    sx={{ borderBottom: 'none', borderTop: 'none', py: 0.5 }}
                  >
                    {token?.amount}
                  </CustomTableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableBody>
              {Array.from({
                length: 10 - (allTokens?.length || 0),
              }).map((_, idx) => (
                <TableRow key={`empty-${idx}`}>
                  {[...Array(7)].map((__, cellIdx) => (
                    <CustomTableCell
                      key={cellIdx}
                      sx={{ borderBottom: 'none', borderTop: 'none', py: 0.5 }}
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
                  <Typography>{parseInt(data?.total_amount)}</Typography>
                </CustomTableCell>
                <CustomTableCell align="center">
                  <Typography>{parseInt(data?.tax / 2)}</Typography>
                </CustomTableCell>
                <CustomTableCell align="center">
                  <Typography>{parseInt(data?.tax / 2)}</Typography>
                </CustomTableCell>

                <CustomTableCell align="center">
                  <Typography>{parseInt(data?.tax)}</Typography>
                </CustomTableCell>

                <CustomTableCell align="center">
                  <Typography>{parseInt(data?.payable_amount)}</Typography>
                </CustomTableCell>
              </TableRow>
              <TableRow>
                <CustomTableCell colSpan={2}>
                  <Typography>Amuount Chargeable (in words):</Typography>
                  <Typography fontWeight={600}>
                    {totalInWords} rupees
                  </Typography>
                </CustomTableCell>
                <CustomTableCell rowSpan={2} colSpan={3} align="center">
                  <Typography variant="body2">
                    I agree that I&apos;m responsible for the full payment of
                    this invoice,in the event it is not paid by the
                    company,organisation or person indicated above.
                  </Typography>
                </CustomTableCell>
                <CustomTableCell colSpan={2} rowSpan={2} align="center">
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
                <CustomTableCell colSpan={7} align="center">
                  <Typography variant="caption">
                    We are Happy to Serve You.Visit us again...
                  </Typography>
                </CustomTableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Typography
          align="center"
          variant="body2"
          mt={1}
          color="text.secondary"
        >
          {hotel?.hotel_footer}
        </Typography>
      </Box>
    </div>
  );
});

RoomInvoicePrint.displayName = 'RoomInvoicePrint';

export { RoomInvoicePrint };
