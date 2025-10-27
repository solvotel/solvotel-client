'use client';

import { useAuth } from '@/context';
import {
  DeleteData,
  GetDataList,
  CreateNewData,
  UpdateData,
} from '@/utils/ApiFunctions';
import { useState, useMemo, useRef } from 'react';

// mui
import {
  Box,
  Button,
  Breadcrumbs,
  Link,
  Typography,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControlLabel,
  Switch,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { SuccessToast } from '@/utils/GenerateToast';
import PrintIcon from '@mui/icons-material/Print';

import { Loader } from '@/component/common';
import { GetTodaysDate } from '@/utils/DateFetcher';
import { StockReportPrint } from '@/component/printables/StockReportPrint';
import { useReactToPrint } from 'react-to-print';

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
  const [filteredData, setfilteredData] = useState([]);

  const handleSearch = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter purchases within date range
    const filteredPurchases =
      purchases?.filter((pur) => {
        const d = new Date(pur.date);
        return d >= start && d <= end;
      }) || [];

    // Filter sales within date range
    const filteredSales =
      sales?.filter((sal) => {
        const d = new Date(sal.date);
        return d >= start && d <= end;
      }) || [];

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
        availableQty: purchase.totalQty - sales.totalQty || 0,
      };
    });

    setfilteredData(summary);
  };

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'stock-report',
  });

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/">
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
                >
                  Search
                </Button>
              </Box>
              <Button
                variant="contained"
                color="success"
                startIcon={<PrintIcon />}
                disabled={filteredData.length === 0}
                onClick={handlePrint}
              >
                Print
              </Button>
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
