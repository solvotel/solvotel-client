'use client';
import { Loader } from '@/component/common';
import { useAuth } from '@/context';
import {
  GetDataList,
  GetPosDataList,
  GetSingleData,
} from '@/utils/ApiFunctions';
import { NavigateNext } from '@mui/icons-material';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';

import React, { use } from 'react';

const Page = ({ params }) => {
  const { auth } = useAuth();
  const { id } = use(params);

  const data = GetSingleData({
    endPoint: 'pos-outlets',
    auth: auth,
    id: id,
  });
  const invoices = GetPosDataList({
    endPoint: 'pos-outlet-invoices',
    auth: auth,
  });

  const paymentMethods = GetPosDataList({
    auth,
    endPoint: 'pos-payment-methods',
  });

  const menuItems = GetPosDataList({
    auth,
    endPoint: 'pos-items',
  });
  console.log(data, 'data');
  console.log(invoices, 'invoices');
  console.log(paymentMethods, 'paymentMethods');
  console.log(menuItems, 'menuItems');
  return (
    <>
      {!data || !menuItems || !paymentMethods || !invoices ? (
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
                href="/front-office/room-booking"
              >
                Room Booking
              </Link>
              <Typography color="text.primary">{data?.name}</Typography>
            </Breadcrumbs>
          </Box>
        </>
      )}
    </>
  );
};

export default Page;
