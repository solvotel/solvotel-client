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
import TableViewIcon from '@mui/icons-material/TableView';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useMemo, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { DoaReportPrint } from '@/component/printables/DoaReportPrint';
import { DobReportPrint } from '@/component/printables/DobReportPrint';
import { GetCustomDate } from '@/utils/DateFetcher';
import { exportToExcel } from '@/utils/exportToExcel';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DobDoaReportPage = () => {
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

  const monthName = new Date(2000, Number(selectedMonth) - 1).toLocaleString(
    'en',
    { month: 'long' },
  );

  const getExportRows = (list, dateField) =>
    list.map((customer) => ({
      Name: customer.name || 'N/A',
      Phone: customer.mobile || 'N/A',
      Email: customer.email || 'N/A',
      [dateField.toUpperCase()]: GetCustomDate(customer[dateField]) || '-',
      Company: customer.company_name || 'N/A',
    }));

  const handleExportExcel = (list, dateField, fileName) => {
    exportToExcel(getExportRows(list, dateField), fileName);
  };

  const handleExportPdf = (list, dateField, reportTitle, fileName) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text(`${reportTitle} Report`, 14, 16);
    doc.setFontSize(10);
    doc.text(`Month: ${monthName || '-'}`, 14, 24);

    autoTable(doc, {
      startY: 30,
      head: [['Name', 'Phone', 'Email', dateField.toUpperCase(), 'Company']],
      body: list.map((customer) => [
        customer.name || 'N/A',
        customer.mobile || 'N/A',
        customer.email || 'N/A',
        GetCustomDate(customer[dateField]) || '-',
        customer.company_name || 'N/A',
      ]),
      styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [55, 71, 79] },
      margin: { top: 30, right: 14, bottom: 16, left: 14 },
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

    doc.save(fileName);
  };

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
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          color="warning"
                          startIcon={<PrintIcon />}
                          onClick={handlePrintDob}
                        >
                          Print
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<TableViewIcon />}
                          onClick={() =>
                            handleExportExcel(dobList, 'dob', 'birthday_report')
                          }
                        >
                          Export
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<PictureAsPdfIcon />}
                          onClick={() =>
                            handleExportPdf(
                              dobList,
                              'dob',
                              'Birthday',
                              'birthday_report.pdf',
                            )
                          }
                        >
                          Download
                        </Button>
                      </Box>
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
                            ),
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
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          color="warning"
                          startIcon={<PrintIcon />}
                          onClick={handlePrintDoa}
                        >
                          Print
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<TableViewIcon />}
                          onClick={() =>
                            handleExportExcel(
                              doaList,
                              'doa',
                              'anniversary_report',
                            )
                          }
                        >
                          Export
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<PictureAsPdfIcon />}
                          onClick={() =>
                            handleExportPdf(
                              doaList,
                              'doa',
                              'Anniversary',
                              'anniversary_report.pdf',
                            )
                          }
                        >
                          Download
                        </Button>
                      </Box>
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
                            ),
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

export default DobDoaReportPage;
