'use client';

import { useAuth } from '@/context';
import { GetDataList } from '@/utils/ApiFunctions';
import { Loader } from '@/component/common';

import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Grid,
  MenuItem,
} from '@mui/material';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PrintIcon from '@mui/icons-material/Print';
import { useMemo, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { DoaReportPrint } from '@/component/printables/DoaReportPrint';
import { DobReportPrint } from '@/component/printables/DobReportPrint';
import { GetCustomDate } from '@/utils/DateFetcher';

const Page = () => {
  const { auth } = useAuth();

  const data = GetDataList({
    auth,
    endPoint: 'customers',
  });

  const [selectedMonth, setSelectedMonth] = useState('');

  // Helper: get month from date (yyyy-mm-dd)
  const getMonth = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.getMonth(); // 0-based
  };

  const dobList = useMemo(() => {
    if (!data || !selectedMonth) return [];
    const month = parseInt(selectedMonth, 10) - 1; // 0-based
    return data.filter((c) => getMonth(c.dob) === month);
  }, [data, selectedMonth]);

  const doaList = useMemo(() => {
    if (!data || !selectedMonth) return [];
    const month = parseInt(selectedMonth, 10) - 1; // 0-based
    return data.filter((c) => getMonth(c.doa) === month);
  }, [data, selectedMonth]);

  const dobComponentRef = useRef(null);
  const handlePrintDob = useReactToPrint({
    contentRef: dobComponentRef,
    documentTitle: 'doa-dob-report',
  });
  const doaComponentRef = useRef(null);
  const handlePrintDoa = useReactToPrint({
    contentRef: doaComponentRef,
    documentTitle: 'doa-dob-report',
  });

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">DOB & DOA Report</Typography>
        </Breadcrumbs>
      </Box>

      {!data ? (
        <Loader />
      ) : (
        <>
          <Box p={3}>
            {/* Month Selector */}
            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                select
                label="Select Month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                sx={{ width: 220 }}
              >
                {[
                  { id: 1, name: 'January' },
                  { id: 2, name: 'February' },
                  { id: 3, name: 'March' },
                  { id: 4, name: 'April' },
                  { id: 5, name: 'May' },
                  { id: 6, name: 'June' },
                  { id: 7, name: 'July' },
                  { id: 8, name: 'August' },
                  { id: 9, name: 'September' },
                  { id: 10, name: 'October' },
                  { id: 11, name: 'November' },
                  { id: 12, name: 'December' },
                ].map((m) => (
                  <MenuItem key={m.id} value={m.id.toString()}>
                    {m.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                {/* DOB Table */}
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="h6">Birthdays</Typography>
                    {dobList.length > 0 && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<PrintIcon />}
                        onClick={handlePrintDob}
                      >
                        Print
                      </Button>
                    )}
                  </Box>
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                          {['Name', 'Phone', 'Email', 'DOB', 'Company'].map(
                            (h) => (
                              <TableCell key={h} sx={{ fontWeight: 'bold' }}>
                                {h}
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dobList.length > 0 ? (
                          dobList.map((row) => (
                            <TableRow key={row.documentId}>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.mobile}</TableCell>
                              <TableCell>{row.email}</TableCell>
                              <TableCell>{GetCustomDate(row.dob)}</TableCell>
                              <TableCell>{row.company_name}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              No birthdays in this month
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {/* DOA Table */}
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="h6">Anniversaries</Typography>
                    {doaList.length > 0 && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<PrintIcon />}
                        onClick={handlePrintDoa}
                      >
                        Print
                      </Button>
                    )}
                  </Box>
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                          {['Name', 'Phone', 'Email', 'DOA', 'Company'].map(
                            (h) => (
                              <TableCell key={h} sx={{ fontWeight: 'bold' }}>
                                {h}
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {doaList.length > 0 ? (
                          doaList.map((row) => (
                            <TableRow key={row.documentId}>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.mobile}</TableCell>
                              <TableCell>{row.email}</TableCell>
                              <TableCell>{GetCustomDate(row.doa)}</TableCell>
                              <TableCell>{row.company_name}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              No anniversaries in this month
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ display: 'none' }}>
            <DoaReportPrint
              filteredData={doaList}
              ref={doaComponentRef}
              selectedMonth={selectedMonth}
            />
          </Box>
          <Box sx={{ display: 'none' }}>
            <DobReportPrint
              filteredData={dobList}
              ref={dobComponentRef}
              selectedMonth={selectedMonth}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default Page;
