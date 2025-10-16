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
const DoaReportPrint = React.forwardRef((props, ref) => {
  const { filteredData, selectedMonth } = props;
  const formatMonthYear = (value) => {
    if (!value) return '';
    const [year, month] = value.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };
  return (
    <Box
      ref={ref}
      sx={{
        p: 3,
        backgroundColor: '#fff',
      }}
    >
      <Typography variant="h6" textAlign={'center'} fontWeight={600} mb={2}>
        Anniversary List
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Typography>
          Month:{' '}
          <span style={{ fontWeight: 600 }}>
            {formatMonthYear(selectedMonth)}
          </span>
        </Typography>
      </Box>
      <CustomTableContainer>
        <Table>
          <TableBody>
            <TableRow>
              {['Name', 'Phone', 'Email', 'DOB', 'Company'].map(
                (item, index) => (
                  <HeadingCell key={index} sx={{ fontWeight: 'bold' }}>
                    {item}
                  </HeadingCell>
                )
              )}
            </TableRow>
            {filteredData?.map((row, index) => (
              <TableRow key={index}>
                <BodyCell>{row.name}</BodyCell>
                <BodyCell>{row.mobile}</BodyCell>
                <BodyCell>{row.email}</BodyCell>
                <BodyCell>{GetCustomDate(row.doa)}</BodyCell>
                <BodyCell>{row.company_name}</BodyCell>
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

DoaReportPrint.displayName = 'DoaReportPrint'; // 👈 required

export { DoaReportPrint };
