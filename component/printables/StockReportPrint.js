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
const StockReportPrint = React.forwardRef((props, ref) => {
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
        Inventory Stock Report
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
                'Code',
                'Name',
                'Group',
                'Unit',
                'Stock In',
                'Stock Out',
                'Stock Available',
              ].map((item, index) => (
                <HeadingCell key={index} sx={{ fontWeight: 'bold' }}>
                  {item}
                </HeadingCell>
              ))}
            </TableRow>
            {filteredData?.map((row, index) => (
              <TableRow key={index}>
                <BodyCell>{row.code}</BodyCell>
                <BodyCell>{row.name}</BodyCell>
                <BodyCell>{row.group}</BodyCell>
                <BodyCell>{row.unit}</BodyCell>
                <BodyCell>{row.purchaseQty}</BodyCell>
                <BodyCell>{row.salesQty}</BodyCell>
                <BodyCell>{row.availableQty}</BodyCell>
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

StockReportPrint.displayName = 'StockReportPrint'; // 👈 required

export { StockReportPrint };
