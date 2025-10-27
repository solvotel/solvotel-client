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
  TableHead,
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
const IncomeExpenseReportPrint = React.forwardRef((props, ref) => {
  const {
    filteredData,
    startDate,
    endDate,
    incomeTotal,
    expenseTotal,
    netBalance,
  } = props;

  return (
    <Box
      ref={ref}
      sx={{
        p: 3,
        backgroundColor: '#fff',
      }}
    >
      <Typography variant="h6" textAlign={'center'} fontWeight={600} mb={2}>
        Restaurant Invoive Report
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
      {/* Income Section */}
      <Typography
        variant="h6"
        sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: 'green' }}
      >
        Income
      </Typography>

      <CustomTableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: 'green', color: 'white' }}>
            <TableRow>
              <HeadingCell sx={{ color: 'white' }}>Date</HeadingCell>
              <HeadingCell sx={{ color: 'white' }}>Source</HeadingCell>

              <HeadingCell align="right" sx={{ color: 'white' }}>
                Amount (₹)
              </HeadingCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              ...filteredData.restaurantInvoices.map((i) => ({
                date: i.date,
                source: 'Restaurant Invoice',
                details: i.customer_name,
                amount: i.payable_amount,
              })),
              ...filteredData.roomInvoices.map((i) => ({
                date: i.date,
                source: 'Room Invoice',
                details: i.guest_name,
                amount: i.payable_amount,
              })),
              ...filteredData.saleEntries.map((i) => ({
                date: i.date,
                source: 'Inventory Sale',
                details: i.item_name,
                amount: i.total_price,
              })),
            ].map((row, index) => (
              <TableRow key={index}>
                <BodyCell>{GetCustomDate(row.date)}</BodyCell>
                <BodyCell>{row.source}</BodyCell>

                <BodyCell align="right">
                  {row.amount?.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </BodyCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
              <BodyCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
                Total Income
              </BodyCell>
              <BodyCell align="right" sx={{ fontWeight: 'bold' }}>
                ₹
                {incomeTotal.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </BodyCell>
            </TableRow>
          </TableBody>
        </Table>
      </CustomTableContainer>

      {/* Expense Section */}
      <Typography
        variant="h6"
        sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: 'red' }}
      >
        Expenses
      </Typography>

      <CustomTableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: 'red', color: 'white' }}>
            <TableRow>
              <HeadingCell sx={{ color: 'white' }}>Date</HeadingCell>
              <HeadingCell sx={{ color: 'white' }}>Category</HeadingCell>

              <HeadingCell align="right" sx={{ color: 'white' }}>
                Amount (₹)
              </HeadingCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              ...filteredData.purchaseEntries.map((i) => ({
                date: i.date,
                category: 'Inventory Purchase',
                description: i.vendor_name,
                amount: i.total_price,
              })),
              ...filteredData.otherExpenses.map((i) => ({
                date: i.date,
                category: 'Other Expense',
                description: i.title,
                amount: i.amount,
              })),
            ].map((row, index) => (
              <TableRow key={index}>
                <BodyCell>{GetCustomDate(row.date)}</BodyCell>
                <BodyCell>{row.category}</BodyCell>

                <BodyCell align="right">
                  {Number(row.amount)?.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </BodyCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: '#ffebee' }}>
              <BodyCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
                Total Expenses
              </BodyCell>
              <BodyCell align="right" sx={{ fontWeight: 'bold' }}>
                ₹
                {expenseTotal.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </BodyCell>
            </TableRow>
          </TableBody>
        </Table>
      </CustomTableContainer>
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
      <Typography variant="body2" mt={2}>
        Report generate from: www.solvotel.com
      </Typography>
    </Box>
  );
});

IncomeExpenseReportPrint.displayName = 'IncomeExpenseReportPrint'; // 👈 required

export { IncomeExpenseReportPrint };
