'use client';
import {
  Box,
  Breadcrumbs,
  Button,
  Link,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PrintIcon from '@mui/icons-material/Print';
import TableViewIcon from '@mui/icons-material/TableView';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useAuth } from '@/context';
import { GetTodaysDate, GetCustomDate } from '@/utils/DateFetcher';
import { GetDataList } from '@/utils/ApiFunctions';
import { useState, useMemo, useRef } from 'react';
import { Loader } from '@/component/common';
import { SuccessToast } from '@/utils/GenerateToast';
import { IncomeExpenseReportPrint } from '@/component/printables/IncomeExpenseReportPrint';
import { useReactToPrint } from 'react-to-print';
import { exportToExcel } from '@/utils/exportToExcel';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const IncomeExpenseReportPage = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;

  const purchaseEntries = GetDataList({
    auth,
    endPoint: 'inventory-purchases',
  });
  const saleEntries = GetDataList({ auth, endPoint: 'inventory-sales' });
  const restaurantInvoices = GetDataList({
    auth,
    endPoint: 'restaurant-invoices',
  });
  const roomInvoices = GetDataList({ auth, endPoint: 'room-invoices' });
  const otherExpenses = GetDataList({ auth, endPoint: 'expenses' });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(todaysDate);
  const [filteredData, setFilteredData] = useState({
    purchaseEntries: [],
    saleEntries: [],
    restaurantInvoices: [],
    roomInvoices: [],
    otherExpenses: [],
  });

  const handleSearch = () => {
    if (!startDate || !endDate) {
      SuccessToast('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter helper
    const filterByDate = (list) =>
      list?.filter((item) => {
        const d = new Date(item.date);
        return d >= start && d <= end;
      }) || [];

    setFilteredData({
      restaurantInvoices: filterByDate(restaurantInvoices),
      roomInvoices: filterByDate(roomInvoices),
      otherExpenses: filterByDate(otherExpenses),
      purchaseEntries: filterByDate(purchaseEntries),
      saleEntries: filterByDate(saleEntries),
    });
  };

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'income-expense-report',
  });

  if (
    !purchaseEntries ||
    !saleEntries ||
    !restaurantInvoices ||
    !roomInvoices ||
    !otherExpenses
  )
    return <Loader />;

  // Totals
  const incomeTotal =
    (filteredData.restaurantInvoices?.reduce(
      (acc, i) => acc + (parseFloat(i.payable_amount) || 0),
      0,
    ) || 0) +
    (filteredData.roomInvoices?.reduce(
      (acc, i) => acc + (parseFloat(i.payable_amount) || 0),
      0,
    ) || 0) +
    (filteredData.saleEntries?.reduce(
      (acc, i) => acc + (parseFloat(i.total_price) || 0),
      0,
    ) || 0);

  const expenseTotal =
    (filteredData.purchaseEntries?.reduce(
      (acc, i) => acc + (parseFloat(i.total_price) || 0),
      0,
    ) || 0) +
    (filteredData.otherExpenses?.reduce(
      (acc, i) => acc + (Number(i.amount) || 0),
      0,
    ) || 0);

  const netBalance = incomeTotal - expenseTotal;
  const hasReportData = Object.values(filteredData).some(
    (entries) => entries.length > 0,
  );

  const getExportRows = () => [
    ...filteredData.restaurantInvoices.map((invoice) => ({
      Type: 'Income',
      Date: GetCustomDate(invoice.date) || '-',
      Source: 'Restaurant Invoice',
      'Invoice No': invoice.invoice_no || '-',
      Amount: Number(invoice.payable_amount) || 0,
    })),
    ...filteredData.roomInvoices.map((invoice) => ({
      Type: 'Income',
      Date: GetCustomDate(invoice.date) || '-',
      Source: 'Room Invoice',
      'Invoice No': invoice.invoice_no || '-',
      Amount: Number(invoice.payable_amount) || 0,
    })),
    ...filteredData.saleEntries.map((entry) => ({
      Type: 'Income',
      Date: GetCustomDate(entry.date) || '-',
      Source: 'Inventory Sale',
      'Invoice No': entry.invoice_no || '-',
      Amount: Number(entry.total_price) || 0,
    })),
    ...filteredData.purchaseEntries.map((entry) => ({
      Type: 'Expense',
      Date: GetCustomDate(entry.date) || '-',
      Source: 'Inventory Purchase',
      'Invoice No': entry.invoice_no || '-',
      Amount: Number(entry.total_price) || 0,
    })),
    ...filteredData.otherExpenses.map((entry) => ({
      Type: 'Expense',
      Date: GetCustomDate(entry.date) || '-',
      Source: 'Other Expense',
      'Invoice No': entry.id || '-',
      Amount: Number(entry.amount) || 0,
    })),
  ];

  const handleExport = () => {
    exportToExcel(getExportRows(), 'income_expense_report');
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const formatPdfAmount = (amount) =>
      `INR ${Number(amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    doc.setFontSize(16);
    doc.text('Income Expense Report', 14, 16);
    doc.setFontSize(10);
    doc.text(
      `Start Date: ${GetCustomDate(startDate) || '-'}    End Date: ${GetCustomDate(endDate) || '-'}`,
      14,
      24,
    );
    doc.text(
      `Total Income: ${formatPdfAmount(incomeTotal)}    Total Expenses: ${formatPdfAmount(expenseTotal)}    Net ${netBalance >= 0 ? 'Profit' : 'Loss'}: ${formatPdfAmount(Math.abs(netBalance))}`,
      14,
      31,
    );

    autoTable(doc, {
      startY: 38,
      head: [['Type', 'Date', 'Source / Category', 'Invoice No', 'Amount']],
      body: getExportRows().map((row) => [
        row.Type,
        row.Date,
        row.Source,
        row['Invoice No'],
        formatPdfAmount(row.Amount),
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [55, 71, 79] },
      margin: { top: 38, right: 14, bottom: 16, left: 14 },
      didDrawPage: () => {
        doc.setFontSize(8);
        doc.text(
          `Page ${doc.getNumberOfPages()}`,
          doc.internal.pageSize.getWidth() - 14,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'right' },
        );
      },
    });

    doc.save('income_expense_report.pdf');
  };

  return (
    <>
      {/* Header */}
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Income Expense Report</Typography>
        </Breadcrumbs>
      </Box>

      {/* Main Content */}
      <Box p={3}>
        {/* Filter Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box display="flex" alignItems="center">
            <TextField
              size="small"
              label="Start Date"
              variant="outlined"
              type="date"
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: todaysDate }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{ mr: 1 }}
            />
            <TextField
              size="small"
              label="End Date"
              variant="outlined"
              type="date"
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: todaysDate }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
          </Box>

          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              color="warning"
              startIcon={<PrintIcon />}
              disabled={!hasReportData}
              onClick={handlePrint}
            >
              Print
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<TableViewIcon />}
              disabled={!hasReportData}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<PictureAsPdfIcon />}
              disabled={!hasReportData}
              onClick={handleExportPdf}
            >
              Download PDF
            </Button>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Income Section */}
            <Typography
              variant="h6"
              sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: 'green' }}
            >
              Income
            </Typography>
            <Paper sx={{ borderRadius: 2, mb: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: 'green', color: 'white' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white' }}>Date</TableCell>
                      <TableCell sx={{ color: 'white' }}>Source</TableCell>
                      <TableCell sx={{ color: 'white' }}>Invoice No</TableCell>
                      {/* <TableCell sx={{ color: 'white' }}>MOP</TableCell> */}

                      <TableCell align="right" sx={{ color: 'white' }}>
                        Amount (₹)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      ...filteredData.restaurantInvoices.map((i) => ({
                        date: i.date,
                        source: 'Restaurant Invoice',
                        details: i.customer_name,
                        amount: i.payable_amount,
                        mop: i.mop || '-',
                        invNo: i.invoice_no,
                        url: `/restaurant/invoices/${i.documentId}`,
                      })),
                      ...filteredData.roomInvoices.map((i) => ({
                        date: i.date,
                        source: 'Room Invoice',
                        details: i.guest_name,
                        amount: i.payable_amount,
                        mop: i.mop || '-',
                        invNo: i.invoice_no,
                        url: `/front-office/room-invoice/${i.documentId}`,
                      })),
                      ...filteredData.saleEntries.map((i) => ({
                        date: i.date,
                        source: 'Inventory Sale',
                        details: i.item_name,
                        amount: i.total_price,
                        mop: '-',
                        invNo: i.invoice_no,
                        url: `/inventory/sales-entries/${i.documentId}`,
                      })),
                    ].map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{GetCustomDate(row.date)}</TableCell>
                        <TableCell>{row.source}</TableCell>
                        <TableCell>
                          <Link
                            href={row.url || '#'}
                            style={{ textDecoration: 'none' }}
                          >
                            {row.invNo}
                          </Link>
                        </TableCell>
                        {/* <TableCell>{row.mop}</TableCell> */}
                        <TableCell align="right">
                          {row.amount?.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
                      <TableCell
                        colSpan={3}
                        align="right"
                        sx={{ fontWeight: 'bold' }}
                      >
                        Total Income
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        ₹
                        {incomeTotal.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {' '}
            {/* Expense Section */}
            <Typography
              variant="h6"
              sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: 'red' }}
            >
              Expenses
            </Typography>
            <Paper sx={{ borderRadius: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: 'red', color: 'white' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white' }}>Date</TableCell>
                      <TableCell sx={{ color: 'white' }}>Category</TableCell>
                      <TableCell sx={{ color: 'white' }}>Invoice No</TableCell>
                      {/* <TableCell sx={{ color: 'white' }}>MOP</TableCell> */}
                      <TableCell align="right" sx={{ color: 'white' }}>
                        Amount (₹)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      ...filteredData.purchaseEntries.map((i) => ({
                        date: i.date,
                        category: 'Inventory Purchase',
                        description: i.vendor_name,
                        amount: i.total_price,
                        mop: '-',
                        invNo: i.invoice_no,
                        url: `/inventory/purchase-entries/${i.documentId}`,
                      })),
                      ...filteredData.otherExpenses.map((i) => ({
                        date: i.date,
                        category: 'Other Expense',
                        description: i.title,
                        amount: i.amount,
                        mop: '-',
                        invNo: i.id || '-',
                        url: `/expenses/${i.documentId}`,
                      })),
                    ].map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{GetCustomDate(row.date)}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>
                          <Link
                            href={row.url || '#'}
                            style={{ textDecoration: 'none' }}
                          >
                            {row.invNo}
                          </Link>
                        </TableCell>
                        {/* <TableCell>{row.mop}</TableCell> */}
                        <TableCell align="right">
                          {Number(row.amount)?.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#ffebee' }}>
                      <TableCell
                        colSpan={3}
                        align="right"
                        sx={{ fontWeight: 'bold' }}
                      >
                        Total Expenses
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        ₹
                        {expenseTotal.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Summary */}
        <Box mt={3} textAlign="right">
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: netBalance >= 0 ? 'green' : 'red',
            }}
          >
            Net {netBalance >= 0 ? 'Profit' : 'Loss'}: ₹
            {Math.abs(netBalance).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'none' }}>
        <IncomeExpenseReportPrint
          filteredData={filteredData}
          ref={componentRef}
          startDate={startDate}
          endDate={endDate}
          incomeTotal={incomeTotal}
          expenseTotal={expenseTotal}
          netBalance={netBalance}
        />
      </Box>
    </>
  );
};

export default IncomeExpenseReportPage;
