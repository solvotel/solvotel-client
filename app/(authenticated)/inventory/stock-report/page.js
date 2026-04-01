'use client';

import { useAuth } from '@/context';
import { GetDataList } from '@/utils/ApiFunctions';
import { useState, useRef } from 'react';

// mui
import {
  Box,
  Button,
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
} from '@mui/material';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Loader } from '@/component/common';
import { GetTodaysDate } from '@/utils/DateFetcher';
import { StockReportPrint } from '@/component/printables/StockReportPrint';
import { useReactToPrint } from 'react-to-print';
import { exportToExcel } from '@/utils/exportToExcel';

const Page = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const data = GetDataList({
    auth,
    endPoint: 'inventory-items',
  });

  const purchases = GetDataList({
    auth,
    endPoint: 'inventory-purchases',
  });

  const sales = GetDataList({
    auth,
    endPoint: 'inventory-sales',
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(todaysDate);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setfilteredData] = useState([]);
  const [dataToExport, setDataToExport] = useState([]);

  const handleSearch = () => {
    if ((!startDate || !endDate) && !searchText.trim()) return;

    const hasDateRange = Boolean(startDate && endDate);
    let start;
    let end;
    if (hasDateRange) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    const filterByDate = (dateValue) => {
      if (!hasDateRange) return true;
      const d = new Date(dateValue);
      return d >= start && d <= end;
    };

    const filteredPurchases =
      purchases?.filter((pur) => filterByDate(pur.date)) || [];
    const filteredSales = sales?.filter((sal) => filterByDate(sal.date)) || [];

    // Helper to group and sum with extra inventory_item fields
    const groupTotals = (data) => {
      const groups = {};

      data.forEach((item) => {
        const inv = item?.inventory_item;
        if (!inv?.name) return;

        if (!groups[inv.name]) {
          groups[inv.name] = {
            name: inv.name,
            code: inv.code,
            group: inv.group,
            unit: inv.unit,
            totalQty: 0,
          };
        }

        groups[inv.name].totalQty += item?.qty || 0;
      });

      return groups;
    };

    const purchaseTotals = groupTotals(filteredPurchases);
    const salesTotals = groupTotals(filteredSales);

    // Merge both purchase and sales groups by product name
    const allItems = new Set([
      ...Object.keys(purchaseTotals),
      ...Object.keys(salesTotals),
    ]);

    const summary = Array.from(allItems).map((name) => {
      const purchase = purchaseTotals[name] || {};
      const sales = salesTotals[name] || {};

      return {
        code: purchase.code || sales.code,
        name,
        group: purchase.group || sales.group,
        unit: purchase.unit || sales.unit,
        purchaseQty: purchase.totalQty || 0,
        salesQty: sales.totalQty || 0,
        availableQty: (purchase.totalQty || 0) - (sales.totalQty || 0),
      };
    });

    const keyword = searchText.trim().toLowerCase();
    const filteredSummary = keyword
      ? summary.filter((item) =>
          [item.code, item.name, item.group, item.unit]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(keyword)),
        )
      : summary;

    setDataToExport(filteredSummary);
    setfilteredData(filteredSummary);
  };

  const handleReset = () => {
    setSearchText('');
    setStartDate('');
    setEndDate(todaysDate);
    setfilteredData([]);
    setDataToExport([]);
  };

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'stock-report',
  });

  const handleExport = () => {
    exportToExcel(dataToExport, 'stock_report');
  };

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Inventory Stock Report</Typography>
        </Breadcrumbs>
      </Box>
      {!data || !purchases || !sales ? (
        <Loader />
      ) : (
        <>
          <Box p={3}>
            {/* Header Section */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  size="small"
                  label="Search (Code/Name/Group/Unit)"
                  variant="outlined"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  sx={{ mr: 1, minWidth: 230 }}
                />
                <TextField
                  size="small"
                  label="Start Date"
                  variant="outlined"
                  type="date"
                  InputLabelProps={{ shrink: true }} // 👈 fixes label overlap
                  inputProps={{ max: todaysDate }} // 👈 move `max` inside inputProps
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  sx={{ mr: 1 }}
                />
                <TextField
                  size="small"
                  label="End Date"
                  variant="outlined"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  sx={{ mr: 1 }}
                  InputLabelProps={{ shrink: true }} // 👈 fixes label overlap
                  inputProps={{ max: todaysDate }} // 👈 move `max` inside inputProps
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSearch}
                  sx={{ mr: 1 }}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<PrintIcon />}
                  disabled={filteredData.length === 0}
                  onClick={handlePrint}
                  sx={{ mr: 1 }}
                >
                  Print
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={filteredData.length === 0}
                  variant="contained"
                  color="success"
                  startIcon={<FileDownloadIcon />}
                >
                  Export
                </Button>
              </Box>
            </Box>

            {/* Data Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    {[
                      'Code',
                      'Name',
                      'Group',
                      'Unit',
                      'Stock In',
                      'Stock Out',
                      'Stock Available',
                    ].map((item, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                        {item}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData?.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.code}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.group}</TableCell>
                      <TableCell>{row.unit}</TableCell>
                      <TableCell>{row.purchaseQty}</TableCell>
                      <TableCell>{row.salesQty}</TableCell>
                      <TableCell>{row.availableQty}</TableCell>
                    </TableRow>
                  ))}
                  {filteredData?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No stock report found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ display: 'none' }}>
            <StockReportPrint
              filteredData={filteredData}
              ref={componentRef}
              startDate={startDate}
              endDate={endDate}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default Page;
