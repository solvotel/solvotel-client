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

// Removed toInt helper; keep numeric values and format when rendering

const RoomInvoicePrint = React.forwardRef((props, ref) => {
  const toWords = new ToWords();
  const { data, hotel, booking } = props;
  // format date ranges compactly: "11 - 12 Feb 2026" or with months when needed
  const formatDateRange = (inDateStr, outDateStr) => {
    if (!inDateStr || !outDateStr) return '';
    const inDate = new Date(inDateStr);
    const outDate = new Date(outDateStr);
    if (isNaN(inDate) || isNaN(outDate)) return '';

    const inDay = inDate.getDate();
    const outDay = outDate.getDate();
    const inMonth = inDate.toLocaleString('en-US', { month: 'short' });
    const outMonth = outDate.toLocaleString('en-US', { month: 'short' });
    const inYear = inDate.getFullYear();
    const outYear = outDate.getFullYear();

    if (inYear === outYear) {
      if (inMonth === outMonth) {
        return `${inDay} - ${outDay} ${inMonth} ${inYear}`;
      }
      return `${inDay} ${inMonth} - ${outDay} ${outMonth} ${inYear}`;
    }
    return `${inDay} ${inMonth} ${inYear} - ${outDay} ${outMonth} ${outYear}`;
  };
  const roomTokens = [];
  const serviceTokens = [];
  const foodTokens = [];

  data?.service_tokens?.forEach((service) => {
    service.items?.forEach((it) => {
      const rateNum = parseFloat(it.rate) || 0;
      const amountNum = parseFloat(it.amount) || 0;
      const gstAmount = amountNum - rateNum;
      const gstPercent = rateNum > 0 ? (gstAmount / rateNum) * 100 : 0;
      const sgst = gstAmount / 2;
      const cgst = gstAmount / 2;
      serviceTokens.push({
        item: it.item,
        hsn: it.hsn || '-',
        rate: rateNum,
        gst: gstAmount,
        gst_percent: gstPercent,
        sgst,
        cgst,
        room: service.room_no,
        amount: amountNum,
      });
    });
  });

  data?.room_tokens?.forEach((room) => {
    const ratePerNight = parseFloat(room?.rate) || 0;
    const days = Number(room.days) || 0;
    const finalRate = ratePerNight * days;
    const gstPercent = parseFloat(room.gst) || 0;
    const gstAmount = (finalRate * gstPercent) / 100;
    const sgst = gstAmount / 2;
    const cgst = gstAmount / 2;
    roomTokens.push({
      item: room.item,
      room: room.room,
      hsn: room.hsn,
      rate: finalRate,
      gst: gstAmount,
      gst_percent: gstPercent,
      sgst,
      cgst,
      amount: parseFloat(room.amount) || finalRate + gstAmount,
      in_date: room.in_date,
      out_date: room.out_date,
    });
  });

  data?.food_tokens?.forEach((food) => {
    const gst = parseFloat(food.total_gst) || 0;
    const payable = parseFloat(food.total_amount) || 0;
    const rateBeforeGst = payable - gst;
    const gstPercent = rateBeforeGst > 0 ? (gst / rateBeforeGst) * 100 : 0;
    const sgst = gst / 2;
    const cgst = gst / 2;
    foodTokens.push({
      item: 'Food Charges',
      room: food.room_no,
      hsn: '996331',
      rate: rateBeforeGst,
      gst,
      gst_percent: gstPercent,
      sgst,
      cgst,
      amount: payable,
    });
  });

  const allTokens = [...roomTokens, ...serviceTokens, ...foodTokens];

  const totalRate = allTokens.reduce(
    (acc, token) => acc + (token?.rate || 0),
    0,
  );
  const totalCGST = allTokens.reduce(
    (acc, token) => acc + (token?.cgst || 0),
    0,
  );
  const totalSGST = allTokens.reduce(
    (acc, token) => acc + (token?.sgst || 0),
    0,
  );
  const totalGST = totalCGST + totalSGST;
  const totalAmount = totalRate + totalGST;

  // 'Less' is the fractional part (after decimal) of totalAmount, rounded to 2 decimals
  const less = parseFloat((totalAmount - Math.floor(totalAmount)).toFixed(2));
  // Payable amount is totalAmount minus the fractional part (i.e., integer rupees)
  const payableAmount = parseFloat((totalAmount - less).toFixed(2));

  // Use payableAmount (integer rupees) for words
  let totalInWords = toWords?.convert(payableAmount || 0);

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
                          hotel?.hotel_logo?.url ||
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
                      <Typography>Booking Id: {booking?.booking_id}</Typography>
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
                <CustomTableCell align="right" width="12%">
                  <Typography fontWeight={600}>Rate</Typography>
                </CustomTableCell>
                <CustomTableCell align="right" width="12%">
                  <Typography fontWeight={600}>SGST</Typography>
                </CustomTableCell>
                <CustomTableCell align="right" width="12%">
                  <Typography fontWeight={600}>CGST</Typography>
                </CustomTableCell>
                <CustomTableCell align="right" width="12%">
                  <Typography fontWeight={600}>Total GST</Typography>
                </CustomTableCell>
                <CustomTableCell align="right" width="12%">
                  <Typography fontWeight={600}>Total</Typography>
                </CustomTableCell>
              </TableRow>
            </TableBody>
            <TableBody>
              {allTokens?.map((token, index) => (
                <TableRow key={index}>
                  <CustomTableCell
                    sx={{
                      borderBottom: '1px solid #cecece',
                      borderTop: 'none',
                      py: 0.3,
                    }}
                  >
                    {token?.item}
                    <br />
                    <span style={{ fontSize: '12px' }}>Room: {token.room}</span>

                    {(token?.in_date || token?.out_date) && (
                      <span
                        style={{
                          fontSize: '12px',

                          marginTop: 2,
                        }}
                      >
                        &nbsp;&nbsp;|&nbsp;&nbsp;
                        {formatDateRange(token?.in_date, token?.out_date)}
                      </span>
                    )}
                  </CustomTableCell>
                  <CustomTableCell
                    sx={{
                      borderBottom: '1px solid #cecece',
                      borderTop: 'none',
                      py: 0.3,
                    }}
                    align="center"
                  >
                    {token?.hsn}
                  </CustomTableCell>
                  <CustomTableCell
                    sx={{
                      borderBottom: '1px solid #cecece',
                      borderTop: 'none',
                      py: 0.3,
                    }}
                    align="right"
                  >
                    {typeof token?.rate === 'number'
                      ? token.rate.toFixed(2)
                      : '-'}
                  </CustomTableCell>
                  <CustomTableCell
                    align="right"
                    sx={{
                      borderBottom: '1px solid #e5e5e5',
                      borderTop: 'none',
                      py: 0.3,
                    }}
                  >
                    <Typography>
                      {typeof token?.sgst === 'number'
                        ? token.sgst.toFixed(2)
                        : '-'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '11px' }}>
                      {typeof token?.gst_percent === 'number'
                        ? token.gst_percent / 2
                        : '0'}
                      %
                    </Typography>
                  </CustomTableCell>
                  <CustomTableCell
                    align="right"
                    sx={{
                      borderBottom: '1px solid #cecece',
                      borderTop: 'none',
                      py: 0.3,
                    }}
                  >
                    <Typography>
                      {typeof token?.cgst === 'number'
                        ? token.cgst.toFixed(2)
                        : '-'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '11px' }}>
                      {typeof token?.gst_percent === 'number'
                        ? token.gst_percent / 2
                        : '0'}
                      %
                    </Typography>
                  </CustomTableCell>
                  <CustomTableCell
                    align="right"
                    sx={{
                      borderBottom: '1px solid #cecece',
                      borderTop: 'none',
                      py: 0.3,
                    }}
                  >
                    <Typography>
                      {typeof token?.gst === 'number'
                        ? token.gst.toFixed(2)
                        : '-'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '11px' }}>
                      {typeof token?.gst_percent === 'number'
                        ? token.gst_percent
                        : '0'}
                      %
                    </Typography>
                  </CustomTableCell>
                  <CustomTableCell
                    align="right"
                    sx={{
                      borderBottom: '1px solid #cecece',
                      borderTop: 'none',
                      py: 0.3,
                    }}
                  >
                    <Box>
                      <Typography>
                        {typeof token?.amount === 'number'
                          ? token.amount.toFixed(2)
                          : '-'}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '11px' }}>
                        {typeof token?.gst_percent === 'number'
                          ? token.gst_percent
                          : '0'}
                        %
                      </Typography>
                    </Box>
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
                      sx={{ borderBottom: 'none', borderTop: 'none', py: 0.3 }}
                    >
                      &nbsp;
                    </CustomTableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            <TableBody>
              <TableRow>
                <CustomTableCell colSpan={2}>
                  <Typography fontWeight={600} sx={{ mb: 10 }}>
                    GUEST SIGNATURE:
                  </Typography>
                  <Typography sx={{ fontSize: '8px' }}>
                    I agree that I&apos;m responsible for the full payment of
                    this invoice,in the event it is not paid by the
                    company,organisation or person indicated above.
                  </Typography>
                </CustomTableCell>
                <CustomTableCell colSpan={2}>
                  <Typography fontWeight={600} sx={{ mb: 20 }}>
                    Authorised Signatory:
                  </Typography>
                </CustomTableCell>
                <CustomTableCell colSpan={3}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">Taxable</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {totalRate.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">SGST (₹)</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {totalSGST.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">CGST (₹)</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {totalCGST.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">Grand Total</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {totalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">Round off</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {less.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">Payable Amount</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {payableAmount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ borderTop: '1px solid #cecece' }}>
                    <Typography variant="body2">Amount In Words:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {totalInWords} Only
                    </Typography>
                  </Box>
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
