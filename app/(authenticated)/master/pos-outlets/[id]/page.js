'use client';
import { Loader } from '@/component/common';
import {
  UpdatePosOutletForm,
  UpdatePosOutletLogo,
} from '@/component/updateForms';
import { useAuth } from '@/context';
import {
  GetDataList,
  GetPosDataList,
  GetSingleData,
} from '@/utils/ApiFunctions';
import { NavigateNext } from '@mui/icons-material';
import { Box, Breadcrumbs, Grid, Link, Typography } from '@mui/material';

import React, { use } from 'react';

const Page = ({ params }) => {
  const { auth } = useAuth();
  const { id } = use(params);

  const data = GetSingleData({
    endPoint: 'pos-outlets',
    auth: auth,
    id: id,
  });
  // const invoices = GetPosDataList({
  //   endPoint: 'pos-outlet-invoices',
  //   auth: auth,
  // });

  // const paymentMethods = GetPosDataList({
  //   auth,
  //   endPoint: 'pos-payment-methods',
  // });

  // const menuItems = GetPosDataList({
  //   auth,
  //   endPoint: 'pos-items',
  // });

  return (
    <>
      {!data ? (
        <Loader />
      ) : (
        <>
          <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
            <Breadcrumbs
              separator={<NavigateNext fontSize="small" />}
              aria-label="breadcrumb"
            >
              <Link underline="hover" color="inherit" href="/dashboard">
                Dashboard
              </Link>
              <Link
                underline="hover"
                color="inherit"
                href="/master/pos-outlets"
              >
                POS Outlets
              </Link>
              <Typography color="text.primary">{data?.name}</Typography>
            </Breadcrumbs>
          </Box>
          <Grid container spacing={2} p={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <UpdatePosOutletForm data={data} auth={auth} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <UpdatePosOutletLogo data={data} auth={auth} />
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};

export default Page;
