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
const CustomerLeadSheetPrint = React.forwardRef((props, ref) => {
  const { filteredData } = props;

  return (
    <Box
      ref={ref}
      sx={{
        p: 3,
        backgroundColor: '#fff',
      }}
    >
      <Typography
        variant="h6"
        textAlign={'center'}
        fontWeight={600}
        mb={2}
      ></Typography>

      <CustomTableContainer>
        <Table>
          <TableBody>
            <TableRow>
              {['Name', 'Phone', 'Email'].map((item, index) => (
                <HeadingCell key={index} sx={{ fontWeight: 'bold' }}>
                  {item}
                </HeadingCell>
              ))}
            </TableRow>
            {filteredData?.map((row, index) => {
              return (
                <TableRow key={index}>
                  <BodyCell>{row.name}</BodyCell>
                  <BodyCell>{row.phone || '-'}</BodyCell>
                  <BodyCell>{row.email || '-'}</BodyCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CustomTableContainer>
      <Typography variant="body2" mt={2}>
        Report generate from: www.solvotel.com
      </Typography>
    </Box>
  );
});

CustomerLeadSheetPrint.displayName = 'CustomerLeadSheetPrint'; // 👈 required

export { CustomerLeadSheetPrint };
