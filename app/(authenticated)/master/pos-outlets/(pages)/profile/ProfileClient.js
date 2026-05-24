'use client';
import { Loader } from '@/component/common';
import {
  UpdatePosOutletForm,
  UpdatePosOutletLogo,
} from '@/component/updateForms';
import { useAuth } from '@/context';
import { GetSingleData } from '@/utils/ApiFunctions';
import { NavigateNext } from '@mui/icons-material';
import { Box, Breadcrumbs, Grid, Link, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';

import React, { Suspense } from 'react';

const ProfileClient = () => {
  const { auth } = useAuth();
  const searchParams = useSearchParams();
  const outletId = searchParams.get('outletId');

  const data = GetSingleData({
    endPoint: 'pos-outlets',
    auth: auth,
    id: outletId,
  });

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

export default ProfileClient;
