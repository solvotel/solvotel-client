'use client';

import {
  AssessmentOutlined,
  Dashboard,
  Inventory,
  Money,
} from '@mui/icons-material';
import { Box, Grid } from '@mui/material';
import { Banknote, Receipt, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const Layout = ({ children }) => {
  const searchParams = useSearchParams();
  const outletId = searchParams.get('outletId');

  const menuItems = [
    {
      label: 'Dashboard',
      icon: <Dashboard size={18} />,
      href: `/master/pos-outlets/dashboard?outletId=${outletId}`,
    },
    {
      label: 'Invoices',
      icon: <Receipt size={18} />,
      href: `/master/pos-outlets/invoices?outletId=${outletId}`,
    },
    {
      label: 'Manage Items',
      icon: <Inventory size={18} />,
      href: `/master/pos-outlets/manage-items?outletId=${outletId}`,
    },
    {
      label: 'Payment Methods',
      icon: <Money size={18} />,
      href: `/master/pos-outlets/payment-methods?outletId=${outletId}`,
    },
    {
      label: 'Invoice Report',
      icon: <Receipt size={18} />,
      href: `/master/pos-outlets/invoice-report?outletId=${outletId}`,
    },
    {
      label: 'Collection Report',
      icon: <AssessmentOutlined size={18} />,
      href: `/master/pos-outlets/collection-report?outletId=${outletId}`,
    },
    {
      label: 'Due Report',
      icon: <Banknote size={18} />,
      href: `/master/pos-outlets/due-report?outletId=${outletId}`,
    },
    {
      label: 'Profile',
      icon: <User size={18} />,
      href: `/master/pos-outlets/profile?outletId=${outletId}`,
    },
  ];
  return (
    <>
      <Box
        sx={{
          p: 2,
          backgroundColor: '#eaf0ff',
          borderRadius: 10,
          m: 2,
        }}
      >
        <Grid container spacing={2}>
          {menuItems.map((item, index) => (
            <Grid key={index} size={{ xs: 6, md: 1.5 }}>
              <Link
                href={item.href}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{
                    borderRadius: 1,
                    fontSize: 13,
                  }}
                >
                  {item.icon}
                  {item.label}
                </Box>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>

      {children}
    </>
  );
};

export default Layout;
