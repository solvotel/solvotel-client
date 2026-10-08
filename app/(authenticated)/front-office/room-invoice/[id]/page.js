'use client';

import React, { use, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Button,
  Divider,
  Breadcrumbs,
  Link,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useAuth } from '@/context';
import { GetSingleData, GetDataList } from '@/utils/ApiFunctions';
import { Loader } from '@/component/common';
import { RoomInvoicePrint } from '@/component/printables/RoomInvoicePrint';
import { GetCustomDate } from '@/utils/DateFetcher';
import { QRCodeCanvas } from 'qrcode.react';
import { ErrorToast } from '@/utils/GenerateToast';

// removed toInt — values will be displayed with two decimal places

export default function RoomInvoicePage({ params }) {
  const { auth } = useAuth();
  const { id } = use(params);
  const componentRef = useRef(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // ✅ Data fetching (same style you use)
  const invoiceData = GetSingleData({
    auth,
    endPoint: 'room-invoices',
    id: id,
  });

  const hotel = GetSingleData({
    endPoint: 'hotels',
    auth: auth,
    id: auth?.user?.hotel_id,
  });

  const roomBookings = GetDataList({
    auth,
    endPoint: 'room-bookings',
  });

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'room-invoice',
  });

  const handleDownloadPdf = async () => {
    const invoiceElement = componentRef.current;
    if (!invoiceElement) {
      ErrorToast('Unable to prepare the invoice PDF.');
      return;
    }

    try {
      setDownloadingPdf(true);
      await document.fonts.ready;
      const canvas = await html2canvas(invoiceElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: invoiceElement.scrollWidth,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const margin = 0;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;
      const pageCanvasHeight = Math.floor(
        (canvas.width * contentHeight) / contentWidth,
      );
      const pageCanvas = document.createElement('canvas');
      const pageContext = pageCanvas.getContext('2d');

      if (!pageContext) {
        throw new Error('Unable to create invoice PDF pages.');
      }

      pageCanvas.width = canvas.width;
      for (
        let pageIndex = 0, offsetY = 0;
        offsetY < canvas.height;
        pageIndex += 1
      ) {
        const sliceHeight = Math.min(pageCanvasHeight, canvas.height - offsetY);
        pageCanvas.height = sliceHeight;
        pageContext.fillStyle = '#ffffff';
        pageContext.fillRect(0, 0, pageCanvas.width, sliceHeight);
        pageContext.drawImage(
          canvas,
          0,
          offsetY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight,
        );

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(
          pageCanvas.toDataURL('image/png'),
          'PNG',
          margin,
          margin,
          contentWidth,
          (sliceHeight * contentWidth) / canvas.width,
        );
        offsetY += sliceHeight;
      }

      pdf.save(`${invoiceData?.invoice_no || 'room-invoice'}.pdf`);
    } catch (error) {
      console.error('Unable to download invoice PDF:', error);
      ErrorToast('Unable to download the invoice PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (!invoiceData || !hotel || !roomBookings) {
    return <Loader />;
  }

  const booking = roomBookings?.find(
    (item) => item?.documentId === invoiceData?.room_booking?.documentId,
  );

  // ✅ Build tokens and totals
  const roomTokens = [];
  const serviceTokens = [];
  const foodTokens = [];

  invoiceData?.service_tokens?.forEach((service) => {
    service.items?.forEach((it) => {
      const gstAmount = it?.amount - it?.rate;
      const sgst = parseFloat(gstAmount / 2).toFixed(1);
      const cgst = parseFloat(gstAmount / 2).toFixed(1);
      serviceTokens.push({
        item: it.item,
        hsn: it.hsn || '-',
        rate: it.rate,
        gst: gstAmount,
        sgst,
        cgst,
        room: service.room_no,
        amount: it.amount,
      });
    });
  });

  invoiceData?.room_tokens?.forEach((room) => {
    const finalRate = room?.rate * room.days;
    const gstAmount = (finalRate * room.gst) / 100;
    const sgst = gstAmount / 2;
    const cgst = gstAmount / 2;
    roomTokens.push({
      item: room.item,
      room: room.room,
      hsn: room.hsn,
      rate: room.rate,
      gst: gstAmount,
      sgst,
      cgst,
      amount: room.amount,
      in_date: room.in_date,
      out_date: room.out_date,
    });
  });

  invoiceData?.food_tokens?.forEach((food) => {
    const gst = parseFloat(food.total_gst).toFixed(1);
    const payable = parseFloat(food.total_amount).toFixed(1);

    foodTokens.push({
      item: 'Food Charges',
      room: food.room_no,
      hsn: '996331',
      rate: payable - gst,
      gst: gst,
      sgst: gst / 2,
      cgst: gst / 2,
      amount: payable,
    });
  });

  const allTokens = [...roomTokens, ...serviceTokens, ...foodTokens];

  return (
    <>
      {/* ✅ Breadcrumb Header */}
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/front-office/room-invoice/"
          >
            Room Invoices
          </Link>
          <Typography color="text.primary">{invoiceData.invoice_no}</Typography>
        </Breadcrumbs>
      </Box>

      {/* ✅ Main Content */}
      <Box p={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" fontWeight="bold">
            🧾 Invoice: {invoiceData.invoice_no}
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? 'Preparing…' : 'Download'}
            </Button>
          </Box>
        </Box>

        {/* Invoice + Customer Info */}
        <Box mb={2}>
          <Typography variant="subtitle1">
            <strong>Date:</strong> {GetCustomDate(invoiceData.date)} |{' '}
            <strong>Time:</strong> {invoiceData.time}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Customer:</strong> {invoiceData.customer_name} (
            {invoiceData.customer_phone})
          </Typography>
          <Typography variant="subtitle1">
            <strong>GST:</strong> {invoiceData.customer_gst || 'N/A'}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Address:</strong> {invoiceData.customer_address}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Items Summary Table */}
        <Typography variant="h6" gutterBottom>
          Items Summary
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Item</strong>
                </TableCell>
                <TableCell>
                  <strong>HSN</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Rate (₹)</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>SGST (₹)</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>CGST (₹)</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Amount (₹)</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allTokens.map((token, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {token.item} <br />
                    <span style={{ fontSize: '12px' }}>Room: {token.room}</span>
                  </TableCell>
                  <TableCell>{token.hsn}</TableCell>
                  <TableCell align="right">
                    {parseFloat(token.rate || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(token?.sgst || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(token?.cgst || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(token?.amount || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals */}
        <Box mt={2}>
          <Typography variant="h6">💰 Summary</Typography>
          <Typography>
            Subtotal : ₹{parseFloat(invoiceData.total_amount || 0).toFixed(2)}
          </Typography>
          <Typography>
            SGST : ₹{parseFloat((invoiceData.tax || 0) / 2).toFixed(2)}
          </Typography>
          <Typography>
            CGST : ₹{parseFloat((invoiceData.tax || 0) / 2).toFixed(2)}
          </Typography>
          <Typography fontWeight="bold" color="primary">
            Grand Total : ₹
            {parseFloat(invoiceData.payable_amount || 0).toFixed(2)}
          </Typography>
        </Box>
      </Box>

      {/* ✅ Hidden printable component */}
      <div
        style={{
          position: 'absolute',
          left: '-10000px',
          top: 0,
          width: '1020px',
          background: '#ffffff',
        }}
      >
        <RoomInvoicePrint
          ref={componentRef}
          data={invoiceData}
          hotel={hotel}
          booking={booking}
        />
      </div>
    </>
  );
}
