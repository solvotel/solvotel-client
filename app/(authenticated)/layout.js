'use client';
import { Footer, Header } from '@/component/common';
import AccountBlocked from '@/component/common/AccountBlocked';
import { useAuth } from '@/context';
import { GetSingleData } from '@/utils/ApiFunctions';
import { Box } from '@mui/material';

const Layout = ({ children }) => {
  const { auth } = useAuth();

  const data = GetSingleData({
    endPoint: 'hotels',
    auth: auth,
    id: auth?.user?.hotel_id,
  });

  if (data && data?.blocked) {
    return <AccountBlocked />;
  }
  return (
    <>
      <Header />
      <Box sx={{ minHeight: '83vh' }}>{children}</Box>
      <Footer />
    </>
  );
};

export default Layout;
