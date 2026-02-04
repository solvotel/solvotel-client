'use client';

import { useAuth } from '@/context';
import {
  DeleteData,
  GetDataList,
  CreateNewData,
  UpdateData,
} from '@/utils/ApiFunctions';
import { useState, useMemo } from 'react';

// mui
import {
  Box,
  Button,
  Breadcrumbs,
  Link,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { Loader } from '@/component/common';
import { CheckUserPermission } from '@/utils/UserPermissions';

const Page = () => {
  const { auth } = useAuth();
  const permissions = CheckUserPermission(auth?.user?.permissions);
  const data = GetDataList({
    auth,
    endPoint: 'pos-outlets',
  });
  const [search, setSearch] = useState('');
  // Filtered list
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [data, search]);

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
          <Typography color="text.primary">POS Outlets</Typography>
        </Breadcrumbs>
      </Box>

      {!data ? (
        <Loader />
      ) : (
        <Box p={3}>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <TextField
              size="small"
              label="Search by name"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>

          {/* Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  {[
                    'Name',
                    'Phone',
                    'Alt Phone',
                    'Address',
                    'GSTIN',
                    'Created By',
                    'Updated By',
                    'Actions',
                  ].map((item, index) => (
                    <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData?.map((row) => (
                  <TableRow key={row.documentId}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.alt_phone}</TableCell>
                    <TableCell>
                      {row.address_line_1}, {row.address_line_2}, {row.city},{' '}
                      {row.state},{' '}
                    </TableCell>
                    <TableCell>{row.gst_no}</TableCell>

                    <TableCell>{row.user_created}</TableCell>
                    <TableCell>{row.user_updated || '-'}</TableCell>
                    <TableCell sx={{ width: '100px' }}>
                      <Tooltip title="Edit">
                        <Button
                          color="secondary"
                          variant="contained"
                          href={`/master/pos-outlets/${row.documentId}`}
                          size="small"
                          disabled={!permissions.canUpdate}
                          startIcon={<EditIcon fontSize="inherit" />}
                        >
                          Manage
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No room found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </>
  );
};

export default Page;
