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
import { ToWords } from 'to-words';

const CustomTableCell = styled(TableCell)`
  border: 1px solid black;
  padding: 5px;
  & > p {
    font-size: 15px;
  }
`;
const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      // can be used to override defaults for the selected locale
      name: 'Rupee',
      plural: 'Rupees',
      symbol: '₹',
      fractionalUnit: {
        name: 'Paisa',
        plural: 'Paise',
        symbol: '',
      },
    },
  },
});
const RoomInvoicePrint = React.forwardRef((props, ref) => {
  const toWords = new ToWords();
  const { data, hotel, booking } = props;
  const roomTokens = [];
  const serviceTokens = [];
  const foodTokens = [];

  data?.room_tokens?.forEach((room) => {
    const finalRate = room?.rate * room.days;
    const gstAmount = (finalRate * room.gst) / 100;
    const sgst = gstAmount / 2;
    const cgst = gstAmount / 2;
    roomTokens.push({
      item: room.item,
      hsn: room.hsn,
      rate: room.rate,
      gst: gstAmount,
      sgst,
      cgst,
      amount: room.amount,
    });
  });

  data?.service_tokens?.forEach((service) => {
    service.items?.forEach((it) => {
      const gstAmount = it.amount - parseFloat(it.rate);
      const sgst = gstAmount / 2;
      const cgst = gstAmount / 2;
      serviceTokens.push({
        item: it.item,
        hsn: it.hsn,
        rate: it.rate,
        gst: gstAmount,
        sgst,
        cgst,
        amount: it.amount,
      });
    });
  });

  data?.food_tokens?.forEach((food) => {
    food.items?.forEach((it) => {
      const finalRate = it?.rate * it.qty;
      const gstAmount = it.amount - finalRate;
      const sgst = gstAmount / 2;
      const cgst = gstAmount / 2;
      foodTokens.push({
        item: it.item,
        hsn: it.hsn,
        rate: it.rate,
        gst: gstAmount,
        sgst,
        cgst,
        amount: it.amount,
      });
    });
  });

  const allTokens = [...roomTokens, ...serviceTokens, ...foodTokens];

  let totalInWords = toWords?.convert(data?.payable_amount || 0);

  return (
    <div ref={ref}>
      {/* ✅ Watermark Layer */}
      {hotel?.hotel_logo?.url && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '60%',
            height: '60%',
            transform: 'translate(-50%, -50%)',
            backgroundImage: `url(${hotel.hotel_logo.url})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            opacity: 0.08, // transparency for watermark
            zIndex: 0,
            pointerEvents: 'none', // allows clicks/printing normally
          }}
        />
      )}
      <Box sx={{ p: 2, position: 'relative', zIndex: 1 }}>
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
                  <Typography align="center">
                    GSTIN:{hotel?.hotel_gst_no}
                  </Typography>
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
                <CustomTableCell align="center" width="8%">
                  <Typography fontWeight={600}>HSN/SAC</Typography>
                </CustomTableCell>
                <CustomTableCell align="center" width="12%">
                  <Typography fontWeight={600}>Rate.</Typography>
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
                    {parseFloat(
                      token?.amount - (token?.cgst + token?.sgst)
                    ).toFixed(1)}
                  </CustomTableCell>
                  <CustomTableCell
                    align="center"
                    sx={{ borderBottom: 'none', borderTop: 'none', py: 0.5 }}
                  >
                    {token?.sgst.toFixed(1)}
                  </CustomTableCell>
                  <CustomTableCell
                    align="center"
                    sx={{ borderBottom: 'none', borderTop: 'none', py: 0.5 }}
                  >
                    {token?.cgst.toFixed(1)}
                  </CustomTableCell>
                  <CustomTableCell
                    align="center"
                    sx={{ borderBottom: 'none', borderTop: 'none', py: 0.5 }}
                  >
                    {(token?.cgst + token?.sgst).toFixed(1)}
                  </CustomTableCell>
                  <CustomTableCell
                    align="center"
                    sx={{ borderBottom: 'none', borderTop: 'none', py: 0.5 }}
                  >
                    {token?.amount.toFixed(1)}
                  </CustomTableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableBody>
              {Array.from({
                length: 17 - (allTokens?.length || 0),
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
                  <Typography>{data?.total_amount.toFixed(1)}</Typography>
                </CustomTableCell>
                <CustomTableCell align="center">
                  <Typography>
                    {parseFloat(data?.tax / 2).toFixed(1)}
                  </Typography>
                </CustomTableCell>
                <CustomTableCell align="center">
                  <Typography>
                    {parseFloat(data?.tax / 2).toFixed(1)}
                  </Typography>
                </CustomTableCell>

                <CustomTableCell align="center">
                  <Typography>{parseFloat(data?.tax).toFixed(1)}</Typography>
                </CustomTableCell>

                <CustomTableCell align="center">
                  <Typography>
                    {parseFloat(data?.payable_amount).toFixed(1)}
                  </Typography>
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
