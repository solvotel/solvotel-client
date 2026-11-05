'use client';

import React from 'react';
import {
  Box,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';

const HeadingCell = styled(TableCell)`
  border: 1px solid black;
  padding: 3px 5px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
`;

const BodyCell = styled(TableCell)`
  border: 1px solid black;
  padding: 3px 5px;
  font-size: 11px;
  text-align: center;
`;

const formatDate = (date) => {
  const [year, month, day] = String(date || '').split('T')[0].split('-');
  return year && month && day ? `${day}-${month}-${year}` : '';
};

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date
    .toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    })
    .replace(',', '');
};

export const HousekeepingReportPrint = React.forwardRef(
  ({ rows, startDate, endDate }, ref) => {
    const cleanCount = rows.filter(
      (row) => row.status.toLowerCase() === 'clean',
    ).length;

    return (
      <Box ref={ref} sx={{ p: 3, bgcolor: '#fff' }}>
        <Typography variant="h6" align="center" fontWeight={700} mb={1}>
          Housekeeping Cleaning Report
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Typography>
            Start Date: <strong>{formatDate(startDate)}</strong>
          </Typography>
          <Typography>
            End Date: <strong>{formatDate(endDate)}</strong>
          </Typography>
        </Box>
        <Typography variant="body2" mb={1}>
          Total Tasks: <strong>{rows.length}</strong> &nbsp; Clean:{' '}
          <strong>{cleanCount}</strong> &nbsp; Dirty:{' '}
          <strong>{rows.length - cleanCount}</strong>
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                {[
                  'Date',
                  'Room',
                  'Booking ID',
                  'Guest',
                  'Cleaned By',
                  'Cleaned At',
                ].map((heading) => (
                  <HeadingCell key={heading}>{heading}</HeadingCell>
                ))}
              </TableRow>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <BodyCell>{formatDate(row.task_date)}</BodyCell>
                  <BodyCell>{row.room}</BodyCell>
                  <BodyCell>{row.booking_id || '-'}</BodyCell>
                  <BodyCell>{row.customer_name}</BodyCell>
                  <BodyCell>{row.cleaned_by || '-'}</BodyCell>
                  <BodyCell>{formatDateTime(row.time_stamp) || '-'}</BodyCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="caption" display="block" mt={1}>
          Report generated from: www.solvotel.com
        </Typography>
      </Box>
    );
  },
);

HousekeepingReportPrint.displayName = 'HousekeepingReportPrint';
